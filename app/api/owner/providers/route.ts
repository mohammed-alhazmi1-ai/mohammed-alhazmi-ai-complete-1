import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

async function testOpenAI() {
  const key = process.env.OPENAI_API_KEY || ''
  if (!key) return { id: 'openai', ok: false, message: 'لا يوجد OPENAI_API_KEY' }
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    })
    if (!res.ok) {
      const t = await res.text()
      return { id: 'openai', ok: false, message: `HTTP ${res.status}: ${t.slice(0, 120)}` }
    }
    return { id: 'openai', ok: true, message: 'متصل — يستجيب' }
  } catch (e: any) {
    return { id: 'openai', ok: false, message: e?.message || 'فشل الاتصال' }
  }
}

async function testGemini() {
  const key = process.env.GEMINI_API_KEY || ''
  if (!key) return { id: 'gemini', ok: false, message: 'لا يوجد GEMINI_API_KEY' }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    const res = await fetch(url)
    if (!res.ok) {
      const t = await res.text()
      return { id: 'gemini', ok: false, message: `HTTP ${res.status}: ${t.slice(0, 120)}` }
    }
    return { id: 'gemini', ok: true, message: 'متصل — يستجيب' }
  } catch (e: any) {
    return { id: 'gemini', ok: false, message: e?.message || 'فشل الاتصال' }
  }
}

export async function GET() {
  const [openai, gemini] = await Promise.all([testOpenAI(), testGemini()])
  return NextResponse.json({
    ok: true,
    providers: [openai, gemini],
    testedAt: new Date().toISOString(),
  })
}
