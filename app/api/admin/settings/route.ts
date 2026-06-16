import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminRequest } from "@/lib/admin-api";
import { getWebsiteSettings, saveWebsiteSettings } from "@/lib/theme-settings";
import { mergeThemeSettings, type WebsiteSettings } from "@/lib/theme-schema";

const MAX_LOGO_SIZE = 1_500_000;

async function parseSettingsRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const current = await getWebsiteSettings();
  let next: Partial<WebsiteSettings> = {};

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const rawSettings = formData.get("settings");

    if (typeof rawSettings !== "string") {
      return {
        response: NextResponse.json(
          { success: false, message: "Settings payload is required." },
          { status: 400 }
        ),
        settings: null,
      };
    }

    next = JSON.parse(rawSettings) as Partial<WebsiteSettings>;

    const removeLogo = formData.get("removeLogo") === "true";
    const logo = formData.get("logo");

    if (removeLogo) {
      next.logoUrl = "";
    } else if (logo instanceof File && logo.size > 0) {
      if (!logo.type.startsWith("image/")) {
        return {
          response: NextResponse.json(
            { success: false, message: "Logo must be an image file." },
            { status: 400 }
          ),
          settings: null,
        };
      }

      if (logo.size > MAX_LOGO_SIZE) {
        return {
          response: NextResponse.json(
            {
              success: false,
              message: "Logo file must be smaller than 1.5 MB.",
            },
            { status: 400 }
          ),
          settings: null,
        };
      }

      const buffer = Buffer.from(await logo.arrayBuffer());
      next.logoUrl = `data:${logo.type};base64,${buffer.toString("base64")}`;
    }
  } else {
    next = (await request.json()) as Partial<WebsiteSettings>;
  }

  return {
    response: null,
    settings: mergeThemeSettings({
      ...current,
      ...next,
      colors: { ...current.colors, ...(next.colors ?? {}) },
      typography: { ...current.typography, ...(next.typography ?? {}) },
    }),
  };
}

export async function GET(request: NextRequest) {
  const auth = requireAdminRequest(request);
  if (auth.response) return auth.response;

  try {
    const settings = await getWebsiteSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return apiError(error, "Unable to load website settings.");
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireAdminRequest(request);
  if (auth.response) return auth.response;

  try {
    const parsed = await parseSettingsRequest(request);
    if (parsed.response) return parsed.response;

    const settings = await saveWebsiteSettings(parsed.settings);
    return NextResponse.json({
      success: true,
      message: "Website settings saved.",
      data: settings,
    });
  } catch (error) {
    return apiError(error, "Unable to save website settings.");
  }
}
