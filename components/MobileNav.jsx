"use client";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeModeToggle } from "@/components/ThemeModeToggle";
const links = [
    ["Services", "services"],
    ["Work", "work"],
    ["Process", "process"],
    ["Testimonials", "testimonials"],
    ["Book a call", "contact"],
];
export function MobileNav() {
    const [open, setOpen] = useState(false);
    return (<header className="mobile-nav-header fixed inset-x-0 top-0 z-50 border-b px-5 py-3 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between">
        <Logo compact/>
        <div className="flex items-center gap-2">
          <ThemeModeToggle compact/>
          <button type="button" onClick={() => setOpen((value) => !value)} className="mobile-nav-menu-button grid size-10 place-items-center rounded-xl border" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>

      {open && (<nav className="grid gap-1 pb-3 pt-5" aria-label="Mobile navigation">
          {links.map(([label, id]) => (<a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="mobile-nav-link rounded-xl px-4 py-3 transition">
              {label}
            </a>))}
        </nav>)}
    </header>);
}
