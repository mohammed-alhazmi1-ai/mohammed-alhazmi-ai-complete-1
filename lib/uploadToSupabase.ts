import { supabaseAdmin } from './supabase';

export async function uploadMediaToSupabase(
  fileBuffer: Buffer,
  fileName: string,
  bucketName: 'images' | 'audio' | 'video',
  contentType: string
): Promise<string> {
  const filePath = `generated/${Date.now()}_${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`فشل رفع الملف إلى Supabase Storage: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
// --- استكمال المرحلة 3: إعادة تصدير طبقة التخزين الموحدة ---
export {
  uploadToBucket,
  listUserFiles,
  removeFromBucket,
  buildStoragePath,
  isStorageConfigured,
  STORAGE_BUCKETS,
} from '@/lib/storage';
