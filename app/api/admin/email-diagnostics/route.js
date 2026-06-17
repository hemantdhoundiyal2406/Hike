import { NextResponse } from "next/server";
import { apiError, requireAdminRequest } from "@/lib/admin-api";
import { getEmailDiagnostics } from "@/lib/email";
export const runtime = "nodejs";
export async function GET(request) {
    const auth = requireAdminRequest(request);
    if (auth.response)
        return auth.response;
    try {
        const diagnostics = await getEmailDiagnostics();
        return NextResponse.json({ success: true, data: diagnostics });
    }
    catch (error) {
        return apiError(error, "Unable to run email diagnostics.");
    }
}
