'use client';
import { useEffect } from 'react';

export default function OwnerDashboardRedirect() {
  useEffect(() => {
    window.location.replace('/owner');
  }, []);
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center" dir="rtl">
      <p className="text-sm text-slate-400">جاري التحويل إلى لوحة المالك...</p>
    </div>
  );
}
