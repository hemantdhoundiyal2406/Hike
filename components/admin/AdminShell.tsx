"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Quote,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { Logo } from "@/components/Logo";
import type { AdminSession } from "@/lib/auth";
import { ToastProvider } from "@/components/admin/ToastProvider";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/projects", label: "Projects", icon: BriefcaseBusiness },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/settings", label: "Settings", icon: Palette },
];

export function AdminShell({
  session,
  children,
}: {
  session: AdminSession;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <>
      <div className="admin-sidebar-brand">
        <Logo />
        <span>Admin workspace</span>
      </div>
      <nav className="admin-nav" aria-label="Admin navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={active ? "active" : ""}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {active && <motion.i layoutId="admin-nav-active" />}
            </Link>
          );
        })}
      </nav>
      <div className="admin-sidebar-footer">
        <a href="/" target="_blank" rel="noreferrer">
          <ExternalLink size={17} />
          View website
        </a>
        <button type="button" onClick={signOut} disabled={signingOut}>
          <LogOut size={17} />
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
        <div className="admin-profile">
          <span>{session.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{session.name}</strong>
            <small>{session.email}</small>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <ToastProvider>
      <div className="admin-app">
        <aside className="admin-sidebar">{sidebar}</aside>
        <header className="admin-mobile-header">
          <Logo compact />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin navigation"
          >
            <Menu size={21} />
          </button>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.button
                className="admin-mobile-backdrop"
                type="button"
                aria-label="Close admin navigation"
                onClick={() => setMobileOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.aside
                className="admin-mobile-drawer"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
              >
                <button
                  className="admin-drawer-close"
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close admin navigation"
                >
                  <X size={20} />
                </button>
                {sidebar}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="admin-main">
          <div className="admin-main-glow" />
          <div className="admin-content">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
