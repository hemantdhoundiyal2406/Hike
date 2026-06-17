"use client";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
export function Logo({ compact = false }) {
    const { logoUrl } = useTheme();
    return (<a href="#home" className="group inline-flex items-center gap-3" aria-label="hike agency home">
      {logoUrl ? (<span className="dynamic-logo-image">
          <Image src={logoUrl} alt="hike agency logo" width={compact ? 44 : 140} height={44} className="object-contain" unoptimized/>
        </span>) : (<span className="relative grid size-11 place-items-center">
          <span className="logo-mark-frame absolute inset-0 rotate-45 rounded-[10px] border transition group-hover:rotate-[55deg]"/>
          <span className="logo-mark-text relative text-lg font-black tracking-[-0.12em]">
            h<span>a</span>
          </span>
        </span>)}
      {!compact && (<span className="leading-none">
          <span className="logo-wordmark block font-[family-name:var(--font-manrope)] text-[15px] font-semibold tracking-[0.24em]">
            HIKE
          </span>
          <span className="logo-tagline mt-1.5 block text-[9px] tracking-[0.42em]">
            DIGITAL AGENCY
          </span>
        </span>)}
    </a>);
}
