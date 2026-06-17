"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, } from "react";
import { mergeThemeSettings, } from "@/lib/theme-schema";
const STORAGE_KEY = "hike-theme-mode";
const ThemeContext = createContext(null);
function parseHex(value) {
    const normalized = value.replace("#", "");
    const hex = normalized.length === 3
        ? normalized
            .split("")
            .map((part) => part + part)
            .join("")
        : normalized;
    return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
    };
}
function toHex(value) {
    return Math.round(Math.max(0, Math.min(255, value)))
        .toString(16)
        .padStart(2, "0");
}
function mix(color, target, amount) {
    const from = parseHex(color);
    const to = parseHex(target);
    const ratio = Math.max(0, Math.min(1, amount));
    return `#${toHex(from.r + (to.r - from.r) * ratio)}${toHex(from.g + (to.g - from.g) * ratio)}${toHex(from.b + (to.b - from.b) * ratio)}`;
}
function alpha(color, opacity) {
    const { r, g, b } = parseHex(color);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
function applyTheme(settings, mode) {
    const root = document.documentElement;
    const colors = settings.colors;
    const isLight = mode === "light";
    const pageBackground = isLight
        ? mix(colors.background, "#ffffff", 0.9)
        : colors.background;
    const pageText = isLight ? mix(colors.text, "#111827", 0.86) : colors.text;
    const card = isLight ? mix(colors.card, "#ffffff", 0.92) : colors.card;
    const footer = isLight ? mix(colors.footer, "#ffffff", 0.9) : colors.footer;
    const sidebar = isLight
        ? mix(colors.sidebar, "#ffffff", 0.9)
        : colors.sidebar;
    const border = isLight ? mix(colors.border, "#111827", 0.28) : colors.border;
    root.dataset.theme = mode;
    const variables = {
        "--primary-color": colors.primary,
        "--secondary-color": colors.secondary,
        "--bg-color": colors.background,
        "--text-color": colors.text,
        "--button-color": colors.button,
        "--card-color": colors.card,
        "--border-color": colors.border,
        "--footer-color": colors.footer,
        "--sidebar-color": colors.sidebar,
        "--background": pageBackground,
        "--surface": card,
        "--surface-2": isLight ? mix(card, "#111827", 0.04) : mix(card, "#ffffff", 0.04),
        "--line": border,
        "--muted": alpha(pageText, isLight ? 0.66 : 0.56),
        "--page-bg-color": pageBackground,
        "--page-text-color": pageText,
        "--page-card-color": card,
        "--page-footer-color": footer,
        "--page-sidebar-color": sidebar,
        "--page-border-color": alpha(border, isLight ? 0.26 : 0.42),
        "--h1-size": settings.typography.h1Size,
        "--h2-size": settings.typography.h2Size,
        "--h3-size": settings.typography.h3Size,
        "--h4-size": settings.typography.h4Size,
        "--p-size": settings.typography.paragraphSize,
        "--menu-size": settings.typography.menuSize,
        "--button-text-size": settings.typography.buttonSize,
        "--footer-text-size": settings.typography.footerSize,
        "--theme-line-height": settings.typography.lineHeight,
    };
    Object.entries(variables).forEach(([name, value]) => {
        root.style.setProperty(name, value);
    });
}
function isThemeMode(value) {
    return value === "dark" || value === "light";
}
export function ThemeProvider({ initialSettings, children, }) {
    const [settings, setSettings] = useState(() => mergeThemeSettings(initialSettings));
    const [mode, setModeState] = useState(() => {
        if (typeof window === "undefined")
            return initialSettings.defaultMode;
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            return isThemeMode(stored) ? stored : initialSettings.defaultMode;
        }
        catch {
            return initialSettings.defaultMode;
        }
    });
    const setMode = useCallback((nextMode) => {
        setModeState(nextMode);
        try {
            window.localStorage.setItem(STORAGE_KEY, nextMode);
        }
        catch {
            // localStorage can be unavailable in private or locked-down browsers.
        }
    }, []);
    const toggleMode = useCallback(() => {
        setMode(mode === "dark" ? "light" : "dark");
    }, [mode, setMode]);
    const updateSettings = useCallback((nextSettings) => {
        setSettings(mergeThemeSettings(nextSettings));
    }, []);
    useEffect(() => {
        applyTheme(settings, mode);
    }, [settings, mode]);
    useEffect(() => {
        let active = true;
        async function loadSettings() {
            try {
                const response = await fetch("/api/theme-settings", {
                    cache: "no-store",
                });
                const data = (await response.json());
                if (active && response.ok && data.data) {
                    const nextSettings = mergeThemeSettings(data.data);
                    setSettings(nextSettings);
                    const stored = window.localStorage.getItem(STORAGE_KEY);
                    if (!isThemeMode(stored)) {
                        setModeState(nextSettings.defaultMode);
                    }
                }
            }
            catch {
                // Server-rendered defaults are already applied.
            }
        }
        void loadSettings();
        return () => {
            active = false;
        };
    }, []);
    const value = useMemo(() => ({
        settings,
        mode,
        logoUrl: settings.logoUrl,
        setMode,
        toggleMode,
        updateSettings,
    }), [mode, setMode, settings, toggleMode, updateSettings]);
    return (<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>);
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider.");
    }
    return context;
}
