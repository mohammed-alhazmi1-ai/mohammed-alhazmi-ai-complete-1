import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_BYTES = 10 * 1024 * 1024

function safeExt(name: string, mime: string) {
  const fromName = path.extname(name || '').toLowerCase().replace(/[^.a-z0-9]/gi, '')
  if (fromName && fromName.length <= 8) return fromName
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'audio/mpeg': '.mp3',
    'text/plain': '.txt',
    'application/pdf': '.pdf',
    'application/json': '.json',
  }
  return map[mime] || '.bin'
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ ok: false, error: 'لا يوجد ملف' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: 'الحد الأقصى 10MB' }, { status: 400 })
    }

    const mime = file.type || 'application/octet-stream'
    const buf = Buffer.from(await file.arrayBuffer())
    const id = randomBytes(12).toString('hex')
    const ext = safeExt(file.name, mime)
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
      originalName: file.name,
      size: file.size,
      mime,
      storage: isVercel ? 'tmp' : 'public',
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'فشل الرفع' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const file = req.nextUrl.searchParams.get('file') || ''
    if (!file || file.includes('..') || file.includes('/')) {
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
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'غير موجود' }, { status: 404 })
  }
}
