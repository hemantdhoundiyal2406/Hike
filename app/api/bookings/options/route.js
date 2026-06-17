import { NextResponse } from "next/server";
import { availableTimeSlots, bookingWindow, meetingTopics, weekdayAvailability, } from "@/lib/booking-options";
export async function GET() {
    return NextResponse.json({
        success: true,
        data: {
            meetingTopics,
            availableTimeSlots,
            weekdayAvailability,
            bookingWindow,
        },
    });
}
