import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  url && anon && url.startsWith('http') && anon.length > 20
);

const SAFE_URL = url || 'https://placeholder.supabase.co';
const SAFE_KEY =
  anon ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjAsImV4cCI6MH0.placeholder';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(SAFE_URL, SAFE_KEY, {
      auth: {
        persistSession: isSupabaseConfigured,
        autoRefreshToken: isSupabaseConfigured,
      },
    });
  }
  return _client;
}

export const supabase = getSupabase();

export const supabaseConfigError = isSupabaseConfigured
  ? null
  : 'إعدادات Supabase غير مكتملة. أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY في .env ثم أعد تشغيل npm run dev';

/** عميل السيرفر بمفتاح service role */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url || !key) return null
  const { createClient } = require('@supabase/supabase-js')
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export const supabaseAdmin =
  typeof window === 'undefined' ? getSupabaseAdmin() : null
