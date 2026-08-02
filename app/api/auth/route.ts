import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoints: { register: 'POST /api/auth/register', login: 'use /login page' },
  });
}
