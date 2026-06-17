import { connectToDatabase } from "@/lib/db";
import { defaultProjects, defaultTestimonials } from "@/lib/default-content";
import { toSlug } from "@/lib/slug";
import Project from "@/models/Project";
import Testimonial from "@/models/Testimonial";
function fallbackProjects() {
    return defaultProjects.map((project, index) => ({
        _id: `fallback-project-${index}`,
        slug: toSlug(project.title),
        ...project,
        createdAt: "",
        updatedAt: "",
    }));
}
function fallbackTestimonials() {
    return defaultTestimonials.map((testimonial, index) => ({
        _id: `fallback-testimonial-${index}`,
        ...testimonial,
        createdAt: "",
        updatedAt: "",
    }));
}
export async function getPublicProjects() {
    if (!process.env.MONGODB_URI)
        return fallbackProjects();
    try {
        await connectToDatabase();
        const projects = await Project.find().sort({ featured: -1, createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(projects));
    }
    catch (error) {
        console.error("Project content error:", error);
        return fallbackProjects();
    }
}
export async function getPublicTestimonials() {
    if (!process.env.MONGODB_URI)
        return fallbackTestimonials();
    try {
        await connectToDatabase();
        const testimonials = await Testimonial.find().sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(testimonials));
    }
    catch (error) {
        console.error("Testimonial content error:", error);
        return fallbackTestimonials();
    }
}
export async function seedDefaultContent() {
    const [projectCount, testimonialCount] = await Promise.all([
        Project.countDocuments(),
        Testimonial.countDocuments(),
    ]);
    if (projectCount === 0) {
        await Project.insertMany(defaultProjects.map((project) => ({
            ...project,
            slug: toSlug(project.title),
        })));
    }
    if (testimonialCount === 0) {
        await Testimonial.insertMany(defaultTestimonials);
    }
}
