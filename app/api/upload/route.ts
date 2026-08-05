import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'
import { guardUpload, rateLimitIp } from '@/lib/upload-guard'
import { logSecurityEvent } from '@/lib/security-log'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_BYTES = 8 * 1024 * 1024

function clientIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)

  if (!rateLimitIp(ip, 25, 10 * 60 * 1000)) {
    await logSecurityEvent({
      type: 'rate_limit',
      severity: 'high',
      message: 'تجاوز حد محاولات رفع الملفات',
      ip,
    })
    return NextResponse.json(
      { ok: false, error: 'محاولات كثيرة. حاول لاحقاً.' },
      { status: 429 }
    )
  }

  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ ok: false, error: 'لا يوجد ملف' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      await logSecurityEvent({
        type: 'oversized',
        severity: 'medium',
        message: `ملف أكبر من الحد: \( {file.name} ( \){file.size} بايت)`,
        ip,
        meta: { name: file.name, size: file.size },
      })
      return NextResponse.json({ ok: false, error: 'الحد الأقصى 8MB' }, { status: 400 })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    const guard = guardUpload({
      originalName: file.name,
      claimedMime: file.type || '',
      buffer: buf,
    })

    if (!guard.ok) {
      const typeMap: Record<string, any> = {
        path_traversal: 'path_traversal',
        dangerous_ext: 'malware_suspect',
        nsfw_suspect: 'nsfw_suspect',
        invalid_type: 'invalid_type',
        mime_mismatch: 'attack_pattern',
        malware_suspect: 'malware_suspect',
      }
      await logSecurityEvent({
        type: typeMap[guard.code] || 'blocked_upload',
        severity: guard.severity,
        message: `رفع مرفوض: ${guard.message} — الملف: ${file.name}`,
        ip,
        meta: { code: guard.code, name: file.name, claimed: file.type },
      })
      return NextResponse.json(
        {
          ok: false,
          error: 'تم رفض الملف لأسباب أمنية. لا يُسمح بالملفات الخطرة أو المخالفة.',
          code: guard.code,
        },
        { status: 400 }
      )
    }

    const id = randomBytes(12).toString('hex')
    const ext =
      path.extname(guard.safeName).toLowerCase() ||
      (guard.mime === 'image/jpeg'
        ? '.jpg'
        : guard.mime === 'image/png'
          ? '.png'
          : guard.mime === 'application/pdf'
            ? '.pdf'
            : '.bin')
    const filename = `\( {Date.now()}- \){id}${ext}`

    const isVercel = Boolean(process.env.VERCEL)
    const uploadDir = isVercel
      ? path.join('/tmp', 'uploads')
      : path.join(process.cwd(), 'public', 'uploads')

    await fs.mkdir(uploadDir, { recursive: true })
    await fs.writeFile(path.join(uploadDir, filename), buf)

    const url = isVercel
      ? `/api/upload?file=${encodeURIComponent(filename)}`
      : `/uploads/${filename}`

    return NextResponse.json({
      ok: true,
      url,
      filename,
      originalName: guard.safeName,
      size: file.size,
      mime: guard.mime,
      storage: isVercel ? 'tmp' : 'public',
    })
  } catch (e: any) {
    await logSecurityEvent({
      type: 'attack_pattern',
      severity: 'medium',
      message: `خطأ أثناء الرفع: ${e?.message || 'unknown'}`,
      ip,
    })
    return NextResponse.json({ ok: false, error: 'فشل الرفع' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const file = req.nextUrl.searchParams.get('file') || ''
    if (!file || file.includes('..') || file.includes('/') || file.includes('\\')) {
      await logSecurityEvent({
        type: 'path_traversal',
        severity: 'high',
        message: `محاولة قراءة ملف غير آمنة: ${file}`,
        ip: clientIp(req),
      })
      return NextResponse.json({ ok: false, error: 'اسم غير صالح' }, { status: 400 })
    }
    const isVercel = Boolean(process.env.VERCEL)
    const full = isVercel
      ? path.join('/tmp', 'uploads', file)
      : path.join(process.cwd(), 'public', 'uploads', file)
    const data = await fs.readFile(full)
    const ext = path.extname(file).toLowerCase()
    const types: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
      '.txt': 'text/plain',
      '.pdf': 'application/pdf',
    }
    return new NextResponse(data, {
      headers: {
        'Content-Type': types[ext] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'غير موجود' }, { status: 404 })
  }
}
