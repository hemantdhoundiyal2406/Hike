import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getRequestSession } from "@/lib/auth";

export function requireAdminRequest(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, message: "Your admin session has expired." },
        { status: 401 }
      ),
    };
  }
  return { session, response: null };
}

export function isValidDocumentId(id: string) {
  return mongoose.isValidObjectId(id);
}

export function apiError(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: error.issues[0]?.message ?? "Please check the form fields.",
      },
      { status: 400 }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  console.error(fallback, error);
  return NextResponse.json(
    { success: false, message: fallback },
    { status: 500 }
  );
}
