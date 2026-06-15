"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { StatsStrip } from "@/components/StatsStrip";
import type { ProjectRecord } from "@/types/content";

export function Projects({ projects }: { projects: ProjectRecord[] }) {
  return (
    <section id="work" className="section-shell">
      <div className="arc-background" />
      <div className="relative z-10">
        <SectionHeading
          eyebrow="Selected work"
          description="Recent partnerships where strategy, craft and technology moved together."
        >
          Projects that
          <br />
          make an <span>impact.</span>
        </SectionHeading>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <motion.article
              key={project._id}
              className="project-card group"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="relative aspect-[1.08] overflow-hidden bg-[#0a0811]">
                <Image
                  src={project.image}
                  alt={`${project.title} project preview`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover object-top transition duration-700 group-hover:scale-[1.045]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08070d]/65 to-transparent" />
              </div>
              <div className="flex items-start justify-between gap-5 p-6">
                <div>
                  <h3 className="font-[family-name:var(--font-manrope)] text-xl font-semibold">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/48">{project.category}</p>
                  <p className="project-summary">{project.shortDescription}</p>
                </div>
                <a
                  href={project.liveUrl || "#contact"}
                  target={project.liveUrl ? "_blank" : undefined}
                  rel={project.liveUrl ? "noreferrer" : undefined}
                  className="grid size-11 shrink-0 place-items-center rounded-xl border border-violet-400/20 bg-violet-500/8 text-violet-300 transition group-hover:border-violet-400/60 group-hover:bg-violet-500/15"
                  aria-label={`View ${project.title} project`}
                >
                  <ArrowUpRight size={21} />
                </a>
              </div>
            </motion.article>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="public-empty-state">
            New case studies are being prepared.
          </div>
        )}

        <div className="mt-8">
          <StatsStrip />
        </div>
      </div>
    </section>
  );
}
