# Mohammed Alhazmi AI Platform v2 (Enterprise)

منصة ذكاء اصطناعي تجارية عربية — SaaS متكاملة.

**الحالة:** Sprint 1 (Core) — قيد التطوير  
**الإصدار:** 0.1.0

## ما تم إنجازه في هذا التصحيح

- ✅ تأمين `.env` وإضافة `.env.example` + تحديث `.gitignore`
- ✅ توسيع `prisma/schema.prisma` ليشمل جداول الخطة (Users, Wallet, Providers, Jobs, GiftCodes...)
- ✅ إنشاء `/api/generate` (Router لـ Gemini + جاهز لـ OpenAI/Claude)
- ✅ توحيد مساعدات المصادقة حول Supabase (`lib/auth/*`)
- ✅ إكمال `lib/ai`, `lib/wallet`, `lib/subscription`, `lib/providers`, `lib/payment`
- ✅ إصلاح الصفحات الفارغة (about, contact, pricing, services)
- ✅ تحديث لوحة المستخدم وربط مولد النصوص
- ✅ إضافة `next.config.mjs` ومسارات `@/*`
- ✅ middleware متوافق مع Supabase (بدون next-auth الإجباري)

## الخطة من لقطات الشاشة (مرجع)

### المرحلة 1 — Core
1. Core Engine (إعداد المشروع، Modules، Plugins)
2. Authentication (تسجيل، دخول، استعادة كلمة المرور، OAuth لاحقاً)
3. Users (الملف الشخصي، الرصيد، كود الإحالة)
4. Wallet (رصيد مجاني / مدفوع / إحالات + سجل)
5. Plans (Free, Gift, Pro, Business, VIP)
6. AI Providers (OpenAI, Gemini, Claude, Grok, Replicate, Runway, ElevenLabs, Suno...)
7. Settings + Admin Dashboard

### مزودو الذكاء الاصطناعي المستهدفون
- **نص/دردشة:** OpenAI, Gemini, Claude, Grok, Mistral, DeepSeek
- **صور:** OpenAI Images, Stability, Replicate, Fal
- **فيديو:** Runway, Pika, Kling, Luma
- **صوت/موسيقى:** ElevenLabs, Suno, MusicGen

### المحافظ والدفع
Stripe, PayPal, Binance Pay, Coinbase, Payoneer, Wise, USDT, محافظ محلية

### لوحة الإدارة (Owner)
Dashboard, Analytics, Users, Wallets, Withdrawals, Providers, API Keys, Settings, Backup, Logs, ...

## التشغيل

```bash
# 1. انسخ البيئة
cp .env.example .env
# عدّل المفاتيح الحقيقية (لا ترفع .env أبداً)

# 2. تثبيت
npm install

# 3. Prisma
npx prisma generate
# nps prisma db push   # عند جاهزية قاعدة البيانات

# 4. تشغيل
npm run dev
```

## ملاحظات أمنية مهمة

1. **لا تضع مفاتيح API حقيقية في الكود أو في الواجهة.**
2. ملف `.env` الحالي يحتوي قيماً وهمية بعد التصحيح — ضع مفاتيحك محلياً فقط.
3. المصادقة حالياً تعتمد على Supabase Client. للإنتاج يُفضّل `@supabase/ssr` + حماية Cookie في middleware.
4. رصيد المستخدم ما زال ثابتاً في الواجهة — الربط الكامل مع Wallet + خصم عند التوليد يحتاج الخطوة التالية.

## الهيكل الحالي

```
app/
  page.tsx, layout.tsx, globals.css
  login/, signup/, dashboard/, owner/, pricing/, about/, contact/, services/
  api/generate/, api/auth/
components/  (Navbar, Hero, Services, Pricing, owner/OwnerSidebar, ...)
lib/         (prisma, supabase, auth, ai, wallet, providers, payment, subscription)
prisma/schema.prisma
```

## الخطوات التالية المقترحة

1. ربط خصم الرصيد عند استدعاء `/api/generate`
2. تفعيل OpenAI و Claude بعد تثبيت المكتبات
3. صفحات Owner الديناميكية (Users, Providers من DB)
4. حماية مسارات Owner بفحص الدور من قاعدة البيانات
5. نظام أكواد الهدايا الكامل

---
© 2026 Mohammed Alhazmi AI
