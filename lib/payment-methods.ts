/** طرق الدفع المتاحة في الواجهة — الربط الحقيقي لاحقاً */

export type PayCurrency = 'USD' | 'USDT' | 'YER';

export type PaymentMethod = {
  id: string;
  nameAr: string;
  nameEn: string;
  type: 'card' | 'crypto' | 'local_wallet' | 'manual';
  currencies: PayCurrency[];
  icon: string;
  enabled: boolean;
  instructionsAr: string;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'stripe',
    nameAr: 'بطاقة / Stripe',
    nameEn: 'Card (Stripe)',
    type: 'card',
    currencies: ['USD'],
    icon: '💳',
    enabled: true,
    instructionsAr: 'الدفع بالبطاقة بالدولار. يُربط Stripe لاحقاً.',
  },
  {
    id: 'paypal',
    nameAr: 'PayPal',
    nameEn: 'PayPal',
    type: 'card',
    currencies: ['USD'],
    icon: '🅿️',
    enabled: true,
    instructionsAr: 'الدفع عبر حساب PayPal بالدولار.',
  },
  {
    id: 'binance',
    nameAr: 'محفظة بينانس',
    nameEn: 'Binance Pay / Wallet',
    type: 'crypto',
    currencies: ['USDT', 'USD'],
    icon: '🟡',
    enabled: true,
    instructionsAr:
      'حوّل USDT (أو المبلغ المحدد) إلى عنوان بينانس المعروض بعد إنشاء الطلب، ثم انتظر تأكيد المالك أو الربط التلقائي لاحقاً.',
  },
  {
    id: 'crypto',
    nameAr: 'عملات رقمية',
    nameEn: 'Crypto (USDT/Other)',
    type: 'crypto',
    currencies: ['USDT'],
    icon: '₿',
    enabled: true,
    instructionsAr:
      'الدفع بـ USDT أو عملات مدعومة. يُعرض عنوان المحفظة بعد إنشاء الطلب (يضبطه المالك في الإعدادات).',
  },
  {
    id: 'jeeb',
    nameAr: 'محفظة جيب (يمني)',
    nameEn: 'Jeeb Wallet (Yemen)',
    type: 'local_wallet',
    currencies: ['YER'],
    icon: '🇾🇪',
    enabled: true,
    instructionsAr:
      'ادفع عبر تطبيق محفظة جيب بالمبلغ بالريال اليمني. أرفق رقم العملية إن طُلب، ويُفعّل الرصيد بعد التأكيد (يدوي الآن / تلقائي لاحقاً).',
  },
  {
    id: 'manual',
    nameAr: 'تحويل يدوي / تواصل',
    nameEn: 'Manual',
    type: 'manual',
    currencies: ['USD', 'YER', 'USDT'],
    icon: '🏦',
    enabled: true,
    instructionsAr: 'إنشاء طلب ثم التواصل مع الدعم لإتمام التحويل.',
  },
];

/** أسعار تقريبية لعرض الواجهة فقط (يُحدّثها المالك لاحقاً) */
export const DISPLAY_RATES = {
  /** كم ريال يمني لكل 1 دولار — للعرض */
  USD_TO_YER: 530,
  /** 1 USDT ≈ 1 USD للعرض */
  USDT_TO_USD: 1,
};

export function convertAmount(amountUsd: number, currency: PayCurrency): number {
  if (currency === 'USD' || currency === 'USDT') return amountUsd;
  if (currency === 'YER') return Math.round(amountUsd * DISPLAY_RATES.USD_TO_YER);
  return amountUsd;
}

export const CREDIT_PACKS = [
  { id: 'pack_100', credits: 100, priceUsd: 5, label: '100 Credit' },
  { id: 'pack_500', credits: 500, priceUsd: 20, label: '500 Credit' },
  { id: 'pack_1500', credits: 1500, priceUsd: 50, label: '1500 Credit' },
  { id: 'pack_5000', credits: 5000, priceUsd: 140, label: '5000 Credit' },
];
