import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  buildThemeCssVariables,
  getWebsiteSettings,
} from "@/lib/theme-settings";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://novaforge.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NovaForge Studio | Digital Experiences That Move Brands",
    template: "%s | NovaForge Studio",
  },
  description:
    "hike agency is an independent digital agency creating high-converting websites, e-commerce experiences, brands, and growth systems.",
  keywords: [
    "digital agency",
    "web design",
    "web development",
    "e-commerce",
    "branding",
    "digital marketing",
  ],
  authors: [{ name: "NovaForge Studio" }],
  openGraph: {
    title: "NovaForge Studio | Digital Experiences That Move Brands",
    description:
      "Strategy, design, development, and growth for ambitious brands.",
    type: "website",
    url: siteUrl,
    siteName: "NovaForge Studio",
    images: [
      {
        url: "/references/hero-reference.png",
        width: 1536,
        height: 1024,
        alt: "hike agency digital agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "hike agency",
    description:
      "Strategy, design, development, and growth for ambitious brands.",
    images: ["/references/hero-reference.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05050a",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getWebsiteSettings();
  const modeScript = `(() => { try { const stored = localStorage.getItem("hike-theme-mode"); const mode = stored === "light" || stored === "dark" ? stored : "${settings.defaultMode}"; document.documentElement.dataset.theme = mode; } catch (_) { document.documentElement.dataset.theme = "${settings.defaultMode}"; } })();`;

  return (
    <html
      lang="en"
      data-theme={settings.defaultMode}
      style={buildThemeCssVariables(settings)}
      suppressHydrationWarning
    >
      <body className={`${inter.variable} ${manrope.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: modeScript }} />
        <ThemeProvider initialSettings={settings}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
