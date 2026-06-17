"use client";
import { ArrowRight, Code2, MessagesSquare, PenTool, Rocket, Route, } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
const steps = [
    {
        title: "Discover",
        text: "We learn the business, audience, ambitions and constraints.",
        icon: MessagesSquare,
    },
    {
        title: "Plan",
        text: "We turn insight into a focused roadmap and clear priorities.",
        icon: Route,
    },
    {
        title: "Design",
        text: "We shape a distinctive system with purpose in every detail.",
        icon: PenTool,
    },
    {
        title: "Develop",
        text: "We build fast, accessible experiences with clean code.",
        icon: Code2,
    },
    {
        title: "Launch & Support",
        text: "We release, measure, refine and keep your platform moving.",
        icon: Rocket,
    },
];
export function Process() {
    return (<section id="process" className="section-shell">
      <div className="section-glow section-glow-left"/>
      <div className="relative z-10">
        <SectionHeading eyebrow="Our process" description="A practical five-step rhythm that keeps the work focused and the partnership clear.">
          Our process.
          <br />
          Your <span>success.</span>
        </SectionHeading>

        <div className="process-grid mt-8">
          {steps.map(({ title, text, icon: Icon }, index) => (<motion.article key={title} className="process-card" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.55, delay: index * 0.08 }}>
              <span className="process-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="process-icon">
                <Icon size={29} strokeWidth={1.6}/>
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
              {index < steps.length - 1 && (<span className="process-connector" aria-hidden>
                  <ArrowRight size={17}/>
                </span>)}
            </motion.article>))}
        </div>
      </div>
    </section>);
}
