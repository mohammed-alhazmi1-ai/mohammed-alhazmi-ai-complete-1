import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isOwnerEmail } from '@/lib/credits';

const KEY = 'payment_wallets';

export async function GET() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: KEY } });
    const value = row?.value ? JSON.parse(row.value) : {};
    return NextResponse.json({
      settings: {
        binanceAddress: value.binanceAddress || '',
        binanceNetwork: value.binanceNetwork || 'TRC20',
        cryptoAddress: value.cryptoAddress || '',
        cryptoNetwork: value.cryptoNetwork || 'TRC20',
        jeebAccount: value.jeebAccount || '',
        jeebName: value.jeebName || '',
        usdToYer: value.usdToYer || 530,
        supportNote: value.supportNote || '',
      },
    });
  } catch {
    return NextResponse.json({
      settings: {
        binanceAddress: '',
        binanceNetwork: 'TRC20',
        cryptoAddress: '',
        cryptoNetwork: 'TRC20',
        jeebAccount: '',
        jeebName: '',
        usdToYer: 530,
        supportNote: '',
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').toLowerCase();
    if (!email || !(await isOwnerEmail(email))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    const { email: _e, ...rest } = body;
    await prisma.setting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: JSON.stringify(rest) },
      update: { value: JSON.stringify(rest) },
    });
    return NextResponse.json({ success: true, settings: rest });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ' }, { status: 500 });
  }
}
