import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable}`}>
        {children}
      </body>
    </html>
  );
}
