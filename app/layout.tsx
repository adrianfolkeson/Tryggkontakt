import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-inter",
});

const TEXT_SIZE_COOKIE = "tk-text-size";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read text-size preference from a cookie set by /app/installningar.
  // Edge case: users without the tk-text-size cookie default to medium
  // until they visit /app/installningar once. Acceptable trade-off vs
  // a DB read on every page load.
  const store = await cookies();
  const cookieValue = store.get(TEXT_SIZE_COOKIE)?.value;
  const dataTextSize =
    cookieValue === "small" || cookieValue === "large"
      ? cookieValue
      : undefined;

  return (
    <html
      lang="sv-SE"
      className={inter.variable}
      data-text-size={dataTextSize}
    >
      <body>{children}</body>
    </html>
  );
}
