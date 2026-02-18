import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ff10f0", // Hot Pink
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Go Sleepy | Find Your Next Safe Place to Sleep - Fast",
  description: "Roadside-optimized hotel booking for tired travelers. Find safe, highly-rated rooms nearby with Pay at Property convenience. 1AM mode enabled.",
  applicationName: "Go Sleepy",
  keywords: ["hotels nearby", "last minute hotels", "roadside hotels", "pay at property", "safe hotels", "go sleepy", "fast booking"],
  authors: [{ name: "19B PROJECTS" }],
  creator: "19B PROJECTS",
  publisher: "19B PROJECTS",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gosleepy.xyz",
    siteName: "Go Sleepy",
    title: "Go Sleepy | Find a Safe Room Tonight",
    description: "The fastest way to secure a room when you're tired. No payment required today. See real-time price trends.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Go Sleepy - Premium Roadside Rest",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Go Sleepy | Find a Safe Room Tonight",
    description: "The fastest way to secure a room when you're tired. 1AM Mode: High contrast, low friction.",
    images: ["/og-image.png"],
    creator: "@gosleepy",
  },
};

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <body className={`${inter.className} antialiased bg-black flex flex-col min-h-screen`}>
        <SiteHeader />
        <main className="flex-grow">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
