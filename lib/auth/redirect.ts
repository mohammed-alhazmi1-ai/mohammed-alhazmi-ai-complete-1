/**
 * تحديد وجهة التوجيه بعد تسجيل الدخول / إنشاء الحساب
 * المالك أو الأدمن → /owner/dashboard
 * المستخدم العادي → /dashboard
 *
 * الدور يُقرأ من:
 * 1) user_metadata.role في Supabase
 * 2) أو قائمة إيميلات المالك في NEXT_PUBLIC_OWNER_EMAILS
 */
export function getPostAuthRedirect(user: {
  email?: string | null;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
} | null): string {
  if (!user) return '/login';

  const role =
    user.user_metadata?.role ||
    user.app_metadata?.role ||
    '';

  const ownerEmails = (process.env.NEXT_PUBLIC_OWNER_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const email = (user.email || '').toLowerCase();
  const isOwner =
    role === 'OWNER' ||
    role === 'ADMIN' ||
    (email && ownerEmails.includes(email));

  return isOwner ? '/owner/dashboard' : '/dashboard';
}
