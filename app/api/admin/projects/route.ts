import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminRequest } from "@/lib/admin-api";
import { connectToDatabase } from "@/lib/db";
import { projectSchema } from "@/lib/project-schema";
import { toSlug } from "@/lib/slug";
import Project from "@/models/Project";

async function uniqueSlug(title: string) {
  const base = toSlug(title) || "project";
  const exists = await Project.exists({ slug: base });
  return exists ? `${base}-${Date.now().toString(36)}` : base;
}

export async function GET(request: NextRequest) {
  const auth = requireAdminRequest(request);
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const projects = await Project.find().sort({ featured: -1, createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(projects)),
    });
  } catch (error) {
    return apiError(error, "Unable to load projects.");
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdminRequest(request);
  if (auth.response) return auth.response;

  try {
    const project = projectSchema.parse(await request.json());
    await connectToDatabase();
    const created = await Project.create({
      ...project,
      slug: await uniqueSlug(project.title),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project created.",
        data: JSON.parse(JSON.stringify(created)),
      },
      { status: 201 }
    );
  } catch (error) {
    return apiError(error, "Unable to create project.");
  }
}
