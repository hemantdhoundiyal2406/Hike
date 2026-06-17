import { NextResponse } from "next/server";
import { getWebsiteSettings } from "@/lib/theme-settings";
export async function GET() {
    const settings = await getWebsiteSettings();
    return NextResponse.json({ success: true, data: settings });
}
