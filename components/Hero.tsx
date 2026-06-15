"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowUpRight, Mouse } from "lucide-react";
import { CubeScene } from "@/components/CubeScene";
import { StatsStrip } from "@/components/StatsStrip";

const reveal: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function Hero() {
  return (
    <section id="home" className="section-shell hero-grid overflow-hidden">
      <div className="section-glow section-glow-right" />
      <div className="contour-lines" />

      <div className="relative z-10 flex flex-col justify-center pb-4 pt-8 lg:pb-0 lg:pt-0">
        <motion.p
          className="eyebrow justify-start"
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={0.05}
        >
          <span />
          Independent digital studio
        </motion.p>

        <motion.h1
          className="hero-title"
          aria-label="We build digital experiences that move brands."
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={0.12}
        >
          <span>We build digital </span>
          <strong>experiences </strong>
          <span>that move brands.</span>
        </motion.h1>

        <motion.p
          className="mt-3 max-w-xl text-sm leading-6 text-white/58 sm:text-base"
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={0.2}
        >
          Strategy, design and technology for ambitious teams ready to turn
          attention into meaningful growth.
        </motion.p>

        <motion.div
          className="mt-5 flex flex-wrap gap-2"
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={0.28}
        >
          <a href="#work" className="primary-button">
            Explore our work
            <ArrowUpRight size={18} />
          </a>
          <a href="#contact" className="outline-button">
            Start a project
          </a>
        </motion.div>

        <motion.div
          className="mt-12 hidden items-center gap-4 text-[10px] uppercase tracking-[0.36em] text-white/42 md:flex"
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={0.38}
        >
          <span className="h-px w-10 bg-violet-500" />
          <Mouse size={21} strokeWidth={1.4} />
          Scroll to explore
        </motion.div>
      </div>

      <motion.div
        className="relative z-10 min-h-[390px] lg:min-h-[620px]"
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <CubeScene />
      </motion.div>

      <motion.div
        className="relative z-10 col-span-full mt-1 lg:mt-[-78px]"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.58 }}
      >
        <StatsStrip />
      </motion.div>
    </section>
  );
}
