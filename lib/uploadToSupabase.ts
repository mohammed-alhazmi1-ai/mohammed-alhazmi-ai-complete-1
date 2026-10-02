import { put } from '@vercel/blob';

export async function uploadMediaToSupabase(fileBuffer: Buffer, fileName: string, bucketName: 'images' | 'audio' | 'video', contentType: string): Promise<string> {
  const blob = await put(`${bucketName}/generated/${Date.now()}_${fileName}`, fileBuffer, { access: 'public', contentType, addRandomSuffix: false, allowOverwrite: true });
  return blob.url;
}
export { uploadToBucket, listUserFiles, removeFromBucket, buildStoragePath, isStorageConfigured, STORAGE_BUCKETS } from '@/lib/storage';
