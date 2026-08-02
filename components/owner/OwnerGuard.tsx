'use client';
import { useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured, supabaseConfigError } from '@/lib/supabase';

const supabase = getSupabase();

export default function OwnerGuard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        window.location.href = '/login';
        return;
      }

      const email = session.user.email.toLowerCase();
      const role =
        session.user.user_metadata?.role ||
        session.user.app_metadata?.role ||
        '';
      const ownerEmails = (process.env.NEXT_PUBLIC_OWNER_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const isOwner =
        role === 'OWNER' ||
        role === 'ADMIN' ||
        ownerEmails.includes(email);

      if (!isOwner) {
        // محاولة التحقق من الخادم
        try {
          const res = await fetch('/api/user/me', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          if (data.role === 'OWNER' || data.role === 'ADMIN') {
            setOk(true);
            setChecking(false);
            return;
          }
        } catch {
          /* fallthrough */
        }
        window.location.href = '/dashboard';
        return;
      }

      setOk(true);
      setChecking(false);
    }
    check();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm" dir="rtl">
        جاري التحقق من صلاحيات المالك...
      </div>
    );
  }

  if (!ok) return null;
  return <>{children}</>;
}
