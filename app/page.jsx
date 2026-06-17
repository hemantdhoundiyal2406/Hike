import { BookingSection } from "@/components/BookingSection";
import { Hero } from "@/components/Hero";
import { MobileNav } from "@/components/MobileNav";
import { Process } from "@/components/Process";
import { Projects } from "@/components/Projects";
import { Services } from "@/components/Services";
import { Sidebar } from "@/components/Sidebar";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { getPublicProjects, getPublicTestimonials } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function Home() {
    const [projects, testimonials] = await Promise.all([
        getPublicProjects(),
        getPublicTestimonials(),
    ]);
    return (<div className="site-layout">
      <Sidebar />
      <MobileNav />
      <div className="site-content">
        <main className="site-main">
          <Hero />
          <Services />
          <Projects projects={projects}/>
          <Process />
          <Testimonials testimonials={testimonials}/>
          <BookingSection />
        </main>
        <Footer />
      </div>
    </div>);
}
