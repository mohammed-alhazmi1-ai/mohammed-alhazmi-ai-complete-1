/**
 * طبقة التخزين — Supabase Storage
 * Buckets: images | videos | audio | documents | generated | uploads
 * الربط الفعلي للتوليد يأتي لاحقاً؛ هنا الرفع والجلب جاهزان.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const STORAGE_BUCKETS = [
  'images',
  'videos',
  'audio',
  'documents',
  'generated',
  'uploads',
] as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

function getAdminClient(): SupabaseClient | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim();
  if (!url || !key || !url.startsWith('http')) return null;
  return createClient(url, key);
}

function getBrowserClient(): SupabaseClient | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  if (!url || !key || !url.startsWith('http')) return null;
  return createClient(url, key);
}

export function isStorageConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim())
  );
}

/** اسم ملف آمن وفريد */
export function buildStoragePath(userId: string, filename: string, folder?: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._\-\u0600-\u06FF]/g, '_').slice(0, 80);
  const id = `\( {Date.now()}_ \){Math.random().toString(36).slice(2, 8)}`;
  const base = folder ? `\( {userId}/ \){folder}` : userId;
  return `\( {base}/ \){id}_${safe}`;
}

/**
 * رفع ملف (Buffer أو Blob) إلى bucket
 * يُرجع publicUrl أو path عند النجاح
 */
export async function uploadToBucket(opts: {
  bucket: StorageBucket;
  path: string;
  data: Buffer | Blob | ArrayBuffer;
  contentType?: string;
  upsert?: boolean;
}): Promise<{ path: string; publicUrl: string | null; error?: string }> {
  const client = getAdminClient() || getBrowserClient();
  if (!client) {
    return { path: opts.path, publicUrl: null, error: 'Storage غير مضبوط — أضف متغيرات Supabase في .env' };
  }

  const body =
    opts.data instanceof Buffer
      ? opts.data
      : opts.data instanceof ArrayBuffer
      ? Buffer.from(opts.data)
      : opts.data;

  const { error } = await client.storage.from(opts.bucket).upload(opts.path, body, {
    contentType: opts.contentType || 'application/octet-stream',
    upsert: opts.upsert ?? false,
  });

  if (error) {
    return { path: opts.path, publicUrl: null, error: error.message };
  }

  const { data } = client.storage.from(opts.bucket).getPublicUrl(opts.path);
  return { path: opts.path, publicUrl: data?.publicUrl || null };
}

/** حذف ملف */
export async function removeFromBucket(bucket: StorageBucket, path: string) {
  const client = getAdminClient() || getBrowserClient();
  if (!client) return { error: 'Storage غير مضبوط' };
  const { error } = await client.storage.from(bucket).remove([path]);
  return { error: error?.message };
}

/** قائمة ملفات المستخدم داخل bucket (حسب البادئة userId) */
export async function listUserFiles(bucket: StorageBucket, userId: string, limit = 50) {
  const client = getAdminClient() || getBrowserClient();
  if (!client) return { files: [], error: 'Storage غير مضبوط' };
  const { data, error } = await client.storage.from(bucket).list(userId, {
    limit,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) return { files: [], error: error.message };
  const files = (data || []).map((f) => {
    const path = `\( {userId}/ \){f.name}`;
    const { data: pub } = client.storage.from(bucket).getPublicUrl(path);
    return {
      name: f.name,
      path,
      size: f.metadata?.size,
      updatedAt: f.updated_at || f.created_at,
      publicUrl: pub?.publicUrl || null,
    };
  });
  return { files, error: null };
}
