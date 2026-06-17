"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
export function Testimonials({ testimonials, }) {
    const [active, setActive] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(3);
    useEffect(() => {
        const update = () => {
            setItemsPerView(window.innerWidth < 768 ? 1 : window.innerWidth < 1200 ? 2 : 3);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);
    const visibleCount = Math.min(itemsPerView, Math.max(testimonials.length, 1));
    const pageCount = Math.max(1, testimonials.length - visibleCount + 1);
    const normalizedActive = active % pageCount;
    useEffect(() => {
        if (testimonials.length <= visibleCount)
            return;
        const timer = window.setInterval(() => {
            setActive((value) => (value + 1) % pageCount);
        }, 5200);
        return () => window.clearInterval(timer);
    }, [pageCount, testimonials.length, visibleCount]);
    const visible = useMemo(() => testimonials.slice(normalizedActive, normalizedActive + visibleCount), [normalizedActive, testimonials, visibleCount]);
    return (<section id="testimonials" className="section-shell overflow-hidden">
      <div className="quote-background" aria-hidden>
        &ldquo;
      </div>
      <div className="wave-lines"/>

      <div className="relative z-10">
        <SectionHeading eyebrow="Client stories" description="Long-term partnerships, honest collaboration and outcomes that stand up after launch.">
          Trusted by clients.
          <br />
          Driven by <span>results.</span>
        </SectionHeading>

        <div className="mt-8 min-h-[280px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={`${normalizedActive}-${visibleCount}`} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" initial={{ opacity: 0, x: 35 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -35 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              {visible.map((testimonial) => (<article className="testimonial-card" key={testimonial._id}>
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex gap-1 text-violet-400">
                      {Array.from({ length: testimonial.rating }).map((_, index) => (<Star key={index} size={17} fill="currentColor"/>))}
                    </div>
                    <Quote size={37} fill="currentColor" className="text-violet-600"/>
                  </div>
                  <blockquote>{testimonial.review}</blockquote>
                  <footer>
                    <span className="avatar">
                      {testimonial.image ? (<Image src={testimonial.image} alt={testimonial.clientName} fill sizes="50px" className="object-cover"/>) : (testimonial.clientName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase())}
                    </span>
                    <span>
                      <strong>{testimonial.clientName}</strong>
                      <small>{testimonial.designation}</small>
                    </span>
                  </footer>
                </article>))}
            </motion.div>
          </AnimatePresence>
          {testimonials.length === 0 && (<div className="public-empty-state">
              Client stories will appear here soon.
            </div>)}
        </div>

        {pageCount > 1 && (<div className="mt-7 flex justify-center gap-2.5">
            {Array.from({ length: pageCount }).map((_, index) => (<button key={index} type="button" onClick={() => setActive(index)} className={`h-2 rounded-full transition-all ${normalizedActive === index
                    ? "w-7 bg-violet-500"
                    : "w-2 bg-white/15 hover:bg-white/30"}`} aria-label={`Show testimonial group ${index + 1}`}/>))}
          </div>)}
      </div>
    </section>);
}
