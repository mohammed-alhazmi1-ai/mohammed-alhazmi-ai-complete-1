'use client';
import { useState } from 'react';
import OwnerPageShell from '@/components/owner/OwnerPageShell';

export default function MobileAppPage() {
  const [apiEnabled, setApiEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [minVersion, setMinVersion] = useState('1.0.0');
  const [storeUrl, setStoreUrl] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <OwnerPageShell
      title="تطبيق الموبايل 📱"
      description="تجهيز المنصة للربط مع تطبيق iOS / Android مستقبلاً عبر API موحّد"
    >
      <div className="space-y-6">
        {/* Status */}
        <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-5">
          <h3 className="font-bold text-white text-sm mb-2">حالة التكامل</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            المنصة مبنية كـ <strong className="text-white">SaaS ويب</strong> مع REST API جاهز للتوسع.
            عند بناء تطبيق الموبايل (React Native / Flutter) يمكنه استخدام نفس نقاط النهاية:
            المصادقة، التوليد، الرصيد، الاشتراكات، وأكواد الهدايا — دون إعادة بناء المنطق.
          </p>
        </div>

        {/* Toggles */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="font-bold text-white text-sm">إعدادات التطبيق</h3>

          <label className="flex items-center justify-between gap-4 py-2">
            <div>
              <p className="text-sm text-white">تفعيل Mobile API</p>
              <p className="text-[11px] text-slate-500">السماح للتطبيق بالوصول عبر مفاتيح API منفصلة</p>
            </div>
            <input
              type="checkbox"
              checked={apiEnabled}
              onChange={(e) => setApiEnabled(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between gap-4 py-2 border-t border-slate-800">
            <div>
              <p className="text-sm text-white">إشعارات Push</p>
              <p className="text-[11px] text-slate-500">FCM / APNs عند جاهزية التطبيق</p>
            </div>
            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={(e) => setPushEnabled(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between gap-4 py-2 border-t border-slate-800">
            <div>
              <p className="text-sm text-white">فرض التحديث</p>
              <p className="text-[11px] text-slate-500">إجبار المستخدمين على أحدث إصدار</p>
            </div>
            <input
              type="checkbox"
              checked={forceUpdate}
              onChange={(e) => setForceUpdate(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs text-slate-400 mb-1">الحد الأدنى للإصدار</label>
              <input
                type="text"
                value={minVersion}
                onChange={(e) => setMinVersion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">رابط المتجر (App Store / Play)</label>
              <input
                type="url"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                dir="ltr"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold"
          >
            حفظ الإعدادات
          </button>
          {saved && (
            <p className="text-emerald-400 text-xs">تم حفظ الإعدادات محلياً (الربط بقاعدة البيانات لاحقاً).</p>
          )}
        </div>

        {/* API endpoints reference */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="font-bold text-white text-sm mb-3">نقاط API جاهزة للتطبيق</h3>
          <ul className="space-y-2 text-xs font-mono text-slate-400" dir="ltr">
            <li className="flex gap-2"><span className="text-emerald-400">POST</span> /api/auth/* — تسجيل ودخول</li>
            <li className="flex gap-2"><span className="text-emerald-400">POST</span> /api/generate — توليد نصوص</li>
            <li className="flex gap-2"><span className="text-emerald-400">POST</span> /api/gift/redeem — أكواد هدايا</li>
            <li className="flex gap-2"><span className="text-blue-400">GET</span>  /api/owner/* — إدارة (محمية)</li>
          </ul>
          <p className="text-[11px] text-slate-500 mt-4">
            لاحقاً: إضافة مفاتيح API للتطبيق، OAuth للجوال، و Deep Links لفتح الخدمات من الإشعارات.
          </p>
        </div>
      </div>
    </OwnerPageShell>
  );
}
