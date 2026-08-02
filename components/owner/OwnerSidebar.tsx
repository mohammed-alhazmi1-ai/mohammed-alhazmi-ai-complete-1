'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Wallet,
  ArrowDownToLine,
  Cpu,
  KeyRound,
  Settings,
  DatabaseBackup,
  Gift,
  CreditCard,
  ScrollText,
  Wrench,
  Smartphone,
  Store,
} from 'lucide-react';

const ownerMenuItems = [
  { name: 'Dashboard', title: 'الرئيسية', href: '/owner/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', title: 'التحليلات', href: '/owner/analytics', icon: BarChart3 },
  { name: 'AI Providers', title: 'مزودو AI', href: '/owner/providers', icon: Cpu },
  { name: 'API Keys', title: 'مفاتيح API', href: '/owner/api-keys', icon: KeyRound },
  { name: 'Users', title: 'المستخدمين', href: '/owner/users', icon: Users },
  { name: 'Wallets', title: 'المحافظ', href: '/owner/wallets', icon: Wallet },
  { name: 'Withdrawals', title: 'السحوبات', href: '/owner/withdrawals', icon: ArrowDownToLine },
  { name: 'Payments', title: 'المدفوعات', href: '/owner/payments', icon: CreditCard },
  { name: 'Gift Codes', title: 'أكواد الهدايا', href: '/owner/gift-codes', icon: Gift },
  { name: 'Logs', title: 'السجلات', href: '/owner/logs', icon: ScrollText },
  { name: 'Settings', title: 'الإعدادات', href: '/owner/settings', icon: Settings },
  { name: 'Maintenance', title: 'الصيانة', href: '/owner/maintenance', icon: Wrench },
  { name: 'Backup', title: 'النسخ الاحتياطي', href: '/owner/backup', icon: DatabaseBackup },
  { name: 'Mobile App', title: 'تطبيق الموبايل', href: '/owner/mobile-app', icon: Smartphone },
  { name: 'Marketplace', title: 'المتجر', href: '/owner/marketplace', icon: Store },
];

export default function OwnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen p-3 flex flex-col border-l border-slate-800 shrink-0" dir="rtl">
      <div className="mb-6 px-3 py-2 border-b border-slate-800">
        <h1 className="text-lg font-bold text-white tracking-wide">لوحة المالك 👑</h1>
        <p className="text-[10px] text-slate-500 mt-0.5">Mohammed Alhazmi AI · Enterprise</p>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {ownerMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.title}</span>
              <span className="mr-auto text-[9px] opacity-40 font-mono hidden xl:inline">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="pt-3 border-t border-slate-800 mt-2">
        <Link href="/" className="block text-center text-xs text-slate-500 hover:text-white py-2">
          ← العودة للموقع
        </Link>
      </div>
    </aside>
  );
}
