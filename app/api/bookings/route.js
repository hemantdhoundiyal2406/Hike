import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { bookingSchema } from "@/lib/booking-schema";
import { connectToDatabase } from "@/lib/db";
import { sendBookingCreatedEmails } from "@/lib/email";
import { createLocalBooking, hasLocalBookingConflict, } from "@/lib/local-booking-store";
import Booking from "@/models/Booking";
export async function POST(request) {
    try {
        const body = await request.json();
        const booking = bookingSchema.parse(body);
        try {
            await connectToDatabase();
            const existingBooking = await Booking.exists({
                date: booking.date,
                time: booking.time,
                status: { $in: ["pending", "confirmed", "rescheduled"] },
            });
            if (existingBooking) {
                return NextResponse.json({
                    success: false,
                    message: "That time was just booked. Please choose another slot.",
                }, { status: 409 });
            }
            await Booking.create({
                ...booking,
                durationMinutes: 30,
                timezone: "Asia/Kolkata",
                meetingLink: "",
                internalNotes: "",
                source: "website",
                status: "pending",
            });
        }
        catch {
            if (hasLocalBookingConflict({
                date: booking.date,
                time: booking.time,
                statuses: ["pending", "confirmed", "rescheduled"],
            })) {
                return NextResponse.json({
                    success: false,
                    message: "That time was just booked. Please choose another slot.",
                }, { status: 409 });
            }
            createLocalBooking({
                ...booking,
                status: "pending",
                durationMinutes: 30,
                timezone: "Asia/Kolkata",
                meetingLink: "",
                internalNotes: "",
                source: "website",
            });
        }
        let emailSent = true;
        try {
            await sendBookingCreatedEmails(booking);
        }
        catch (error) {
            emailSent = false;
            console.error("Booking email error:", error);
        }
        return NextResponse.json({
            success: true,
            emailSent,
            message: emailSent
                ? "Your discovery call request has been sent."
                : "Your booking is saved. Our email confirmation may be delayed.",
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const firstIssue = error.issues[0];
            const validationMessage = firstIssue?.code === "invalid_type"
                ? "Please complete all required fields."
                : firstIssue?.message ?? "Please check your details.";
            return NextResponse.json({
                success: false,
                message: validationMessage,
            }, { status: 400 });
        }
        if (error instanceof SyntaxError) {
            return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
        }
        console.error("Booking API error:", error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong. Please try again shortly.",
        }, { status: 500 });
    }
}
