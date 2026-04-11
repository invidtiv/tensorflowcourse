import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ReadingProgress from "@/components/layout/ReadingProgress";
import Footer from "@/components/layout/Footer";
import "./globals.css";

// Body font only. We deliberately do NOT load JetBrains Mono via next/font
// because Google's `latin` subset of JetBrains Mono does NOT include the
// box-drawing Unicode block (U+2500–257F). That caused every ─│┌┐└┘ glyph
// to fall back per-glyph to the system monospace font with a different
// advance width than JetBrains Mono, producing sub-pixel drift that
// compounded across 66-character rows and visibly broke ASCII diagrams.
//
// The code font is instead set via CSS `--font-code` as a `ui-monospace`
// stack, which on every modern OS maps to a single system font that has
// *both* ASCII and box-drawing glyphs at identical advance widths — no
// per-glyph fallback, so no drift.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  // Localhost-only deployment. metadataBase resolves relative OG/Twitter
  // image URLs against the local dev/Docker host so they don't throw
  // build-time warnings. No public domain exists for this project.
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Deep Learning with TensorFlow — Free Course",
    template: "%s | TensorFlow Course",
  },
  description:
    "Master TensorFlow and deep learning with this free, comprehensive course. 10 modules, 80+ labs, from fundamentals to production deployment.",
  keywords: [
    "TensorFlow",
    "deep learning",
    "machine learning",
    "neural networks",
    "free course",
    "Python",
    "AI",
  ],
  openGraph: {
    title: "Deep Learning with TensorFlow — Free Course",
    description:
      "Master TensorFlow and deep learning with this free, comprehensive course. 10 modules, 80+ labs.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Deep Learning with TensorFlow — Free Course",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deep Learning with TensorFlow — Free Course",
    description:
      "Master TensorFlow and deep learning with this free, comprehensive course. 10 modules, 80+ labs.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <ReadingProgress />
        <Sidebar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
