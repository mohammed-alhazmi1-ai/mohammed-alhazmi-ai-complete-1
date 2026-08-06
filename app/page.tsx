import AnimatedPlatformName from '@/components/site/AnimatedPlatformName'
import SiteLogo from '@/components/site/SiteLogo'
import React from "react";

export default function Page({ settings }: { settings?: any }) {
  const primary = settings?.primaryColor || "#2563eb";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans" dir="rtl">
      <div className="pt-20 pb-4 px-4 z-10 relative">
        <AnimatedPlatformName size="xl" />
      </div>
      </div>
  );
}