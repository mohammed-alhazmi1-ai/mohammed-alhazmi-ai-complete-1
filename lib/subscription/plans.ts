/**
 * خطط الاشتراك للمنصة
 * Free / Gift / Pro / Business / VIP
 * خطة الهدية (Gift) تُفعَّل فقط عبر كود من لوحة المالك
 */
export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    nameAr: 'مجانية',
    price: 0,
    credits: 100,
    features: ['chat', 'image'],
    description: 'رصيد ترحيبي عند التسجيل',
  },
  {
    id: 'gift',
    name: 'Gift',
    nameAr: 'هدية',
    price: 0,
    credits: 200,
    features: ['chat', 'image', 'audio'],
    description: 'تُفعَّل بكود هدية من الإدارة فقط',
    viaCodeOnly: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    nameAr: 'احترافية',
    price: 29,
    credits: 5000,
    features: ['chat', 'image', 'audio', 'video'],
    description: 'مناسبة لصناع المحتوى',
  },
  {
    id: 'business',
    name: 'Business',
    nameAr: 'أعمال',
    price: 99,
    credits: 20000,
    features: ['chat', 'image', 'audio', 'video'],
    description: 'فرق العمل واستخدام مكثف',
  },
  {
    id: 'vip',
    name: 'VIP',
    nameAr: 'VIP',
    price: 0,
    credits: 999999,
    features: ['chat', 'image', 'audio', 'video'],
    description: 'خطة خاصة / غير محدودة — عبر كود أو اتفاق',
    viaCodeOnly: true,
  },
] as const;

export type PlanId = (typeof PLANS)[number]['id'];
