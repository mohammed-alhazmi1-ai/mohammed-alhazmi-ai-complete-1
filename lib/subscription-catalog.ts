/** كتالوج الخطط المعروض للمستخدم — المنطق المالي لاحقاً مع الدفع */

export type PlanCard = {
  id: string;
  name: string;
  nameAr: string;
  price: number; // USD شهرياً
  badge?: string;
  chat: string;
  code: string;
  credits: number;
  features: string[];
  highlighted?: boolean;
};

export const PLAN_CATALOG: PlanCard[] = [
  {
    id: 'Free',
    name: 'Free',
    nameAr: 'مجاني',
    price: 0,
    chat: '30 رسالة / شهر',
    code: '15 طلب / شهر',
    credits: 50,
    features: ['شات وكود بحدود', '50 Credit للوسائط', 'القوالب الأساسية'],
  },
  {
    id: 'Gift',
    name: 'Gift',
    nameAr: 'هدية',
    price: 0,
    badge: 'بكود',
    chat: 'حسب كود الهدية',
    code: 'حسب كود الهدية',
    credits: 0,
    features: ['تفعيل بكود من المالك', 'حدود ورصيد حسب الكود'],
  },
  {
    id: 'Pro',
    name: 'Pro',
    nameAr: 'برو',
    price: 19,
    badge: 'الأكثر طلباً',
    chat: 'بلا حدود',
    code: 'بلا حدود',
    credits: 500,
    highlighted: true,
    features: ['شات وكود بلا حدود', '500 Credit شهرياً', 'صور وفيديو وصوت', 'أولوية دعم'],
  },
  {
    id: 'Business',
    name: 'Business',
    nameAr: 'أعمال',
    price: 49,
    chat: 'بلا حدود',
    code: 'بلا حدود',
    credits: 2000,
    features: ['كل مزايا برو', '2000 Credit', 'استخدام تجاري', 'سجل متقدم'],
  },
  {
    id: 'VIP',
    name: 'VIP',
    nameAr: 'VIP',
    price: 99,
    chat: 'بلا حدود',
    code: 'بلا حدود',
    credits: 5000,
    features: ['كل المزايا', '5000 Credit', 'أولوية قصوى', 'حدود مرتفعة للوسائط'],
  },
];
