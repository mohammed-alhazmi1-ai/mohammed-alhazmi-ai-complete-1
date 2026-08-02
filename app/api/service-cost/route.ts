import { NextRequest, NextResponse } from 'next/server';

const COSTS: Record<string, { cost: number; free: boolean; note: string }> = {
  chat: { cost: 0, free: true, note: 'مجاني ضمن حد الرسائل' },
  code: { cost: 0, free: true, note: 'مجاني ضمن حد الطلبات' },
  text: { cost: 0, free: true, note: 'مجاني ضمن حد الخطة' },
  images: { cost: 20, free: false, note: 'يُخصم بعد نجاح التنفيذ' },
  image: { cost: 20, free: false, note: 'يُخصم بعد نجاح التنفيذ' },
  video: { cost: 120, free: false, note: 'يُخصم بعد نجاح التنفيذ' },
  music: { cost: 30, free: false, note: 'يُخصم بعد نجاح التنفيذ' },
  audio: { cost: 30, free: false, note: 'يُخصم بعد نجاح التنفيذ' },
};

export async function GET(req: NextRequest) {
  const service = (req.nextUrl.searchParams.get('service') || 'chat').toLowerCase();
  const row = COSTS[service] || { cost: 20, free: false, note: '' };
  return NextResponse.json({ service, ...row });
}
