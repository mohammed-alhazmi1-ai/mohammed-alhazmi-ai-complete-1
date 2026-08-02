/**
 * قوالب احترافية جاهزة لكل خدمة — مثل المنصات العالمية
 */

export type Template = {
  id: string;
  titleAr: string;
  titleEn: string;
  promptAr: string;
  promptEn: string;
  category: string;
  icon?: string;
};

export const IMAGE_TEMPLATES: Template[] = [
  {
    id: 'img-product',
    titleAr: 'صورة منتج إعلانية',
    titleEn: 'Product Ad Photo',
    promptAr: 'صورة احترافية لمنتج [اسم المنتج] على خلفية نظيفة بيضاء، إضاءة استوديو، جودة عالية، مناسبة للإعلانات',
    promptEn: 'Professional product photo of [product name] on clean white background, studio lighting, high quality, ad-ready',
    category: 'images',
    icon: '📦',
  },
  {
    id: 'img-portrait',
    titleAr: 'بورتريه احترافي',
    titleEn: 'Professional Portrait',
    promptAr: 'صورة بورتريه لشخص [الوصف]، خلفية ناعمة، إضاءة سينمائية، تفاصيل الوجه واضحة',
    promptEn: 'Professional portrait of [description], soft background, cinematic lighting, sharp facial details',
    category: 'images',
    icon: '👤',
  },
  {
    id: 'img-logo',
    titleAr: 'تصميم شعار',
    titleEn: 'Logo Design',
    promptAr: 'شعار بسيط وحديث لشركة [اسم الشركة] في مجال [المجال]، ألوان [الألوان]، بدون نص معقد، قابل للاستخدام كأيقونة',
    promptEn: 'Modern minimal logo for [company] in [industry], colors [colors], clean icon style',
    category: 'images',
    icon: '✨',
  },
  {
    id: 'img-social',
    titleAr: 'بوست سوشيال ميديا',
    titleEn: 'Social Media Post',
    promptAr: 'تصميم منشور إنستغرام عن [الموضوع]، ألوان جذابة، مساحة للنص، أسلوب عصري',
    promptEn: 'Instagram post design about [topic], vibrant colors, space for text, modern style',
    category: 'images',
    icon: '📱',
  },
  {
    id: 'img-bg-remove',
    titleAr: 'إزالة الخلفية',
    titleEn: 'Background Removal',
    promptAr: 'أزل الخلفية من الصورة وأبقِ العنصر الرئيسي فقط بخلفية شفافة',
    promptEn: 'Remove the background and keep only the main subject on transparent background',
    category: 'images',
    icon: '✂️',
  },
  {
    id: 'img-upscale',
    titleAr: 'رفع دقة الصورة',
    titleEn: 'Image Upscale',
    promptAr: 'ارفع دقة هذه الصورة مع الحفاظ على التفاصيل والألوان الطبيعية',
    promptEn: 'Upscale this image while preserving details and natural colors',
    category: 'images',
    icon: '🔍',
  },
];

export const VIDEO_TEMPLATES: Template[] = [
  {
    id: 'vid-script',
    titleAr: 'نص إلى فيديو إعلاني',
    titleEn: 'Script to Ad Video',
    promptAr: 'أنشئ فيديو إعلاني قصير (15-30 ثانية) عن [المنتج/الخدمة]، نبرة حماسية، مشاهد سريعة',
    promptEn: 'Create a short ad video (15-30s) about [product/service], energetic tone, fast cuts',
    category: 'video',
    icon: '📢',
  },
  {
    id: 'vid-image',
    titleAr: 'صورة إلى فيديو متحرك',
    titleEn: 'Image to Motion Video',
    promptAr: 'حوّل هذه الصورة إلى فيديو متحرك سلس مع حركة كاميرا خفيفة وتأثيرات بصرية',
    promptEn: 'Convert this image into a smooth motion video with subtle camera movement and visual effects',
    category: 'video',
    icon: '🎞️',
  },
  {
    id: 'vid-story',
    titleAr: 'قصة قصيرة',
    titleEn: 'Short Story Video',
    promptAr: 'فيديو قصصي مدته دقيقة عن [الموضوع]، سرد بصري واضح، موسيقى مناسبة',
    promptEn: 'One-minute story video about [topic], clear visual narrative, fitting music',
    category: 'video',
    icon: '📖',
  },
  {
    id: 'vid-face',
    titleAr: 'تغيير الوجه',
    titleEn: 'Face Swap',
    promptAr: 'استبدل الوجه في الفيديو بالوجه المحدد مع الحفاظ على الحركة والإضاءة',
    promptEn: 'Swap the face in the video with the selected face while keeping motion and lighting',
    category: 'video',
    icon: '🎭',
  },
];

export const MUSIC_TEMPLATES: Template[] = [
  {
    id: 'mus-song',
    titleAr: 'أغنية كاملة',
    titleEn: 'Full Song',
    promptAr: 'أنشئ أغنية كاملة عن [الموضوع]، أسلوب [بوب/راب/تراث]، كلمات عربية، لحن جذاب',
    promptEn: 'Create a full song about [topic], style [pop/rap/traditional], catchy melody',
    category: 'music',
    icon: '🎤',
  },
  {
    id: 'mus-shaila',
    titleAr: 'شيلة',
    titleEn: 'Shaila (Traditional)',
    promptAr: 'شيلة حماسية عن [المناسبة/الشخص]، إيقاع خليجي تقليدي، كلمات فخر ومدح',
    promptEn: 'Energetic Gulf-style shaila about [occasion/person], traditional rhythm, praise lyrics',
    category: 'music',
    icon: '🥁',
  },
  {
    id: 'mus-zaffa',
    titleAr: 'زفة عرس',
    titleEn: 'Wedding Zaffa',
    promptAr: 'زفة عرس باسم [العريس/العروسة]، أجواء احتفالية، إيقاع زفة كلاسيكي مع لمسة عصرية',
    promptEn: 'Wedding zaffa for [groom/bride name], festive mood, classic zaffa rhythm with modern touch',
    category: 'music',
    icon: '💍',
  },
  {
    id: 'mus-bg',
    titleAr: 'موسيقى خلفية',
    titleEn: 'Background Music',
    promptAr: 'موسيقى خلفية هادئة مناسبة لـ [فيديو/بودكاست/عرض]، بدون كلمات، مدة دقيقتين',
    promptEn: 'Calm background music for [video/podcast/presentation], instrumental, 2 minutes',
    category: 'music',
    icon: '🎹',
  },
];

export const CODE_TEMPLATES: Template[] = [
  {
    id: 'code-landing',
    titleAr: 'صفحة هبوط (Landing)',
    titleEn: 'Landing Page',
    promptAr: 'اكتب كود HTML/CSS/React لصفحة هبوط لمنتج [الاسم]، تصميم حديث داكن، أزرار CTA، قسم خدمات',
    promptEn: 'Write HTML/CSS/React code for a landing page for [product], modern dark design, CTA buttons, services section',
    category: 'code',
    icon: '🌐',
  },
  {
    id: 'code-api',
    titleAr: 'واجهة API',
    titleEn: 'REST API',
    promptAr: 'أنشئ REST API بـ Node.js/Express لـ [المورد]، مع CRUD كامل ومصادقة JWT',
    promptEn: 'Create a Node.js/Express REST API for [resource] with full CRUD and JWT auth',
    category: 'code',
    icon: '🔌',
  },
  {
    id: 'code-app',
    titleAr: 'تطبيق موبايل',
    titleEn: 'Mobile App Screen',
    promptAr: 'اكتب شاشة React Native لـ [الوظيفة]، واجهة عربية RTL، أزرار وتنقل واضح',
    promptEn: 'Write a React Native screen for [feature], Arabic RTL UI, clear buttons and navigation',
    category: 'code',
    icon: '📱',
  },
  {
    id: 'code-fix',
    titleAr: 'إصلاح خطأ',
    titleEn: 'Bug Fix',
    promptAr: 'هذا الكود به خطأ:\n```\n[الصق الكود]\n```\nاشرح المشكلة وأعطِ الحل',
    promptEn: 'This code has a bug:\n```\n[paste code]\n```\nExplain the issue and provide the fix',
    category: 'code',
    icon: '🐛',
  },
];

export const CHAT_TEMPLATES: Template[] = [
  {
    id: 'chat-article',
    titleAr: 'كتابة مقال',
    titleEn: 'Write Article',
    promptAr: 'اكتب مقالاً احترافياً عن [الموضوع]، حوالي 800 كلمة، أسلوب [رسمي/تسويقي]، عناوين فرعية',
    promptEn: 'Write a professional article about [topic], ~800 words, [formal/marketing] tone, with subheadings',
    category: 'chat',
    icon: '📝',
  },
  {
    id: 'chat-summary',
    titleAr: 'تلخيص نص',
    titleEn: 'Summarize Text',
    promptAr: 'لخّص النص التالي في نقاط واضحة ومختصرة:\n\n[النص]',
    promptEn: 'Summarize the following text in clear bullet points:\n\n[text]',
    category: 'chat',
    icon: '📋',
  },
  {
    id: 'chat-translate',
    titleAr: 'ترجمة',
    titleEn: 'Translate',
    promptAr: 'ترجم النص التالي إلى [العربية/الإنجليزية] بأسلوب طبيعي:\n\n[النص]',
    promptEn: 'Translate the following text to [Arabic/English] in a natural style:\n\n[text]',
    category: 'chat',
    icon: '🌍',
  },
  {
    id: 'chat-email',
    titleAr: 'رسالة بريد رسمية',
    titleEn: 'Formal Email',
    promptAr: 'اكتب رسالة بريد إلكتروني رسمية إلى [الجهة] بخصوص [الموضوع]، نبرة مهذبة وواضحة',
    promptEn: 'Write a formal email to [recipient] about [topic], polite and clear tone',
    category: 'chat',
    icon: '✉️',
  },
  {
    id: 'chat-ideas',
    titleAr: 'عصف ذهني',
    titleEn: 'Brainstorm Ideas',
    promptAr: 'اقترح 10 أفكار إبداعية لـ [المشروع/الحملة]، مرتبة من الأسهل إلى الأكثر طموحاً',
    promptEn: 'Suggest 10 creative ideas for [project/campaign], ordered from easiest to most ambitious',
    category: 'chat',
    icon: '💡',
  },
];

export const ALL_TEMPLATES = {
  images: IMAGE_TEMPLATES,
  video: VIDEO_TEMPLATES,
  music: MUSIC_TEMPLATES,
  code: CODE_TEMPLATES,
  chat: CHAT_TEMPLATES,
} as const;

export type ServiceKey = keyof typeof ALL_TEMPLATES;
