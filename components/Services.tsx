"use client";

const services = [
{
icon:"🎨",
title:"الصور بالذكاء الاصطناعي",
items:[
"توليد الصور",
"تحويل النص إلى صورة",
"إزالة الخلفية",
"تغيير الخلفية",
"رفع الدقة",
"تحسين الصور القديمة",
"دمج الصور",
"تلبيس الصور"
]
},
{
icon:"🎬",
title:"الفيديو بالذكاء الاصطناعي",
items:[
"تحويل النص إلى فيديو",
"تحويل الصورة إلى فيديو",
"رفع دقة الفيديو",
"تغيير الوجه",
"تحريك الصور",
"ترجمة الفيديو",
"دبلجة الفيديو",
"إنشاء الإعلانات"
]
},
{
icon:"🎵",
title:"الموسيقى",
items:[
"توليد أغنية",
"توليد شيلة",
"توليد زفة",
"إنشاء موسيقى",
"استنساخ الصوت",
"تنقية الصوت",
"فصل الموسيقى",
"تحويل الكلمات إلى أغنية"
]
},
{
icon:"💻",
title:"البرمجة",
items:[
"برمجة مواقع",
"برمجة تطبيقات",
"كتابة الأكواد",
"تصحيح الأخطاء",
"إنشاء قواعد البيانات",
"تصميم API",
"تحليل الأكواد",
"تحويل التصميم إلى كود"
]
},
{
icon:"🤖",
title:"الدردشة الذكية",
items:[
"Chat AI",
"كتابة المقالات",
"تلخيص الملفات",
"الترجمة",
"تحليل الملفات",
"OCR",
"المساعدة البرمجية",
"الإجابة الذكية"
]
},
{
icon:"🎙️",
title:"الصوت والمستندات",
items:[
"تحويل الكلام إلى نص",
"تحويل النص إلى صوت",
"تلخيص PDF",
"تحليل Word",
"قراءة الصور",
"استخراج النصوص",
"ترجمة المستندات",
"تحويل الملفات"
]
}
];

export default function Services(){

return(

<section id="services" className="py-24 bg-slate-900">

<div className="max-w-7xl mx-auto px-6">

<div className="text-center mb-16">

<h2 className="text-5xl font-bold">
خدمات المنصة
</h2>

<p className="text-slate-400 mt-6 text-xl">
كل أدوات الذكاء الاصطناعي في منصة عربية واحدة.
</p>

</div>

<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

{services.map((service)=>(

<div
key={service.title}
className="rounded-3xl bg-slate-950 border border-slate-800 hover:border-blue-500 transition p-8 shadow-xl">

<div className="text-6xl mb-6">
{service.icon}
</div>

<h3 className="text-2xl font-bold mb-6">
{service.title}
</h3>

<ul className="space-y-3">

{service.items.map((item)=>(

<li
key={item}
className="flex items-center gap-3 text-slate-300">

<span className="text-green-400">
✔
</span>

{item}

</li>

))}

</ul>

<button
className="w-full mt-8 rounded-xl bg-blue-600 hover:bg-blue-700 transition py-3 font-bold">

ابدأ الآن

</button>

</div>

))}

</div>

</div>

</section>

);

}
