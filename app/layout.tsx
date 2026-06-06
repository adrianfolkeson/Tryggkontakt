import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TryggKontakt",
  description: "Lugn kommunikation runt personer med stödbehov.",
  manifest: "/manifest.webmanifest",
  // app/icon.svg is auto-discovered by Next. apple-icon.svg lives in
  // public/ because Next's app/-router only recognises PNG/JPG for
  // the apple-icon convention. Listing both explicitly so neither
  // gets dropped by the auto-merge.
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TryggKontakt",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3F7A6E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv-SE" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
