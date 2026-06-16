import { z } from "zod";

const hexColor = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Use a valid hex color.");

const cssLength = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d+)?(?:px|rem|em)$/, "Use px, rem or em.");

const lineHeight = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d+)?$/, "Use a numeric line height.");

export const DEFAULT_THEME_SETTINGS = {
  defaultMode: "dark",
  logoUrl: "",
  colors: {
    primary: "#8b5cf6",
    secondary: "#a855f7",
    background: "#05050a",
    text: "#f7f5fb",
    button: "#8b5cf6",
    card: "#090811",
    border: "#3b3154",
    footer: "#08070d",
    sidebar: "#05050a",
  },
  typography: {
    h1Size: "51px",
    h2Size: "45px",
    h3Size: "18px",
    h4Size: "16px",
    paragraphSize: "15px",
    menuSize: "14px",
    buttonSize: "14px",
    footerSize: "14px",
    lineHeight: "1.6",
  },
} as const;

export const themeColorsSchema = z.object({
  primary: hexColor,
  secondary: hexColor,
  background: hexColor,
  text: hexColor,
  button: hexColor,
  card: hexColor,
  border: hexColor,
  footer: hexColor,
  sidebar: hexColor,
});

export const themeTypographySchema = z.object({
  h1Size: cssLength,
  h2Size: cssLength,
  h3Size: cssLength,
  h4Size: cssLength,
  paragraphSize: cssLength,
  menuSize: cssLength,
  buttonSize: cssLength,
  footerSize: cssLength,
  lineHeight,
});

export const websiteSettingsSchema = z.object({
  defaultMode: z.enum(["dark", "light"]),
  logoUrl: z.string().trim().max(2_500_000).default(""),
  colors: themeColorsSchema,
  typography: themeTypographySchema,
});

export type WebsiteSettings = z.infer<typeof websiteSettingsSchema>;

export function mergeThemeSettings(
  value?: Partial<WebsiteSettings> | null
): WebsiteSettings {
  return websiteSettingsSchema.parse({
    defaultMode: value?.defaultMode ?? DEFAULT_THEME_SETTINGS.defaultMode,
    logoUrl: value?.logoUrl ?? DEFAULT_THEME_SETTINGS.logoUrl,
    colors: {
      ...DEFAULT_THEME_SETTINGS.colors,
      ...(value?.colors ?? {}),
    },
    typography: {
      ...DEFAULT_THEME_SETTINGS.typography,
      ...(value?.typography ?? {}),
    },
  });
}
