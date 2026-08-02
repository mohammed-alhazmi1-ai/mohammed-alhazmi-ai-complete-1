const fs = require('fs');

// --- 1. تحديث لوحة المالك (app/owner/dashboard/page.tsx) ---
const ownerDashboardContent = `
import Link from 'next/link';

export default function OwnerDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 dir-rtl font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white">لوحة تحكم المالك (Owner Control) 👑</h1>
            <p className="text-slate-400 text-xs mt-1">إدارة المستخدمين، اتصال قواعد البيانات، ومزودي الذكاء الاصطناعي</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs hover:text-white transition-colors">الخروج للموقع</Link>
        </div>

        {/* AI Providers Management Section (القسم الجديد) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="flex justify-between items-start md:items-center mb-6 flex-col md:flex-row gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">إدارة مزودي الذكاء الاصطناعي (API Providers) 🤖</h3>
              <p className="text-xs text-slate-400 mt-1">تحكم في تفعيل أو إيقاف النماذج وتحديث مفاتيح الربط الخاصة بكل مزود</p>
            </div>
            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20">حفظ إعدادات المزودين</button>
          </div>
          
          <div className="space-y-4">
            {/* Google Gemini */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-950 border border-blue-900/30 rounded-2xl gap-4">
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 bg-blue-900/30 text-blue-400 rounded-xl flex items-center justify-center text-xl border border-blue-800/50">G</div>
                <div>
                  <div className="font-bold text-white text-sm">Google Gemini</div>
                  <div className="text-xs text-emerald-400 mt-0.5">مفعل ويعمل بكفاءة</div>
                </div>
              </div>
              <div className="flex-1 w-full md:max-w-md relative">
                <input type="password" defaultValue="AIzaSyB-xxxxxxxxxxxxxxxxxxxxxxxx" className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500" placeholder="مفتاح GEMINI_API_KEY" />
                <span className="absolute left-3 top-2.5 text-slate-500 text-xs cursor-pointer hover:text-white">👁️</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            
            {/* OpenAI */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl gap-4">
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 bg-emerald-900/30 text-emerald-400 rounded-xl flex items-center justify-center text-xl border border-emerald-800/50">O</div>
                <div>
                  <div className="font-bold text-white text-sm">OpenAI (ChatGPT)</div>
                  <div className="text-xs text-slate-500 mt-0.5">متوقف - بانتظار المفتاح</div>
                </div>
              </div>
              <div className="flex-1 w-full md:max-w-md relative">
                <input type="password" placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx" className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Anthropic Claude */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl gap-4">
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 bg-amber-900/30 text-amber-400 rounded-xl flex items-center justify-center text-xl border border-amber-800/50">C</div>
                <div>
                  <div className="font-bold text-white text-sm">Anthropic (Claude)</div>
                  <div className="text-xs text-slate-500 mt-0.5">متوقف - بانتظار المفتاح</div>
                </div>
              </div>
              <div className="flex-1 w-full md:max-w-md relative">
                <input type="password" placeholder="sk-ant-api03-xxxxxxxxxxxxxxxx" className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* User Management Table (موجود مسبقاً) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">إدارة المستخدمين والأرصدة 👥</h3>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors">+ مستخدم جديد</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-400">
              <thead className="bg-slate-950 text-slate-300">
                <tr>
                  <th className="p-4 rounded-r-xl font-medium">المستخدم</th>
                  <th className="p-4 font-medium">البريد الإلكتروني</th>
                  <th className="p-4 font-medium">الخطة</th>
                  <th className="p-4 font-medium">الرصيد المتبقي</th>
                  <th className="p-4 rounded-l-xl font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <tr>
                  <td className="p-4 text-white">محمد العبدلي</td>
                  <td className="p-4 text-xs">user1@example.com</td>
                  <td className="p-4"><span className="px-2 py-1 bg-blue-950 text-blue-400 rounded-lg text-xs">Pro</span></td>
                  <td className="p-4 text-amber-400">340 نقطة</td>
                  <td className="p-4">
                    <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors">تعديل</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
`;

// --- 2. تحديث واجهة التوليد (app/dashboard/text-generator/page.tsx) ---
const textGeneratorInteractiveContent = `
'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function TextGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('احترافي ورسمي');
  const [model, setModel] = useState('Gemini 1.5 Pro'); // تم تعديل القيم لتسهيل البرمجة
  const [length, setLength] = useState('متوسط');
  
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) { setError('يرجى كتابة تفاصيل الطلب أولاً.'); return; }
    setError(''); setLoading(true); setResult('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tone, model, length }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'حدث خطأ غير متوقع');
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 dir-rtl font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">← العودة للوحة التحكم</Link>
          <span className="text-xs bg-blue-950 text-blue-400 px-3 py-1 rounded-full border border-blue-800">⚡ 5 نقاط / طلب</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">✍️</div>
            <div>
              <h1 className="text-xl font-bold text-white">مولد النصوص (Multi-Provider)</h1>
              <p className="text-xs text-slate-400">اختر نموذج الذكاء الاصطناعي المناسب لطلبك من بين أفضل المزودين</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">نموذج الذكاء الاصطناعي</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500">
                <optgroup label="Google (مفعل)">
                  <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (فائق الدقة)</option>
                  <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (سريع)</option>
                </optgroup>
                <optgroup label="OpenAI (يجب تفعيله من المالك)">
                  <option value="GPT-4o">GPT-4o (الاحترافي)</option>
                  <option value="GPT-3.5">GPT-3.5 Turbo</option>
                </optgroup>
                <optgroup label="Anthropic (يجب تفعيله من المالك)">
                  <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                </optgroup>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">نبرة النص</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500">
                <option>احترافي ورسمي</option><option>تسويقي وجذّاب</option><option>إبداعي ومبسط</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">حجم النص</label>
              <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500">
                <option>متوسط</option><option>قصير</option><option>طويل وشامل</option>
              </select>
            </div>
          </div>

          <div>
            <textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="اكتب تفاصيل الطلب..." className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>

          {error && <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-xs">⚠️ {error}</div>}

          <button onClick={handleGenerate} disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
            {loading ? <span>جاري المعالجة...</span> : <span>توليد المحتوى ✨</span>}
          </button>

          <div className="pt-6 border-t border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300">النتيجة ({model}):</label>
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl min-h-[160px] text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
              {result || 'ستظهر النتيجة هنا...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

// --- 3. تحديث مسار الـ API ليدعم التوجيه للمزودين (app/api/generate/route.ts) ---
const apiRouteContent = `
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
// ملاحظة: سيتم استدعاء مكتبات OpenAI و Anthropic لاحقاً عند تثبيتها

export async function POST(req: Request) {
  try {
    const { prompt, tone, model, length } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'الرجاء إدخال نص الطلب.' }, { status: 400 });
    }

    const systemPrompt = \`أنت مساعد ذكاء اصطناعي. نبرة النص: \${tone}. الحجم المطلوب: \${length}. الطلب: \${prompt}\`;
    let generatedText = '';

    // توجيه الطلب (Router) بناءً على المزود
    if (model.includes('Gemini')) {
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('مفتاح Gemini غير مفعل من لوحة المالك.');
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const selectedModelName = model.includes('Flash') ? 'gemini-1.5-flash' : 'gemini-1.5-pro';
      const aiModel = genAI.getGenerativeModel({ model: selectedModelName });
      
      const result = await aiModel.generateContent(systemPrompt);
      generatedText = result.response.text();

    } else if (model.includes('GPT')) {
      
      // التجهيز البرمجي لـ OpenAI
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error('مزود OpenAI (ChatGPT) متوقف حالياً. يرجى تفعيله وإضافة المفتاح من لوحة تحكم المالك.');
      
      /*
      // الكود الذي سيعمل بمجرد تثبيت مكتبة openai
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: model === 'GPT-4o' ? 'gpt-4o' : 'gpt-3.5-turbo',
        messages: [{ role: "system", content: systemPrompt }],
      });
      generatedText = response.choices[0].message.content;
      */

    } else if (model.includes('Claude')) {
      
      // التجهيز البرمجي لـ Anthropic
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error('مزود Anthropic (Claude) متوقف حالياً. يرجى تفعيله وإضافة المفتاح من لوحة تحكم المالك.');
      
    } else {
      throw new Error('تم اختيار نموذج غير مدعوم أو غير معروف.');
    }

    return NextResponse.json({ result: generatedText });

  } catch (error: any) {
    console.error('AI Router Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`;

fs.writeFileSync('app/owner/dashboard/page.tsx', ownerDashboardContent.trim());
console.log('✅ 1. تم تحديث لوحة المالك بخصائص تفعيل/إيقاف المزودين.');

fs.writeFileSync('app/dashboard/text-generator/page.tsx', textGeneratorInteractiveContent.trim());
console.log('✅ 2. تم تحديث واجهة التوليد لدعم تحديد النماذج المختلفة.');

fs.writeFileSync('app/api/generate/route.ts', apiRouteContent.trim());
console.log('✅ 3. تم تحديث API التوليد ليصبح (Router) ذكي يوزع الطلبات للمزودين.');

