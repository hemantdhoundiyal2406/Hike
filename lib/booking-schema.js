import { z } from "zod";
import { availableTimeSlots, getAllowedTimeSlots, isBookableDate, meetingTopics, } from "@/lib/booking-options";
export const websiteTypes = [
    "Business website",
    "E-commerce",
    "Landing page",
    "Portfolio",
    "Website redesign",
    "Other",
];
export { availableTimeSlots, meetingTopics };
export const bookingStatuses = [
    "pending",
    "confirmed",
    "rescheduled",
    "completed",
    "cancelled",
];
const bookingBaseFields = {
    name: z.string().trim().min(2, "Please enter your name.").max(80),
    email: z.string().trim().email("Please enter a valid email address."),
    phone: z
        .string()
        .trim()
        .min(7, "Please enter a valid phone number.")
        .max(30)
        .regex(/^[+\d][\d\s().-]+$/, "Please enter a valid phone number."),
    brandName: z
        .string()
        .trim()
        .min(2, "Please enter your brand name.")
        .max(100),
    meetingTopic: z.enum(meetingTopics, {
        message: "Please choose a meeting topic.",
    }),
    websiteType: z.enum(websiteTypes, {
        message: "Please choose a website type.",
    }),
    message: z
        .string()
        .trim()
        .min(10, "Tell us a little more about the project.")
        .max(2000),
    date: z.iso.date("Please select a valid date."),
};
export const bookingSchema = z
    .object({
    ...bookingBaseFields,
    time: z.enum(availableTimeSlots, {
        message: "Please select an available time.",
    }),
})
    .superRefine((booking, context) => {
    const [year, month, day] = booking.date.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!isBookableDate(selectedDate, today)) {
        context.addIssue({
            code: "custom",
            path: ["date"],
            message: "Please choose an available weekday within the booking window.",
        });
    }
    const allowedSlots = getAllowedTimeSlots(selectedDate);
    if (!allowedSlots.includes(booking.time)) {
        context.addIssue({
            code: "custom",
            path: ["time"],
            message: "Please choose one of the available meeting times.",
        });
    }
});
export const adminBookingSchema = z.object({
    ...bookingBaseFields,
    meetingTopic: z.enum(meetingTopics),
    time: z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Please select a valid meeting time."),
    status: z.enum(bookingStatuses),
    durationMinutes: z.coerce.number().int().min(15).max(240),
    timezone: z.string().trim().min(2).max(100),
    meetingLink: z
        .string()
        .trim()
        .max(1000)
        .refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), "Please enter a valid meeting URL."),
    internalNotes: z.string().trim().max(2000),
    source: z.enum(["website", "admin"]),
});
