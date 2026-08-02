import { NextRequest, NextResponse } from 'next/server';
import { ensureUserByEmail } from '@/lib/credits';
import {
  listUserFiles,
  isStorageConfigured,
  STORAGE_BUCKETS,
  type StorageBucket,
} from '@/lib/storage';

/** قائمة ملفات المستخدم */
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email') || '';
    const bucket = (req.nextUrl.searchParams.get('bucket') || 'uploads') as StorageBucket;

    if (!email) return NextResponse.json({ error: 'البريد مطلوب' }, { status: 400 });
    if (!STORAGE_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: 'bucket غير صالح' }, { status: 400 });
    }
    if (!isStorageConfigured()) {
      return NextResponse.json({
        configured: false,
        buckets: STORAGE_BUCKETS,
        files: [],
        message: 'أضف مفاتيح Supabase وأنشئ الـ Buckets من لوحة Supabase → Storage',
      });
    }

    const user = await ensureUserByEmail(email);
    const { files, error } = await listUserFiles(bucket, user.id);
    if (error) return NextResponse.json({ error, files: [] }, { status: 500 });
    return NextResponse.json({ configured: true, bucket, files });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ' }, { status: 500 });
  }
}
