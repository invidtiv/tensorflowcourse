import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-start justify-center px-6 py-16">
      <div className="mb-4 h-1 w-20 bg-orange-500" />
      <p className="mb-2 font-mono text-sm font-semibold uppercase tracking-widest text-orange-400">
        404 · not found
      </p>
      <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">
        Off the training set.
      </h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-300">
        This page isn&apos;t one we&apos;ve seen before. It may have been moved,
        renamed, or never existed. Jump back to a known checkpoint:
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-md bg-orange-500 px-5 py-2.5 font-semibold text-black transition hover:bg-orange-400"
        >
          Home
        </Link>
        <Link
          href="/modules/01-intro-deep-learning/theory"
          className="rounded-md border border-cyan-400/40 bg-cyan-400/5 px-5 py-2.5 font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
        >
          Start Module 01
        </Link>
        <Link
          href="/resources"
          className="rounded-md border border-white/10 bg-white/[0.03] px-5 py-2.5 font-semibold text-slate-200 transition hover:bg-white/[0.06]"
        >
          Resources
        </Link>
      </div>
    </div>
  );
}
