import { getSupabase } from '@/lib/supabase';

export function createBrowserClient() {
  return getSupabase();
}

export async function getSession() {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signOut() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
}
