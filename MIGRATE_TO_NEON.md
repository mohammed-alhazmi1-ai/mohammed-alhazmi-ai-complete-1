# ترحيل public من نسخة Supabase إلى Neon

## النطاق

السكربت `scripts/migrate_supabase_public.py` ينقل **بيانات جداول `public` فقط** من ملف PostgreSQL SQL dump.

لا ينقل ولا ينفذ:

- أدوار PostgreSQL الخاصة بـ Supabase.
- `auth` و`realtime` و`storage` و`vault`.
- امتدادات Supabase أو دوالها أو سياساتها أو إعدادات RLS.
- ملفات Storage الفعلية.

## قبل البدء

### 1. إنشاء مشروع Neon

أنشئ مشروع PostgreSQL جديداً في Neon، ثم خذ رابطين:

- رابط pooled للاتصال العادي.
- رابط direct للترحيلات والأوامر الإدارية.

لا تضع الروابط في Git أو ترسلها في المحادثة.

### 2. تثبيت الأدوات

يحتاج السكربت إلى Python 3 و`psql`:

```bash
python3 --version
psql --version
```

إذا لم يكن `psql` موجوداً على Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y postgresql-client
```

### 3. إنشاء مخطط Neon قبل تحميل البيانات

من جذر المشروع:

```bash
npm ci
export DATABASE_URL='رابط Neon pooled'
export DIRECT_URL='رابط Neon direct'
npx prisma generate
npx prisma db push
```

للإنتاج يفضل استخدام migrations المراجعة بدلاً من `db push` إذا كانت migrations متوفرة:

```bash
npx prisma migrate deploy
```

لا تشغل سكربت البيانات قبل إنشاء جداول Prisma.

## تشغيل المعاينة الآمنة

مسار النسخة الاحتياطية مثالاً:

```bash
/home/ubuntu/upload/db_cluster-19-09-2026@17-42-31.backup.gz
```

شغل dry-run مع حفظ ملف SQL المنقى:

```bash
python3 scripts/migrate_supabase_public.py \
  /path/to/db_cluster.backup.gz \
  --export-sql /tmp/public-neon-migration.sql
```

هذا الأمر:

- يفك ضغط النسخة في الذاكرة.
- يقرأ أقسام `COPY public.*` فقط.
- يرتب الجداول وفق علاقات المشروع.
- يعرض عدد السجلات.
- ينشئ ملف SQL يحتوي `BEGIN` و`COMMIT`.
- لا يتصل بـ Neon ولا يكتب أي بيانات.

## تنفيذ الترحيل فعلياً

بعد التأكد من أن Neon يحتوي مخطط Prisma الصحيح وأنه فارغ:

```bash
export NEON_DATABASE_URL='رابط Neon pooled أو direct المناسب للترحيل'
python3 scripts/migrate_supabase_public.py \
  /path/to/db_cluster.backup.gz \
  --export-sql /tmp/public-neon-migration.sql \
  --apply
```

بشكل افتراضي، يضيف السكربت فحصاً يوقف العملية إذا وجد أي جدول في `public` يحتوي بيانات. هذا يمنع تكرار البيانات أو الكتابة فوق قاعدة مستخدمة.

لا تستخدم `--allow-non-empty` إلا بعد أخذ نسخة من Neon وفهم نتيجة التكرار؛ الخيار لا يحذف البيانات القديمة وقد يسبب أخطاء unique أو تكراراً.

## التحقق بعد الترحيل

تحقق من أعداد السجلات في Neon:

```bash
psql "$NEON_DATABASE_URL" <<'SQL'
SELECT 'User' AS table_name, count(*) FROM public."User"
UNION ALL SELECT 'Wallet', count(*) FROM public."Wallet"
UNION ALL SELECT 'Subscription', count(*) FROM public."Subscription"
UNION ALL SELECT 'AiJob', count(*) FROM public."AiJob"
UNION ALL SELECT 'AiProvider', count(*) FROM public."AiProvider"
UNION ALL SELECT 'AiModel', count(*) FROM public."AiModel"
UNION ALL SELECT 'ProviderKey', count(*) FROM public."ProviderKey";
SQL
```

الأعداد المتوقعة من النسخة الحالية:

| الجدول | العدد المتوقع |
|---|---:|
| `User` | 24 |
| `Wallet` | 24 |
| `Subscription` | 24 |
| `AiJob` | 55 |
| `AiProvider` | 5 |
| `AiModel` | 3 |
| `ProviderKey` | 5 |

تحقق من العلاقات:

```sql
SELECT count(*) AS orphan_wallets
FROM public."Wallet" w
LEFT JOIN public."User" u ON u.id = w."userId"
WHERE u.id IS NULL;

SELECT count(*) AS orphan_subscriptions
FROM public."Subscription" s
LEFT JOIN public."User" u ON u.id = s."userId"
WHERE u.id IS NULL;

SELECT count(*) AS orphan_jobs
FROM public."AiJob" j
LEFT JOIN public."User" u ON u.id = j."userId"
WHERE u.id IS NULL;
```

يجب أن تكون النتائج صفراً.

## ما تم نقله وما لم يتم نقله

### تم نقله

- بيانات جداول `public` الخاصة بالمنصة.
- المستخدمون في جدول التطبيق `public."User"`.
- المحافظ والاشتراكات والوظائف والمزودون والنماذج ومفاتيح المزودين.

### لم يتم نقله

- حسابات Supabase Auth كنظام مصادقة كامل.
- جلسات Supabase وRefresh Tokens.
- ملفات Storage.
- سياسات RLS ودوال Supabase.
- إعدادات OAuth الخاصة بـ Google/GitHub.
- أسرار Supabase وJWT secrets.

## إكمال الاستقلال عن Supabase

بعد نجاح نقل `public` إلى Neon، ما زالت الخطوات التالية مطلوبة:

1. اختيار نظام مصادقة: Auth.js + Prisma هو الخيار المقترح.
2. إضافة جداول Auth.js مثل `Account` و`Session` و`VerificationToken` أو استخدام جلسات خادم مخصصة.
3. مطابقة 24 مستخدماً عبر البريد مع `auth.users` القديم.
4. اختبار bcrypt hashes القديمة قبل وضعها في `User.passwordHash`.
5. معالجة الحساب الواحد الموجود في Auth وليس في جدول `User`.
6. تغيير صفحات login/signup/forgot-password.
7. تعديل `OwnerGuard` و`UserShell` و`middleware.ts`.
8. إنشاء آلية استعادة كلمة المرور بالبريد.
9. نقل Storage إلى R2 أو Vercel Blob.
10. تحديث روابط `GeneratedFile` و`avatarUrl`.
11. حذف استدعاءات `supabase.auth` و`supabase.storage` من التطبيق.
12. تحديث Vercel بمتغيرات Neon ونظام البريد والتخزين الجديد.
13. اختبار المالك والمستخدم والخدمات والرصيد والملفات.

## خطة التحويل النهائي

1. تشغيل Neon كبيئة تجريبية.
2. تطبيق Prisma schema.
3. تشغيل سكربت public في Neon التجريبية.
4. اختبار الحسابات والرصيد والوظائف.
5. تنفيذ نقل المصادقة والتخزين.
6. وضع المنصة القديمة في وضع القراءة أو الصيانة.
7. أخذ dump نهائي من القديم إذا أصبح متاحاً.
8. إعادة تنفيذ آخر تغييرات على Neon.
9. تحديث Vercel Environment Variables.
10. إعادة نشر التطبيق.
11. مراقبة الأخطاء لمدة 7–14 يوماً قبل حذف أي شيء قديم.

## تحذيرات

- لا ترسل `NEON_DATABASE_URL` أو مفاتيح Supabase في المحادثة.
- لا تضف `.env` أو ملفات SQL التي تحتوي بيانات إلى Git.
- لا تنفذ `--apply` قبل التأكد من قاعدة Neon الهدف.
- لا تحذف مشروع Supabase القديم قبل نقل الملفات واختبار الدخول.
- ملف قاعدة البيانات لا يحتوي الملفات الفعلية داخل Storage؛ يلزم مسار نسخ منفصل.
