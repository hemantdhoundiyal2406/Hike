"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";

const links = [
  ["Services", "services"],
  ["Work", "work"],
  ["Process", "process"],
  ["Testimonials", "testimonials"],
  ["Book a call", "contact"],
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#05050a]/88 px-5 py-3 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between">
        <Logo compact />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid size-10 place-items-center rounded-xl border border-white/10 text-white"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="grid gap-1 pb-3 pt-5" aria-label="Mobile navigation">
          {links.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
