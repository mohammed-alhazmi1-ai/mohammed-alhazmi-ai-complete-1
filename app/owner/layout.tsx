import OwnerSidebar from '@/components/owner/OwnerSidebar';
import OwnerGuard from '@/components/owner/OwnerGuard';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <OwnerGuard>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
        <OwnerSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </OwnerGuard>
  );
}
