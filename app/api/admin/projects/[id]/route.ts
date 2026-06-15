import { NextRequest, NextResponse } from "next/server";
import {
  apiError,
  isValidDocumentId,
  requireAdminRequest,
} from "@/lib/admin-api";
import { connectToDatabase } from "@/lib/db";
import { projectSchema } from "@/lib/project-schema";
import { toSlug } from "@/lib/slug";
import Project from "@/models/Project";

type RouteContext = { params: Promise<{ id: string }> };

async function uniqueSlug(title: string, id: string) {
  const base = toSlug(title) || "project";
  const exists = await Project.exists({ slug: base, _id: { $ne: id } });
  return exists ? `${base}-${Date.now().toString(36)}` : base;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = requireAdminRequest(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    if (!isValidDocumentId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID." },
        { status: 400 }
      );
    }

    const project = projectSchema.parse(await request.json());
    await connectToDatabase();
    const updated = await Project.findByIdAndUpdate(
      id,
      { ...project, slug: await uniqueSlug(project.title, id) },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project updated.",
      data: JSON.parse(JSON.stringify(updated)),
    });
  } catch (error) {
    return apiError(error, "Unable to update project.");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = requireAdminRequest(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    if (!isValidDocumentId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Project deleted." });
  } catch (error) {
    return apiError(error, "Unable to delete project.");
  }
}
