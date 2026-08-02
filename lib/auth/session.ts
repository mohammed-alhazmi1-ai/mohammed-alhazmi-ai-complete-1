// Session helpers - expand with server components later using @supabase/ssr
export type SessionUser = {
  id: string;
  email?: string;
  role?: string;
};

export function isOwner(role?: string) {
  return role === 'OWNER' || role === 'ADMIN';
}
