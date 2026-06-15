import { NextRequest, NextResponse } from "next/server";
import {
  apiError,
  isValidDocumentId,
  requireAdminRequest,
} from "@/lib/admin-api";
import { adminBookingSchema } from "@/lib/booking-schema";
import { connectToDatabase } from "@/lib/db";
import { sendBookingUpdatedEmails } from "@/lib/email";
import {
  deleteLocalBooking,
  hasLocalBookingConflict,
  updateLocalBooking,
} from "@/lib/local-booking-store";
import Booking from "@/models/Booking";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = requireAdminRequest(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    if (!isValidDocumentId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID." },
        { status: 400 }
      );
    }

    const booking = adminBookingSchema.parse(await request.json());

    try {
      await connectToDatabase();

      if (["pending", "confirmed", "rescheduled"].includes(booking.status)) {
        const conflict = await Booking.exists({
          _id: { $ne: id },
          date: booking.date,
          time: booking.time,
          status: { $in: ["pending", "confirmed", "rescheduled"] },
        });
        if (conflict) {
          return NextResponse.json(
            { success: false, message: "That date and time is already booked." },
            { status: 409 }
          );
        }
      }

      const updated = await Booking.findByIdAndUpdate(id, booking, {
        new: true,
        runValidators: true,
      }).lean();

      if (!updated) {
        return NextResponse.json(
          { success: false, message: "Booking not found." },
          { status: 404 }
        );
      }

      let emailSent = true;
      try {
        await sendBookingUpdatedEmails(booking);
      } catch (error) {
        emailSent = false;
        console.error("Booking update email error:", error);
      }

      return NextResponse.json({
        success: true,
        emailSent,
        message: emailSent
          ? "Booking updated and both emails were sent."
          : "Booking updated, but email delivery failed.",
        data: JSON.parse(JSON.stringify(updated)),
      });
    } catch {
      if (["pending", "confirmed", "rescheduled"].includes(booking.status)) {
        const conflict = hasLocalBookingConflict({
          excludeId: id,
          date: booking.date,
          time: booking.time,
          statuses: ["pending", "confirmed", "rescheduled"],
        });
        if (conflict) {
          return NextResponse.json(
            { success: false, message: "That date and time is already booked." },
            { status: 409 }
          );
        }
      }

      const updated = updateLocalBooking(id, {
        ...booking,
        source: booking.source,
      });

      if (!updated) {
        return NextResponse.json(
          { success: false, message: "Booking not found." },
          { status: 404 }
        );
      }

      let emailSent = true;
      try {
        await sendBookingUpdatedEmails(booking);
      } catch (error) {
        emailSent = false;
        console.error("Booking update email error:", error);
      }

      return NextResponse.json({
        success: true,
        emailSent,
        message: emailSent
          ? "Booking updated and both emails were sent."
          : "Booking updated, but email delivery failed.",
        data: updated,
      });
    }
  } catch (error) {
    return apiError(error, "Unable to update booking.");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = requireAdminRequest(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    if (!isValidDocumentId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID." },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
      const deleted = await Booking.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json(
          { success: false, message: "Booking not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Booking deleted.",
      });
    } catch {
      const deleted = deleteLocalBooking(id);
      if (!deleted) {
        return NextResponse.json(
          { success: false, message: "Booking not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Booking deleted.",
      });
    }
  } catch (error) {
    return apiError(error, "Unable to delete booking.");
  }
}
