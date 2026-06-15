import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminRequest } from "@/lib/admin-api";
import { connectToDatabase } from "@/lib/db";
import { testimonialSchema } from "@/lib/testimonial-schema";
import Testimonial from "@/models/Testimonial";

export async function GET(request: NextRequest) {
  const auth = requireAdminRequest(request);
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const testimonials = await Testimonial.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(testimonials)),
    });
  } catch (error) {
    return apiError(error, "Unable to load testimonials.");
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdminRequest(request);
  if (auth.response) return auth.response;

  try {
    const testimonial = testimonialSchema.parse(await request.json());
    await connectToDatabase();
    const created = await Testimonial.create(testimonial);
    return NextResponse.json(
      {
        success: true,
        message: "Testimonial created.",
        data: JSON.parse(JSON.stringify(created)),
      },
      { status: 201 }
    );
  } catch (error) {
    return apiError(error, "Unable to create testimonial.");
  }
}
