/** باقات الاشتراك + حزم REMO + طرق الدفع */

export type Plan = {
  id: string
  name: string
  nameEn: string
  priceUsd: number
  priceYer?: number
  monthlyRemo: number
  chatLimit: number | null // null = بلا حدود
  imageLimit: number | null
  videoLimit: number | null
  features: string[]
  badge?: string
  popular?: boolean
}

export type RemoPack = {
  id: string
  name: string
  remo: number
  priceUsd: number
  priceYer?: number
  bonus?: number
  popular?: boolean
}

export type PayMethod = {
  id: string
  name: string
  nameEn: string
  type: 'manual' | 'crypto' | 'card' | 'local'
  currency: string
  enabled: boolean
  instructions: string
  /** يظهر للمستخدم عند الاختيار */
  addressOrAccount?: string
  icon?: string
}

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'مجاني',
    nameEn: 'Free',
    priceUsd: 0,
    monthlyRemo: 50,
    chatLimit: 30,
    imageLimit: 3,
    videoLimit: 0,
    features: ['50 REMO شهرياً', 'دردشة محدودة', 'صور محدودة', 'دعم أساسي'],
  },
  {
    id: 'starter',
    name: 'ستارتر',
    nameEn: 'Starter',
    priceUsd: 9,
    priceYer: 2250,
    monthlyRemo: 300,
    chatLimit: 200,
    imageLimit: 30,
    videoLimit: 5,
    features: ['300 REMO', 'صور + دردشة', 'قوالب جاهزة', 'دعم فني'],
  },
  {
    id: 'pro',
    name: 'برو',
    nameEn: 'Pro',
    priceUsd: 19,
    priceYer: 4750,
    monthlyRemo: 800,
    chatLimit: null,
    imageLimit: 100,
    videoLimit: 20,
    features: ['800 REMO', 'دردشة بلا حدود', 'أولوية معالجة', 'صور وفيديو'],
    popular: true,
    badge: 'الأكثر طلباً',
  },
  {
    id: 'business',
    name: 'أعمال',
    nameEn: 'Business',
    priceUsd: 49,
    priceYer: 12250,
    monthlyRemo: 2500,
    chatLimit: null,
    imageLimit: 400,
    videoLimit: 60,
    features: ['2500 REMO', 'كل الخدمات', 'تقارير استخدام', 'دعم أولوية'],
  },
  {
    id: 'vip',
    name: 'VIP',
    nameEn: 'VIP',
    priceUsd: 99,
    priceYer: 24750,
    monthlyRemo: 6000,
    chatLimit: null,
    imageLimit: null,
    videoLimit: null,
    features: ['6000 REMO', 'بلا حدود تقريباً', 'مدير حساب', 'وصول مبكر'],
    badge: 'مميز',
  },
  {
    id: 'gift',
    name: 'هدية',
    nameEn: 'Gift',
    priceUsd: 0,
    monthlyRemo: 100,
    chatLimit: 50,
    imageLimit: 10,
    videoLimit: 2,
    features: ['تفعيل بكود هدية', 'من لوحة المالك', 'مدة محدودة'],
    badge: 'بكود',
  },
]

export const REMO_PACKS: RemoPack[] = [
  { id: 'remo_100', name: '100 REMO', remo: 100, priceUsd: 3, priceYer: 750 },
  { id: 'remo_300', name: '300 REMO', remo: 300, priceUsd: 8, priceYer: 2000, bonus: 20 },
  { id: 'remo_700', name: '700 REMO', remo: 700, priceUsd: 15, priceYer: 3750, bonus: 50, popular: true },
  { id: 'remo_1500', name: '1500 REMO', remo: 1500, priceUsd: 29, priceYer: 7250, bonus: 150 },
  { id: 'remo_4000', name: '4000 REMO', remo: 4000, priceUsd: 69, priceYer: 17250, bonus: 500 },
]

/** عدّل العناوين/الأرقام من لوحة المالك لاحقاً */
export const PAY_METHODS: PayMethod[] = [
  {
    id: 'jeeb',
    name: 'محفظة جيب',
    nameEn: 'Jeeb Wallet',
    type: 'local',
    currency: 'YER',
    enabled: true,
    instructions:
      '1) أودع المبلغ نقداً / حوّل عبر محفظة جيب إلى الرقم: 777096733
' +
      '2) احتفظ بإشعار الإيداع
' +
      '3) أرسل الإشعار عبر واتساب إلى نفس الرقم مع رقم طلبك
' +
      '4) بعد التحقق يُضاف رصيد REMO إلى حسابك',
    addressOrAccount: process.env.NEXT_PUBLIC_JEEB_NUMBER || '777096733',
    icon: '📱',
  },,
  {
    id: 'binance',
    name: 'بينانس (USDT)',
    nameEn: 'Binance USDT',
    type: 'crypto',
    currency: 'USDT',
    enabled: true,
    instructions:
      'حوّل USDT على الشبكة المحددة (مثل TRC20) إلى العنوان الظاهر، ثم أرسل رقم العملية/لقطة.',
    addressOrAccount: process.env.NEXT_PUBLIC_BINANCE_USDT || 'يُضاف من إعدادات المالك',
    icon: '🟡',
  },
  {
    id: 'crypto',
    name: 'عملات رقمية أخرى',
    nameEn: 'Crypto',
    type: 'crypto',
    currency: 'USDT/BTC',
    enabled: true,
    instructions: 'تواصل بعد إنشاء الطلب لتحويل BTC أو USDT على الشبكة المتفق عليها.',
    addressOrAccount: process.env.NEXT_PUBLIC_CRYPTO_ADDRESS || 'من إعدادات المالك',
    icon: '₿',
  },
  {
    id: 'manual',
    name: 'تحويل يدوي / تواصل مع المالك',
    nameEn: 'Manual',
    type: 'manual',
    currency: 'USD/YER',
    enabled: true,
    instructions: 'أنشئ الطلب ثم تواصل مع الدعم لإتمام التحويل البنكي أو اليدوي.',
    icon: '🏦',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    nameEn: 'PayPal',
    type: 'card',
    currency: 'USD',
    enabled: false, // يظهر كقريباً حتى يتم الربط
    instructions: 'PayPal غير مفعّل حالياً. اختر جيب أو بينانس أو التحويل اليدوي.',
    icon: '💙',
  },
]

/** رقم جيب لاستقبال الإيداع وإشعار واتساب */
export const JEEB_DEPOSIT_NUMBER = process.env.NEXT_PUBLIC_JEEB_NUMBER || '777096733'
export const JEEB_WHATSAPP = '967' + JEEB_DEPOSIT_NUMBER.replace(/^0+/, '').replace(/^967/, '')
