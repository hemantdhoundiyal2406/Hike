"use client";
import { ImageIcon, LoaderCircle, Moon, RotateCcw, Save, Sun, Trash2, Upload, } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_THEME_SETTINGS, mergeThemeSettings, websiteSettingsSchema, } from "@/lib/theme-schema";
import { useTheme } from "@/components/ThemeProvider";
import { AdminLoading, AdminPageHeader } from "@/components/admin/AdminUi";
import { useToast } from "@/components/admin/ToastProvider";
const colorFields = [
    { key: "primary", label: "Primary color" },
    { key: "secondary", label: "Secondary color" },
    { key: "background", label: "Background color" },
    { key: "text", label: "Text color" },
    { key: "button", label: "Button color" },
    { key: "card", label: "Card color" },
    { key: "border", label: "Border color" },
    { key: "footer", label: "Footer color" },
    { key: "sidebar", label: "Sidebar/menu color" },
];
const typographyFields = [
    { key: "h1Size", label: "H1 font size", min: 24, max: 96 },
    { key: "h2Size", label: "H2 font size", min: 22, max: 80 },
    { key: "h3Size", label: "H3 font size", min: 16, max: 48 },
    { key: "h4Size", label: "H4 font size", min: 14, max: 40 },
    { key: "paragraphSize", label: "Paragraph font size", min: 12, max: 28 },
    { key: "menuSize", label: "Menu text size", min: 11, max: 24 },
    { key: "buttonSize", label: "Button text size", min: 11, max: 26 },
    { key: "footerSize", label: "Footer text size", min: 11, max: 24 },
];
function pxToNumber(value) {
    return Number.parseFloat(value.replace("px", "")) || 0;
}
export function SettingsManager() {
    const router = useRouter();
    const { showToast } = useToast();
    const { updateSettings } = useTheme();
    const [settings, setSettings] = useState(() => mergeThemeSettings());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");
    const [removeLogo, setRemoveLogo] = useState(false);
    const loadSettings = useCallback(async () => {
        try {
            const response = await fetch("/api/admin/settings", { cache: "no-store" });
            if (response.status === 401) {
                router.replace("/admin/login");
                return;
            }
            const data = (await response.json());
            if (!response.ok || !data.data)
                throw new Error(data.message);
            setSettings(mergeThemeSettings(data.data));
        }
        catch (error) {
            showToast(error instanceof Error ? error.message : "Unable to load settings.", "error");
        }
        finally {
            setLoading(false);
        }
    }, [router, showToast]);
    useEffect(() => {
        const timeout = window.setTimeout(() => void loadSettings(), 0);
        return () => window.clearTimeout(timeout);
    }, [loadSettings]);
    useEffect(() => {
        return () => {
            if (logoPreview)
                URL.revokeObjectURL(logoPreview);
        };
    }, [logoPreview]);
    function updateColor(key, value) {
        setSettings((current) => ({
            ...current,
            colors: { ...current.colors, [key]: value },
        }));
    }
    function updateTypography(key, value) {
        setSettings((current) => ({
            ...current,
            typography: { ...current.typography, [key]: value },
        }));
    }
    function selectLogo(event) {
        const file = event.target.files?.[0] ?? null;
        setLogoFile(file);
        setRemoveLogo(false);
        if (logoPreview)
            URL.revokeObjectURL(logoPreview);
        setLogoPreview(file ? URL.createObjectURL(file) : "");
    }
    function resetDefaults() {
        setSettings(mergeThemeSettings(DEFAULT_THEME_SETTINGS));
        setLogoFile(null);
        setLogoPreview("");
        setRemoveLogo(true);
    }
    async function saveSettings(event) {
        event.preventDefault();
        const payload = {
            ...settings,
            logoUrl: removeLogo ? "" : settings.logoUrl,
        };
        const result = websiteSettingsSchema.safeParse(payload);
        if (!result.success) {
            showToast(result.error.issues[0]?.message ?? "Check the settings.", "error");
            return;
        }
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("settings", JSON.stringify(result.data));
            if (logoFile)
                formData.append("logo", logoFile);
            if (removeLogo)
                formData.append("removeLogo", "true");
            const response = await fetch("/api/admin/settings", {
                method: "PATCH",
                body: formData,
            });
            const data = (await response.json());
            if (!response.ok || !data.data)
                throw new Error(data.message);
            const saved = mergeThemeSettings(data.data);
            setSettings(saved);
            updateSettings(saved);
            setLogoFile(null);
            setLogoPreview("");
            setRemoveLogo(false);
            showToast(data.message);
        }
        catch (error) {
            showToast(error instanceof Error ? error.message : "Unable to save settings.", "error");
        }
        finally {
            setSaving(false);
        }
    }
    const visibleLogo = removeLogo ? "" : logoPreview || settings.logoUrl;
    return (<>
      <AdminPageHeader eyebrow="Website settings" title="Theme controls" description="Manage the public website theme, default mode, logo and typography from one place." action={<button className="admin-primary-button" type="submit" form="website-settings-form" disabled={saving || loading}>
            {saving ? (<LoaderCircle className="animate-spin" size={17}/>) : (<Save size={17}/>)}
            Save settings
          </button>}/>

      {loading ? (<AdminLoading label="Loading website settings"/>) : (<form id="website-settings-form" className="admin-settings-layout" onSubmit={saveSettings}>
          <section className="admin-panel admin-settings-panel">
            <header className="admin-panel-header">
              <div>
                <p>Color schema</p>
                <h2>Brand colors</h2>
              </div>
            </header>
            <div className="admin-settings-grid">
              {colorFields.map(({ key, label }) => (<label className="admin-color-field" key={key}>
                  <span>{label}</span>
                  <div>
                    <input type="color" value={settings.colors[key]} onChange={(event) => updateColor(key, event.target.value)} aria-label={label}/>
                    <input value={settings.colors[key]} onChange={(event) => updateColor(key, event.target.value)}/>
                  </div>
                </label>))}
            </div>
          </section>

          <section className="admin-panel admin-settings-panel">
            <header className="admin-panel-header">
              <div>
                <p>Mode and logo</p>
                <h2>Default experience</h2>
              </div>
            </header>
            <div className="admin-settings-grid two-column">
              <div className="admin-setting-block">
                <span>Default mode</span>
                <div className="admin-mode-options">
                  {["dark", "light"].map((mode) => (<label key={mode} className={settings.defaultMode === mode ? "active" : undefined}>
                      <input type="radio" name="defaultMode" value={mode} checked={settings.defaultMode === mode} onChange={() => setSettings((current) => ({
                    ...current,
                    defaultMode: mode,
                }))}/>
                      {mode === "dark" ? <Moon size={18}/> : <Sun size={18}/>}
                      <span>{mode === "dark" ? "Dark" : "Light"}</span>
                    </label>))}
                </div>
              </div>

              <div className="admin-setting-block">
                <span>Website logo</span>
                <div className="admin-logo-uploader">
                  <div className="admin-logo-preview">
                    {visibleLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={visibleLogo} alt="Logo preview"/>) : (<>
                        <ImageIcon size={24}/>
                        <small>Default HIKE mark</small>
                      </>)}
                  </div>
                  <div className="admin-logo-actions">
                    <label className="admin-secondary-button">
                      <Upload size={17}/>
                      Upload logo
                      <input type="file" accept="image/*" onChange={selectLogo}/>
                    </label>
                    <button className="admin-danger-button" type="button" onClick={() => {
                setLogoFile(null);
                setLogoPreview("");
                setRemoveLogo(true);
            }}>
                      <Trash2 size={17}/>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-panel admin-settings-panel">
            <header className="admin-panel-header">
              <div>
                <p>Typography</p>
                <h2>Font sizing</h2>
              </div>
              <button className="admin-secondary-button" type="button" onClick={resetDefaults}>
                <RotateCcw size={16}/>
                Reset defaults
              </button>
            </header>
            <div className="admin-settings-grid typography-grid">
              {typographyFields.map(({ key, label, min, max }) => (<label className="admin-range-field" key={key}>
                  <span>{label}</span>
                  <div>
                    <input type="range" min={min} max={max} value={pxToNumber(settings.typography[key])} onChange={(event) => updateTypography(key, `${event.target.value}px`)}/>
                    <input type="number" min={min} max={max} value={pxToNumber(settings.typography[key])} onChange={(event) => updateTypography(key, `${event.target.value}px`)}/>
                  </div>
                </label>))}
              <label className="admin-range-field">
                <span>Line height</span>
                <div>
                  <input type="range" min="1" max="2.2" step="0.05" value={settings.typography.lineHeight} onChange={(event) => updateTypography("lineHeight", event.target.value)}/>
                  <input type="number" min="1" max="2.2" step="0.05" value={settings.typography.lineHeight} onChange={(event) => updateTypography("lineHeight", event.target.value)}/>
                </div>
              </label>
            </div>
          </section>
        </form>)}
    </>);
}
