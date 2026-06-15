import type { ProjectInput } from "@/lib/project-schema";
import type { TestimonialInput } from "@/lib/testimonial-schema";

export const defaultProjects: ProjectInput[] = [
  {
    title: "Nexora",
    category: "Digital brand platform",
    shortDescription:
      "A sharper digital identity and conversion-focused platform for an ambitious technology brand.",
    fullDescription:
      "hike agency created a complete digital brand platform for Nexora, aligning product storytelling, visual identity and a responsive marketing experience.",
    image: "/images/project-nexora.png",
    liveUrl: "",
    techStack: ["Next.js", "TypeScript", "Framer Motion"],
    featured: true,
  },
  {
    title: "Luxora",
    category: "E-commerce experience",
    shortDescription:
      "A premium storefront designed to make product discovery effortless and memorable.",
    fullDescription:
      "Luxora received a refined commerce experience with stronger merchandising, clearer product stories and a frictionless responsive purchase journey.",
    image: "/images/project-luxora.png",
    liveUrl: "",
    techStack: ["Shopify", "Liquid", "JavaScript"],
    featured: true,
  },
  {
    title: "Tracko",
    category: "Product dashboard",
    shortDescription:
      "A complex analytics workflow transformed into a calm, intuitive product dashboard.",
    fullDescription:
      "We redesigned Tracko around fast decision-making, reusable data visualization patterns and a scalable dashboard system for growing teams.",
    image: "/images/project-tracko.png",
    liveUrl: "",
    techStack: ["React", "Node.js", "MongoDB"],
    featured: true,
  },
];

export const defaultTestimonials: TestimonialInput[] = [
  {
    clientName: "Maya Bennett",
    designation: "Founder, Luma House",
    review:
      "hike agency brought rare clarity to the project. The new site feels unmistakably ours and finally performs like a serious growth channel.",
    rating: 5,
    image: "",
  },
  {
    clientName: "Daniel Carter",
    designation: "Marketing Director, Nativ",
    review:
      "The team balanced strategic thinking with exceptional craft. Every decision was explained, considered and delivered beautifully.",
    rating: 5,
    image: "",
  },
  {
    clientName: "Arjun Mehta",
    designation: "Co-founder, Altitude",
    review:
      "We launched on time, improved our conversion rate, and gave our sales team a platform they are genuinely proud to share.",
    rating: 5,
    image: "",
  },
  {
    clientName: "Sofia Chen",
    designation: "VP Brand, Onda",
    review:
      "A small senior team that moves quickly without losing the details. It felt collaborative from the first workshop to launch.",
    rating: 5,
    image: "",
  },
  {
    clientName: "Noah Williams",
    designation: "CEO, Fieldnote",
    review:
      "They understood the commercial challenge immediately and turned it into an experience that is simple, elegant and effective.",
    rating: 5,
    image: "",
  },
];
