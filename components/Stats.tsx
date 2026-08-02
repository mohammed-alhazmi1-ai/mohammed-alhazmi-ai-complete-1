"use client";

const stats = [
  {
    title: "المستخدمون",
    value: "0+",
    icon: "👥",
  },
  {
    title: "الصور المنشأة",
    value: "0+",
    icon: "🖼️",
  },
  {
    title: "الفيديوهات",
    value: "0+",
    icon: "🎬",
  },
  {
    title: "الموسيقى",
    value: "0+",
    icon: "🎵",
  },
  {
    title: "المحادثات",
    value: "0+",
    icon: "💬",
  },
  {
    title: "نماذج الذكاء الاصطناعي",
    value: "20+",
    icon: "🤖",
  },
];

export default function Stats() {
  return (
    <section className="py-20 bg-slate-950 border-y border-slate-800">

      <div className="container mx-auto max-w-7xl px-6">

        <div className="text-center mb-14">

          <h2 className="text-4xl font-bold">
            إحصائيات المنصة
          </h2>

          <p className="text-slate-400 mt-4">
            تزداد هذه الأرقام تلقائياً مع استخدام المنصة.
          </p>

        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">

          {stats.map((item) => (

            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center hover:border-blue-500 transition"
            >

              <div className="text-5xl mb-4">
                {item.icon}
              </div>

              <div className="text-3xl font-extrabold text-blue-400">
                {item.value}
              </div>

              <div className="mt-3 text-slate-300">
                {item.title}
              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}
