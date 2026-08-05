/** حراسة رفع الملفات — نوع حقيقي، امتدادات خطرة، أنماط هجومية */

const DANGEROUS_EXT = new Set([
  '.exe', '.dll', '.bat', '.cmd', '.com', '.msi', '.scr', '.ps1', '.vbs', '.js',
  '.jar', '.apk', '.sh', '.bash', '.php', '.phtml', '.asp', '.aspx', '.jsp',
  '.cgi', '.pl', '.py', '.rb', '.htaccess', '.wasm', '.iso', '.img', '.dmg',
  '.svg', // SVG قد يحمل سكربت
])

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'text/plain',
  'application/pdf',
  'application/json',
])

/** توقيعات سحرية للأنواع المسموحة */
const MAGIC: { mime: string; test: (b: Buffer) => boolean }[] = [
  { mime: 'image/jpeg', test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: 'image/png',
    test: (b) =>
      b.length > 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47,
  },
  {
    mime: 'image/gif',
    test: (b) => b.length > 6 && b.slice(0, 3).toString() === 'GIF',
  },
  {
    mime: 'image/webp',
    test: (b) =>
      b.length > 12 &&
      b.slice(0, 4).toString() === 'RIFF' &&
      b.slice(8, 12).toString() === 'WEBP',
  },
  {
    mime: 'video/mp4',
    test: (b) => b.length > 12 && (b.slice(4, 8).toString() === 'ftyp' || b.includes(Buffer.from('ftyp'))),
  },
  {
    mime: 'video/webm',
    test: (b) => b.length > 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3,
  },
  {
    mime: 'application/pdf',
    test: (b) => b.length > 5 && b.slice(0, 5).toString() === '%PDF-',
  },
  {
    mime: 'audio/mpeg',
    test: (b) =>
      (b.length > 3 && b[0] === 0xff && (b[1] & 0xe0) === 0xe0) ||
      (b.length > 3 && b.slice(0, 3).toString() === 'ID3'),
  },
]

/** أنماط برمجيات خبيثة / سكربتات داخل الملفات */
const MALWARE_PATTERNS = [
  /<\?php/i,
  /<script[\s>]/i,
  /javascript:/i,
  /eval\s*\(/i,
  /document\.cookie/i,
  /powershell/i,
  /cmd\.exe/i,
  /\/bin\/(?:ba)?sh/i,
  /CreateObject\s*\(/i,
  /wget\s+http/i,
  /curl\s+http/i,
  /base64_decode\s*\(/i,
  /FromBase64String/i,
  /__import__\s*\(\s*['\"]os['\"]/i,
]

/** كلمات إباحية صريحة في الاسم أو النص (طبقة أولية — ليست بديلاً عن مراجعة بشرية) */
const NSFW_NAME = [
  'porn', 'xxx', 'sex', 'nude', 'naked', 'nsfw', 'hentai', 'onlyfans',
  'سكس', 'اباحي', 'إباحي', 'عاري', 'بورن',
]

export type GuardResult =
  | { ok: true; mime: string; safeName: string }
  | { ok: false; code: string; message: string; severity: 'medium' | 'high' | 'critical' }

function extOf(name: string) {
  const n = (name || '').toLowerCase()
  const parts = n.split('.')
  if (parts.length < 2) return ''
  return '.' + parts[parts.length - 1].replace(/[^a-z0-9]/g, '')
}

function allExts(name: string) {
  return (name || '')
    .toLowerCase()
    .split('.')
    .slice(1)
    .map((e) => '.' + e.replace(/[^a-z0-9]/g, ''))
}

export function sanitizeFilename(name: string) {
  return (name || 'file')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 120)
}

export function guardUpload(opts: {
  originalName: string
  claimedMime: string
  buffer: Buffer
}): GuardResult {
  const originalName = opts.originalName || 'file'
  const claimed = (opts.claimedMime || '').toLowerCase().split(';')[0].trim()
  const buf = opts.buffer

  // مسار / أسماء هجومية
  if (
    originalName.includes('..') ||
    originalName.includes('/') ||
    originalName.includes('\\') ||
    originalName.includes('\0')
  ) {
    return {
      ok: false,
      code: 'path_traversal',
      message: 'اسم ملف يحتوي مسار غير آمن',
      severity: 'high',
    }
  }

  const exts = allExts(originalName)
  for (const e of exts) {
    if (DANGEROUS_EXT.has(e)) {
      return {
        ok: false,
        code: 'dangerous_ext',
        message: `امتداد محظور: ${e}`,
        severity: 'critical',
      }
    }
  }

  // أسماء إباحية
  const lowName = originalName.toLowerCase()
  if (NSFW_NAME.some((w) => lowName.includes(w))) {
    return {
      ok: false,
      code: 'nsfw_suspect',
      message: 'اسم الملف مرفوض بموجب سياسة المحتوى',
      severity: 'high',
    }
  }

  // اكتشاف النوع من التوقيع
  let detected = ''
  for (const m of MAGIC) {
    try {
      if (m.test(buf)) {
        detected = m.mime
        break
      }
    } catch {
      /* */
    }
  }

  // نص عادي / json
  if (!detected) {
    const head = buf.slice(0, Math.min(buf.length, 4096)).toString('utf8')
    const printable = head.replace(/[\x09\x0a\x0d\x20-\x7e\u0600-\u06FF]/g, '')
    if (claimed === 'text/plain' || claimed === 'application/json') {
      if (printable.length > head.length * 0.3 && buf.length > 20) {
        return {
          ok: false,
          code: 'invalid_type',
          message: 'محتوى نصي غير صالح أو مشبوه',
          severity: 'medium',
        }
      }
      detected = claimed === 'application/json' ? 'application/json' : 'text/plain'
    }
  }

  if (!detected) {
    return {
      ok: false,
      code: 'invalid_type',
      message: 'تعذر التحقق من نوع الملف الحقيقي — مرفوض',
      severity: 'high',
    }
  }

  if (!ALLOWED_MIME.has(detected)) {
    return {
      ok: false,
      code: 'invalid_type',
      message: `النوع غير مسموح: ${detected}`,
      severity: 'high',
    }
  }

  // تعارض MIME المعلن مع الحقيقي (تزوير)
  if (
    claimed &&
    claimed !== 'application/octet-stream' &&
    !claimed.startsWith(detected.split('/')[0]) &&
    claimed !== detected
  ) {
    // تسامح بسيط image/jpg vs image/jpeg
    const soft =
      (claimed.includes('jpeg') && detected.includes('jpeg')) ||
      (claimed.includes('png') && detected.includes('png'))
    if (!soft) {
      return {
        ok: false,
        code: 'mime_mismatch',
        message: `تعارض نوع الملف (معلن: ${claimed} / حقيقي: ${detected})`,
        severity: 'critical',
      }
    }
  }

  // فحص أنماط خبيثة داخل الملفات النصية أو الرؤوس
  const sample = buf.slice(0, Math.min(buf.length, 64 * 1024)).toString('latin1')
  for (const re of MALWARE_PATTERNS) {
    if (re.test(sample)) {
      return {
        ok: false,
        code: 'malware_suspect',
        message: 'اكتشاف نمط يشبه برمجية أو سكربت خبيث',
        severity: 'critical',
      }
    }
  }

  // صور: رفض إن وُجدت وسوم سكربت داخل بيانات (نادر)
  if (detected.startsWith('image/') && /<script/i.test(sample)) {
    return {
      ok: false,
      code: 'malware_suspect',
      message: 'محتوى سكربت داخل ملف صورة',
      severity: 'critical',
    }
  }

  return {
    ok: true,
    mime: detected,
    safeName: sanitizeFilename(originalName),
  }
}

/** حد بسيط للمحاولات حسب IP (ذاكرة العملية) */
const hits = new Map<string, { n: number; t: number }>()

export function rateLimitIp(ip: string, max = 20, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now()
  const row = hits.get(ip) || { n: 0, t: now }
  if (now - row.t > windowMs) {
    hits.set(ip, { n: 1, t: now })
    return true
  }
  row.n += 1
  hits.set(ip, row)
  return row.n <= max
}
