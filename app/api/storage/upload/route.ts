import { NextRequest, NextResponse } from 'next/server';
import { ensureUserByEmail } from '@/lib/credits';
import {
  uploadToBucket,
  buildStoragePath,
  isStorageConfigured,
  STORAGE_BUCKETS,
  type StorageBucket,
} from '@/lib/storage';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    if (!isStorageConfigured()) {
      return NextResponse.json(
        {
          error:
            'التخزين غير مضبوط. أضف NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY (أو ANON) في .env وأنشئ الـ Buckets في Supabase.',
        },
        { status: 503 }
      );
    }

    const form = await req.formData();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const bucket = String(form.get('bucket') || 'uploads') as StorageBucket;
    const folder = String(form.get('folder') || '');
    const jobId = String(form.get('jobId') || '');
    const file = form.get('file') as File | null;

    if (!email) return NextResponse.json({ error: 'البريد مطلوب' }, { status: 400 });
    if (!file) return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 });
    if (!STORAGE_BUCKETS.includes(bucket)) {
      return NextResponse.json(
        { error: `bucket غير مسموح. المسموح: ${STORAGE_BUCKETS.join(', ')}` },
        { status: 400 }
      );
    }

    // حد 15MB
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم الملف أكبر من 15MB' }, { status: 400 });
    }

    const user = await ensureUserByEmail(email);
    const path = buildStoragePath(user.id, file.name, folder || undefined);
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await uploadToBucket({
      bucket,
      path,
      data: buffer,
      contentType: file.type || 'application/octet-stream',
    });

    if (uploaded.error) {
      return NextResponse.json({ error: uploaded.error }, { status: 500 });
    }

    // ربط اختياري بطلب موجود
    if (jobId && uploaded.publicUrl) {
      try {
        await prisma.aiJob.update({
          where: { id: jobId },
          data: { resultUrl: uploaded.publicUrl } as any,
        });
      } catch {
        /* تجاهل إن لم يوجد الحقل أو الطلب */
      }
    }

    return NextResponse.json({
      success: true,
      bucket,
      path: uploaded.path,
      publicUrl: uploaded.publicUrl,
      name: file.name,
      size: file.size,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'فشل الرفع' }, { status: 500 });
  }
}
