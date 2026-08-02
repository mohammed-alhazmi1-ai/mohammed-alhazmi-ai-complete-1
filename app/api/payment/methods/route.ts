import { NextResponse } from 'next/server';
import { PAYMENT_METHODS, CREDIT_PACKS, DISPLAY_RATES } from '@/lib/payment-methods';

export async function GET() {
  return NextResponse.json({
    methods: PAYMENT_METHODS.filter((m) => m.enabled),
    packs: CREDIT_PACKS,
    rates: DISPLAY_RATES,
    note: 'العناوين ومفاتيح البوابات تُضبط من لوحة المالك لاحقاً',
  });
}
