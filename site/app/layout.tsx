import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ColorSchemeScript } from "@mantine/core";
import { Providers } from "@/components/providers";
import "@mantine/core/styles.layer.css";
import "./globals.css";

const display = localFont({
  src: "../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-display",
  weight: "300 700",
  display: "swap",
});
const body = localFont({
  src: "../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2",
  variable: "--font-body",
  weight: "100 1000",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: process.env.SITE_URL
    ? new URL(process.env.SITE_URL)
    : new URL("http://localhost:3000"),
  title: "Nanodes",
  description:
    "Bring text and SVGs to life with block glyphs and shimmer transitions. A framework-agnostic animation library with zero runtime dependencies.",
  openGraph: {
    title: "Nanodes — Small glyphs. Big personality.",
    description:
      "Text, shapes, and a little motion. Explore the live glyph playground.",
    type: "website",
    locale: "en_US",
    siteName: "Nanodes",
  },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#1b1f29" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-mantine-color-scheme="dark"
      className={`${display.variable} ${body.variable}`}
    >
      <head>
        <ColorSchemeScript forceColorScheme="dark" />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
