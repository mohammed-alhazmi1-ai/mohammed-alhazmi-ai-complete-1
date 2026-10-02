import { NextResponse } from 'next/server';

export async function GET() {
  const hasGemini = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const hasOpenAI = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
  const hasDb = !!(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost'));
  const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

  return NextResponse.json({
    ok: (hasGemini || hasOpenAI) && hasDb,
    generateReady: hasGemini || hasOpenAI,
    providers: { gemini: hasGemini, openai: hasOpenAI },
    checks: {
      GEMINI_API_KEY: hasGemini ? 'ready' : 'missing',
      OPENAI_API_KEY: hasOpenAI ? 'ready' : 'missing',
      DATABASE_URL: hasDb ? 'ready' : 'missing',
      STORAGE: hasBlob ? 'ready' : 'missing',
    },
  });
}
