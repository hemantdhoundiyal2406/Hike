"use client";

import {
  ArrowUpRight,
  Badge,
  Code2,
  Megaphone,
  MonitorSmartphone,
  ShoppingBag,
} from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";

const services = [
  {
    title: "Web Design",
    description:
      "Distinctive, conversion-aware interfaces built around your story.",
    icon: MonitorSmartphone,
    number: "01",
  },
  {
    title: "E-Commerce",
    description:
      "Frictionless shopping experiences designed to increase confidence.",
    icon: ShoppingBag,
    number: "02",
  },
  {
    title: "Web Development",
    description:
      "Fast, accessible and scalable builds with clean production code.",
    icon: Code2,
    number: "03",
  },
  {
    title: "Digital Marketing",
    description:
      "Focused campaigns that connect creative thinking with real growth.",
    icon: Megaphone,
    number: "04",
  },
  {
    title: "Branding",
    description:
      "Identity systems that make the right impression and stay memorable.",
    icon: Badge,
    number: "05",
  },
];

export function Services() {
  return (
    <section id="services" className="section-shell">
      <div className="section-glow section-glow-right" />
      <div className="relative z-10">
        <SectionHeading
          eyebrow="What we do"
          description="A senior, focused team from first thought to final release."
        >
          Powerful services.
          <br />
          <span>Meaningful results.</span>
        </SectionHeading>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {services.map(({ title, description, icon: Icon, number }, index) => (
            <motion.article
              key={title}
              className="service-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.07 }}
            >
              <span className="absolute right-5 top-5 text-xs text-white/20">
                {number}
              </span>
              <span className="icon-orb">
                <Icon size={27} strokeWidth={1.65} />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="mt-auto pt-8 text-violet-400">
                <ArrowUpRight size={20} />
              </span>
            </motion.article>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
          <p className="max-w-xl text-sm leading-7 text-white/45">
            No inflated teams. No hand-offs. You work directly with the people
            shaping the strategy and making the work.
          </p>
          <a href="#contact" className="text-link">
            Discuss your project <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
