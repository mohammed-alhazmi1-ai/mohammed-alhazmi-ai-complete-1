'use client'
import SocialButtons from './SocialButtons'

/** ضع هذا في نهاية الصفحة الرئيسية */
export default function HomeSocialSection() {
  return (
    <section className="w-full py-12 px-4 border-t border-white/10 bg-black/20">
      <div className="max-w-3xl mx-auto">
        <SocialButtons variant="landing" />
      </div>
    </section>
  )
}
