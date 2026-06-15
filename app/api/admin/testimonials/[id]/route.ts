import { NextRequest, NextResponse } from "next/server";
import {
  apiError,
  isValidDocumentId,
  requireAdminRequest,
} from "@/lib/admin-api";
import { connectToDatabase } from "@/lib/db";
import { testimonialSchema } from "@/lib/testimonial-schema";
import Testimonial from "@/models/Testimonial";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = requireAdminRequest(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    if (!isValidDocumentId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid testimonial ID." },
        { status: 400 }
      );
    }

    const testimonial = testimonialSchema.parse(await request.json());
    await connectToDatabase();
    const updated = await Testimonial.findByIdAndUpdate(id, testimonial, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Testimonial not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Testimonial updated.",
      data: JSON.parse(JSON.stringify(updated)),
    });
  } catch (error) {
    return apiError(error, "Unable to update testimonial.");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = requireAdminRequest(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    if (!isValidDocumentId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid testimonial ID." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const deleted = await Testimonial.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Testimonial not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted.",
    });
  } catch (error) {
    return apiError(error, "Unable to delete testimonial.");
  }
}
