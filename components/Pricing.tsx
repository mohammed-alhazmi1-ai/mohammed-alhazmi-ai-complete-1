"use client";

const plans = [
{
name:"🆓 Free",
price:"مجاناً",
credits:"100 Credit",
color:"border-slate-700",
features:[
"100 Credit عند التسجيل",
"الوصول الأساسي",
"دعم محدود",
"سرعة عادية"
]
},
{
name:"⭐ Basic",
price:"$9",
credits:"1,000 Credit",
color:"border-blue-500",
features:[
"1000 Credit",
"سرعة أعلى",
"جميع أدوات الصور",
"دعم أفضل"
]
},
{
name:"💎 Pro",
price:"$29",
credits:"5,000 Credit",
color:"border-purple-500",
features:[
"5000 Credit",
"جميع خدمات المنصة",
"إنشاء الفيديو",
"إنشاء الموسيقى",
"أولوية التنفيذ"
]
},
{
name:"🏢 Business",
price:"$99",
credits:"20,000 Credit",
color:"border-yellow-500",
features:[
"20000 Credit",
"فرق العمل",
"API Access",
"تقارير متقدمة"
]
},
{
name:"👑 Enterprise",
price:"تواصل معنا",
credits:"غير محدود",
color:"border-green-500",
features:[
"استخدام غير محدود",
"خادم مخصص",
"دعم VIP",
"تكامل خاص"
]
},
{
name:"🎁 Gift Plan",
price:"كود هدية",
credits:"حسب الهدية",
color:"border-pink-500",
features:[
"يتم التفعيل بكود",
"يمنحه مدير المنصة",
"صلاحيات خاصة",
"مدة محددة"
]
}
];

export default function Pricing(){

return(

<section id="pricing" className="py-24 bg-slate-900">

<div className="max-w-7xl mx-auto px-6">

<div className="text-center mb-16">

<h2 className="text-5xl font-bold">
الخطط والاشتراكات
</h2>

<p className="text-slate-400 mt-5 text-xl">
اختر الخطة المناسبة لاحتياجاتك.
</p>

</div>

<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

{plans.map((plan)=>(

<div
key={plan.name}
className={`rounded-3xl bg-slate-950 border ${plan.color} p-8`}>

<h3 className="text-3xl font-bold mb-5">
{plan.name}
</h3>

<div className="text-4xl text-blue-400 font-bold mb-3">
{plan.price}
</div>

<div className="text-green-400 mb-6">
{plan.credits}
</div>

<ul className="space-y-3">

{plan.features.map((f)=>(

<li
key={f}
className="flex items-center gap-3">

<span className="text-green-400">✔</span>

<span>{f}</span>

</li>

))}

</ul>

<button
className="mt-8 w-full rounded-xl bg-blue-600 hover:bg-blue-700 transition py-3 font-bold">

اختيار الخطة

</button>

</div>

))}

</div>

<div className="mt-14 text-center">

<button
className="rounded-2xl bg-pink-600 hover:bg-pink-700 transition px-8 py-4 text-lg font-bold">

🎁 لدي كود هدية

</button>

</div>

</div>

</section>

);
}
