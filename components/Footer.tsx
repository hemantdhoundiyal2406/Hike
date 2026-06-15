"use client";

import { Mail, MapPin, Phone, ExternalLink } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/8 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4 lg:gap-16">
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Logo compact={false} />
            <p className="max-w-xs text-sm leading-6 text-white/56">
              Creating digital experiences that move businesses forward with strategy, design, and technology.
            </p>
            <div className="flex gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-lg border border-white/10 text-white/60 transition hover:border-violet-400/60 hover:text-violet-400"
                aria-label="LinkedIn"
              >
                <ExternalLink size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-lg border border-white/10 text-white/60 transition hover:border-violet-400/60 hover:text-violet-400"
                aria-label="Facebook"
              >
                <ExternalLink size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-lg border border-white/10 text-white/60 transition hover:border-violet-400/60 hover:text-violet-400"
                aria-label="Social"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="mb-5 font-semibold text-white">Services</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#work"
                  className="text-white/60 transition hover:text-white hover:text-violet-400"
                >
                  Web Design
                </a>
              </li>
              <li>
                <a
                  href="#work"
                  className="text-white/60 transition hover:text-white hover:text-violet-400"
                >
                  Development
                </a>
              </li>
              <li>
                <a
                  href="#work"
                  className="text-white/60 transition hover:text-white hover:text-violet-400"
                >
                  E-Commerce
                </a>
              </li>
              <li>
                <a
                  href="#work"
                  className="text-white/60 transition hover:text-white hover:text-violet-400"
                >
                  Branding
                </a>
              </li>
              <li>
                <a
                  href="#work"
                  className="text-white/60 transition hover:text-white hover:text-violet-400"
                >
                  Digital Marketing
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="mb-5 font-semibold text-white">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#home"
                  className="text-white/60 transition hover:text-white hover:text-violet-400"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#work"
                  className="text-white/60 transition hover:text-white hover:text-violet-400"
                >
                  Work
                </a>
              </li>
              <li>
                <a
                  href="#process"
                  className="text-white/60 transition hover:text-white hover:text-violet-400"
                >
                  Process
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-white/60 transition hover:text-white hover:text-violet-400"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="mb-5 font-semibold text-white">Get In Touch</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-1 flex-shrink-0 text-violet-400" />
                <a
                  href="mailto:hello@hikeagency.com"
                  className="text-white/60 transition hover:text-white hover:text-violet-400"
                >
                  hello@hikeagency.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-1 flex-shrink-0 text-violet-400" />
                <a
                  href="tel:+1234567890"
                  className="text-white/60 transition hover:text-white hover:text-violet-400"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-violet-400" />
                <span className="text-white/60">
                  New Delhi, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-white/8" />

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-6 text-sm text-white/50 md:flex-row">
          <p>© {currentYear} hike agency. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="transition hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="transition hover:text-white">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
