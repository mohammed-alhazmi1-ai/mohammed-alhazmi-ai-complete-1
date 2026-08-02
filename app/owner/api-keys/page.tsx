import OwnerPageShell from '@/components/owner/OwnerPageShell';

export default function Page() {
  return (
    <OwnerPageShell title="مفاتيح API" description="إدارة مفاتيح الربط بشكل آمن">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <p className="text-slate-400 text-sm">هذا القسم جاهز في القائمة — الربط الديناميكي مع قاعدة البيانات قادم في التحديث التالي.</p>
        <p className="text-slate-600 text-xs mt-2">يمكنك البدء بتعبئة البيانات من لوحة المالك الرئيسية وأكواد الهدايا.</p>
      </div>
    </OwnerPageShell>
  );
}
