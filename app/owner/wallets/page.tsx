'use client';
import { useState } from 'react';
import OwnerPageShell from '@/components/owner/OwnerPageShell';

const GATEWAYS = [
  { id: 'paypal', name: 'PayPal', desc: 'بطاقات وحساب PayPal', icon: '💙' },
  { id: 'stripe', name: 'Stripe', desc: 'بطاقات ائتمان دولية', icon: '💳' },
  { id: 'binance', name: 'Binance Pay', desc: 'دفع عبر Binance', icon: '🟡' },
  { id: 'coinbase', name: 'Coinbase Commerce', desc: 'عملات رقمية', icon: '🔵' },
  { id: 'payoneer', name: 'Payoneer', desc: 'تحويلات Payoneer', icon: '🟢' },
  { id: 'wise', name: 'Wise', desc: 'تحويلات بنكية دولية', icon: '🔷' },
  { id: 'usdt', name: 'USDT (TRC20 / ERC20)', desc: 'تيثر على شبكات TRON و Ethereum', icon: '₮' },
  { id: 'local', name: 'محافظ محلية', desc: 'قابلة للإضافة — تحويل محلي / بنوك يمنية وخليجية', icon: '🏦' },
];

export default function OwnerWalletsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    paypal: false,
    stripe: false,
    binance: false,
    coinbase: false,
    payoneer: false,
    wise: false,
    usdt: false,
    local: true,
  });

  const toggle = (id: string) => setEnabled((s) => ({ ...s, [id]: !s[id] }));

  return (
    <OwnerPageShell
      title="المحافظ وطرق الدفع 💰"
      description="تفعيل بوابات الدفع التي ستظهر للمستخدمين عند شحن الرصيد أو الاشتراك"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        {GATEWAYS.map((g) => (
          <div
            key={g.id}
            className={`rounded-2xl border p-5 flex items-center justify-between gap-4 transition ${
              enabled[g.id]
                ? 'border-emerald-800/50 bg-emerald-950/20'
                : 'border-slate-800 bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0">{g.icon}</span>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm">{g.name}</p>
                <p className="text-xs text-slate-500 truncate">{g.desc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!enabled[g.id]}
                onChange={() => toggle(g.id)}
              />
              <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:-translate-x-full" />
            </label>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-4">
        الربط الفعلي لمفاتيح Stripe / PayPal يتم من قسم «مفاتيح API» أو «الإعدادات». التبديل هنا يتحكم بالظهور للمستخدم.
      </p>
    </OwnerPageShell>
  );
}
