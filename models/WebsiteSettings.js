import { model, models, Schema } from "mongoose";
import { DEFAULT_THEME_SETTINGS } from "@/lib/theme-schema";
const colorSchema = new Schema({
    primary: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.colors.primary },
    secondary: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.colors.secondary },
    background: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.colors.background },
    text: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.colors.text },
    button: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.colors.button },
    card: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.colors.card },
    border: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.colors.border },
    footer: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.colors.footer },
    sidebar: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.colors.sidebar },
}, { _id: false });
const typographySchema = new Schema({
    h1Size: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.typography.h1Size },
    h2Size: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.typography.h2Size },
    h3Size: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.typography.h3Size },
    h4Size: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.typography.h4Size },
    paragraphSize: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.typography.paragraphSize },
    menuSize: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.typography.menuSize },
    buttonSize: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.typography.buttonSize },
    footerSize: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.typography.footerSize },
    lineHeight: { type: String, required: true, default: DEFAULT_THEME_SETTINGS.typography.lineHeight },
}, { _id: false });
const websiteSettingsSchema = new Schema({
    key: { type: String, required: true, default: "global", unique: true },
    defaultMode: {
        type: String,
        enum: ["dark", "light"],
        required: true,
        default: DEFAULT_THEME_SETTINGS.defaultMode,
    },
    logoUrl: { type: String, default: "" },
    colors: { type: colorSchema, required: true, default: DEFAULT_THEME_SETTINGS.colors },
    typography: {
        type: typographySchema,
        required: true,
        default: DEFAULT_THEME_SETTINGS.typography,
    },
}, { timestamps: true });
const WebsiteSettings = models.WebsiteSettings ||
    model("WebsiteSettings", websiteSettingsSchema);
export default WebsiteSettings;
