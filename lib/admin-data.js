import { connectToDatabase } from "@/lib/db";
import { defaultProjects, defaultTestimonials } from "@/lib/default-content";
import { listLocalBookings } from "@/lib/local-booking-store";
import Booking from "@/models/Booking";
import Project from "@/models/Project";
import Testimonial from "@/models/Testimonial";
export async function getDashboardData() {
    try {
        await connectToDatabase();
        const [totalBookings, totalProjects, totalTestimonials, recentBookings] = await Promise.all([
            Booking.countDocuments(),
            Project.countDocuments(),
            Testimonial.countDocuments(),
            Booking.find().sort({ createdAt: -1 }).limit(6).lean(),
        ]);
        return {
            totalBookings,
            totalProjects,
            totalTestimonials,
            recentBookings: JSON.parse(JSON.stringify(recentBookings)),
        };
    }
    catch (error) {
        console.error("Dashboard data fallback:", error);
        const localBookings = listLocalBookings();
        return {
            totalBookings: localBookings.length,
            totalProjects: defaultProjects.length,
            totalTestimonials: defaultTestimonials.length,
            recentBookings: localBookings.slice(0, 6),
        };
    }
}
