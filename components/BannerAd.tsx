"use client";
import { useEffect, useRef } from "react";

export default function BannerAd() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bannerRef.current && !bannerRef.current.querySelector("script")) {
      const script = document.createElement("script");
      script.src = "//massivesalad.com/bvX-Vas.dyGTlk0/YIW/cH/hebmf9muwZeU/lck/PKTYcHykOeTXYxyqOHDOU/tQNTz/Iq5pNYj/Ic4-OzQq";
      script.async = true;
      script.referrerPolicy = "no-referrer-when-downgrade";
      bannerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="my-6 flex justify-center items-center overflow-hidden">
      <div ref={bannerRef} />
    </div>
  );
}
