import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ReadingProgress from "@/components/layout/ReadingProgress";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
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
