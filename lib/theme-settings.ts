import type { CSSProperties } from "react";
import { connectToDatabase } from "@/lib/db";
import {
  mergeThemeSettings,
  websiteSettingsSchema,
  type WebsiteSettings,
} from "@/lib/theme-schema";
import WebsiteSettingsModel from "@/models/WebsiteSettings";

export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  if (!process.env.MONGODB_URI) return mergeThemeSettings();

  try {
    await connectToDatabase();
    const settings = await WebsiteSettingsModel.findOne({ key: "global" }).lean();
    return mergeThemeSettings(settings as Partial<WebsiteSettings> | null);
  } catch (error) {
    console.error("Website settings error:", error);
    return mergeThemeSettings();
  }
}

export async function saveWebsiteSettings(
  value: WebsiteSettings
): Promise<WebsiteSettings> {
  const settings = websiteSettingsSchema.parse(value);
  await connectToDatabase();

  const updated = await WebsiteSettingsModel.findOneAndUpdate(
    { key: "global" },
    {
      $set: {
        key: "global",
        defaultMode: settings.defaultMode,
        logoUrl: settings.logoUrl,
        colors: settings.colors,
        typography: settings.typography,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return mergeThemeSettings(updated as Partial<WebsiteSettings>);
}

export function buildThemeCssVariables(settings: WebsiteSettings) {
  return {
    "--primary-color": settings.colors.primary,
    "--secondary-color": settings.colors.secondary,
    "--bg-color": settings.colors.background,
    "--text-color": settings.colors.text,
    "--button-color": settings.colors.button,
    "--card-color": settings.colors.card,
    "--border-color": settings.colors.border,
    "--footer-color": settings.colors.footer,
    "--sidebar-color": settings.colors.sidebar,
    "--h1-size": settings.typography.h1Size,
    "--h2-size": settings.typography.h2Size,
    "--h3-size": settings.typography.h3Size,
    "--h4-size": settings.typography.h4Size,
    "--p-size": settings.typography.paragraphSize,
    "--menu-size": settings.typography.menuSize,
    "--button-text-size": settings.typography.buttonSize,
    "--footer-text-size": settings.typography.footerSize,
    "--theme-line-height": settings.typography.lineHeight,
  } as CSSProperties;
}
