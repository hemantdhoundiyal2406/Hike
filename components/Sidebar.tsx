"use client";

import {
  Boxes,
  BriefcaseBusiness,
  Camera,
  CalendarDays,
  Home,
  Link2,
  MessageCircleMore,
  Orbit,
  Quote,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeModeToggle } from "@/components/ThemeModeToggle";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "services", label: "Services", icon: Boxes },
  { id: "work", label: "Work", icon: BriefcaseBusiness },
  { id: "process", label: "Process", icon: Orbit },
  { id: "testimonials", label: "Testimonials", icon: Quote },
  { id: "contact", label: "Book a call", icon: CalendarDays },
];

export function Sidebar() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActive(visible.target.id);
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: "-10% 0px -20%" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="site-sidebar fixed inset-y-0 left-0 z-50 hidden w-[238px] border-r backdrop-blur-xl lg:flex lg:flex-col">
      <div className="px-7 pb-9 pt-8">
        <Logo />
      </div>

      <nav className="flex-1" aria-label="Primary navigation">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              className={`site-sidebar-link group relative flex items-center gap-4 px-7 py-4 transition ${
                isActive ? "active" : ""
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="site-sidebar-active-bar absolute inset-y-0 left-0 w-0.5" />
              )}
              <Icon
                size={19}
                strokeWidth={1.6}
                className={isActive ? "text-violet-300" : ""}
              />
              <span>{label}</span>
            </a>
          );
        })}
      </nav>

      <div className="px-7 pb-7">
        <ThemeModeToggle />
        <a href="#contact" className="outline-button w-full justify-center">
          Let&apos;s talk
          <span aria-hidden>↗</span>
        </a>
        <div className="mt-7 flex items-center justify-center gap-4 text-white/60">
          <a className="social-link" href="#" aria-label="LinkedIn">
            <Link2 size={16} />
          </a>
          <a className="social-link" href="#" aria-label="Instagram">
            <Camera size={16} />
          </a>
          <a className="social-link" href="#" aria-label="WhatsApp">
            <MessageCircleMore size={16} />
          </a>
        </div>
      </div>
    </aside>
  );
}
