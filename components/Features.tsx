"use client";

const features = [
{
icon:"🚀",
title:"أكثر من 20 مزود ذكاء اصطناعي",
desc:"اختر بين OpenAI وGemini وClaude وDeepSeek وGrok وMistral وغيرهم."
},
{
icon:"⚡",
title:"سرعة فائقة",
desc:"تنفيذ سريع للطلبات مع توزيع الأحمال على أفضل مزود متاح."
},
{
icon:"🛡️",
title:"حماية وأمان",
desc:"تشفير البيانات وحماية مفاتيح API وسجل كامل للعمليات."
},
{
icon:"💰",
title:"نظام الرصيد",
desc:"رصيد مجاني عند التسجيل مع إمكانية الشحن والاشتراك."
},
{
icon:"🎁",
title:"أكواد الهدايا",
desc:"تفعيل الخطط بواسطة أكواد هدايا أو عروض خاصة."
},
{
icon:"🌍",
title:"دعم متعدد اللغات",
desc:"العربية والإنجليزية مع واجهة احترافية بالكامل."
},
{
icon:"📁",
title:"حفظ المشاريع",
desc:"جميع أعمالك محفوظة ويمكن الرجوع إليها في أي وقت."
},
{
icon:"📱",
title:"يعمل على جميع الأجهزة",
desc:"الجوال والتابلت والكمبيوتر دون الحاجة إلى تطبيق."
},
{
icon:"🤖",
title:"مساعد ذكي",
desc:"مساعد مدمج داخل المنصة للإجابة على الأسئلة ومساعدة المستخدم."
}
];

export default function Features(){

return(

<section className="py-24 bg-slate-950">

<div className="max-w-7xl mx-auto px-6">

<div className="text-center mb-16">

<h2 className="text-5xl font-bold">
لماذا Mohammed Alhazmi AI ؟
</h2>

<p className="text-slate-400 mt-5 text-xl">
منصة عربية احترافية تجمع جميع أدوات الذكاء الاصطناعي في مكان واحد.
</p>

</div>

<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

{features.map((feature)=>(

<div
key={feature.title}
className="rounded-3xl border border-slate-800 bg-slate-900 p-8 hover:border-blue-500 transition duration-300">

<div className="text-5xl mb-6">
{feature.icon}
</div>

<h3 className="text-2xl font-bold mb-4">
{feature.title}
</h3>

<p className="text-slate-400 leading-8">
{feature.desc}
</p>

</div>

))}

</div>

</div>

</section>

);

}
