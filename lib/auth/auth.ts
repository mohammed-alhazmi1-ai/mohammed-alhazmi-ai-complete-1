import { getSupabase } from '@/lib/auth/client';
export function createBrowserClient() { return getSupabase(); }
export async function getSession() { const { data: { session } } = await getSupabase().auth.getSession(); return session; }
export async function signOut() { await getSupabase().auth.signOut(); }
