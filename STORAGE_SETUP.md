# إعداد التخزين (المرحلة 3)

## في Supabase → Storage → New bucket
أنشئ buckets (يفضّل Public للتجربة، أو Private مع سياسات):

- images
- videos
- audio
- documents
- generated
- uploads

## سياسات سريعة للتجربة (Public read)
أو من SQL:

```sql
-- مثال: قراءة عامة لـ generated (عدّل حسب حاجتك الأمنية لاحقاً)
