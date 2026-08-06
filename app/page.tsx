import React from "react";
import SiteLogo from "@/components/SiteLogo";
import AnimatedPlatformName from "@/components/AnimatedPlatformName";

export default function Page({ settings }: { settings?: any }) {
  const primary = settings?.primaryColor || "#2563eb";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans" dir="rtl">
      <div className="absolute top-4 right-4 z-20 px-4">
        <div className="py-6 px-4">
          <AnimatedPlatformName size="xl" />
        </div>
        <SiteLogo />
      </div>
    </div>
  );
}