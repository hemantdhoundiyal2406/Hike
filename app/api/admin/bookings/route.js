import { NextResponse } from "next/server";
import { apiError, requireAdminRequest } from "@/lib/admin-api";
import { adminBookingSchema } from "@/lib/booking-schema";
import { connectToDatabase } from "@/lib/db";
import { getEmailErrorMessage, sendMeetingScheduledEmails } from "@/lib/email";
import { createLocalBooking, hasLocalBookingConflict, listLocalBookings, } from "@/lib/local-booking-store";
import Booking from "@/models/Booking";
export const runtime = "nodejs";
export async function GET(request) {
    const auth = requireAdminRequest(request);
    if (auth.response)
        return auth.response;
    try {
        await connectToDatabase();
        const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(bookings)),
        });
    }
    catch (error) {
        console.error("Admin bookings fallback:", error);
        return NextResponse.json({
            success: true,
            data: listLocalBookings(),
        });
    }
}
export async function POST(request) {
    const auth = requireAdminRequest(request);
    if (auth.response)
        return auth.response;
    try {
        const meeting = adminBookingSchema.parse(await request.json());
        try {
            await connectToDatabase();
            if (["pending", "confirmed", "rescheduled"].includes(meeting.status)) {
                const conflict = await Booking.exists({
                    date: meeting.date,
                    time: meeting.time,
                    status: { $in: ["pending", "confirmed", "rescheduled"] },
                });
                if (conflict) {
                    return NextResponse.json({ success: false, message: "That date and time is already booked." }, { status: 409 });
                }
            }
            const created = await Booking.create({ ...meeting, source: "admin" });
            let emailSent = true;
            let emailError = "";
            try {
                await sendMeetingScheduledEmails({ ...meeting, source: "admin" });
            }
            catch (error) {
                emailSent = false;
                emailError = getEmailErrorMessage(error);
                console.error("Meeting schedule email error:", error);
            }
            return NextResponse.json({
                success: true,
                emailSent,
                message: emailSent
                    ? "Meeting scheduled and both emails were sent."
                    : `Meeting scheduled, but email delivery failed. ${emailError}`,
                data: JSON.parse(JSON.stringify(created)),
            }, { status: 201 });
        }
        catch {
            if (["pending", "confirmed", "rescheduled"].includes(meeting.status)) {
                const conflict = hasLocalBookingConflict({
                    date: meeting.date,
                    time: meeting.time,
                    statuses: ["pending", "confirmed", "rescheduled"],
                });
                if (conflict) {
                    return NextResponse.json({ success: false, message: "That date and time is already booked." }, { status: 409 });
                }
            }
            const created = createLocalBooking({ ...meeting, source: "admin" });
            let emailSent = true;
            let emailError = "";
            try {
                await sendMeetingScheduledEmails({ ...meeting, source: "admin" });
            }
            catch (error) {
                emailSent = false;
                emailError = getEmailErrorMessage(error);
                console.error("Meeting schedule email error:", error);
            }
            return NextResponse.json({
                success: true,
                emailSent,
                message: emailSent
                    ? "Meeting scheduled and both emails were sent."
                    : `Meeting scheduled, but email delivery failed. ${emailError}`,
                data: created,
            }, { status: 201 });
        }
    }
    catch (error) {
        return apiError(error, "Unable to schedule meeting.");
    }
}
