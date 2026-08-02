'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

const BUCKETS = [
  { id: 'uploads', label: 'رفع المستخدم' },
  { id: 'generated', label: 'مولَّد' },
  { id: 'images', label: 'صور' },
  { id: 'videos', label: 'فيديو' },
  { id: 'audio', label: 'صوت' },
  { id: 'documents', label: 'مستندات' },
];

type FileItem = {
  name: string;
  path: string;
  publicUrl: string | null;
  size?: number;
  updatedAt?: string;
};

export default function FilesPage() {
  const [email, setEmail] = useState('');
  const [bucket, setBucket] = useState('uploads');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = async (em: string, b: string) => {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`/api/storage?email=\( {encodeURIComponent(em)}&bucket= \){b}`);
      const data = await res.json();
      if (data.message && !data.configured) setMsg(data.message);
      if (data.error) setMsg(data.error);
      setFiles(data.files || []);
    } catch (e: any) {
      setMsg(e.message || 'خطأ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        window.location.href = '/login';
        return;
      }
      setEmail(session.user.email);
      await load(session.user.email, bucket);
    })();
  }, []);

  useEffect(() => {
    if (email) load(email, bucket);
  }, [bucket]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !email) return;
    setUploading(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('email', email);
      fd.append('bucket', bucket);
      fd.append('file', file);
      const res = await fetch('/api/storage/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الرفع');
      setMsg('تم رفع الملف بنجاح');
      await load(email, bucket);
    } catch (err: any) {
      setMsg(err.message || 'فشل الرفع');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white">← لوحة التحكم</Link>
            <h1 className="font-bold text-sm">📁 ملفاتي</h1>
          </div>
          <label className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 cursor-pointer font-bold">
            {uploading ? 'جاري الرفع...' : '+ رفع ملف'}
            <input type="file" className="hidden" onChange={onUpload} disabled={uploading} />
          </label>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {BUCKETS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBucket(b.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                bucket === b.id
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {msg && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300/90 leading-relaxed">
            {msg}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500 text-sm">جاري التحميل...</p>
        ) : files.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-500 text-sm">
            لا ملفات في هذا القسم. ارفع ملفاً أو انتظر التوليد بعد ربط المزودين.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {files.map((f) => (
              <div key={f.path} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
                <p className="text-sm font-bold text-white truncate">{f.name}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">{f.path}</p>
                {f.publicUrl && (
                  <a
                    href={f.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs text-blue-400 hover:underline"
                  >
                    فتح / تحميل ←
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
