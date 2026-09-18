import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s | BroEditz - Mastering Visual Art",
    default: "BroEditz - Mastering Visual Art",
  },
  description: "High-performance video editing, cinematic storytelling, and digital content strategies.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "BroEditz - Mastering Visual Art",
    description: "High-performance video editing, cinematic storytelling, and digital content strategies.",
    url: "https://broeditz.com", // Replace with your actual URL
    siteName: "BroEditz",
    images: [
      {
        url: "https://broeditz.com/og-image.jpg", // Replace with your actual OG image
        width: 1200,
        height: 630,
        alt: "BroEditz - Mastering Visual Art",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BroEditz - Mastering Visual Art",
    description: "High-performance video editing, cinematic storytelling, and digital content strategies.",
    creator: "@broeditz", // Replace with your Twitter handle
    images: ["https://broeditz.com/twitter-image.jpg"], // Replace with your actual Twitter image
  },
  keywords: ["video editing", "cinematic storytelling", "digital content", "post-production", "motion graphics", "video production"],
  authors: [{ name: "BroEditz" }],
  creator: "BroEditz",
  publisher: "BroEditz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
