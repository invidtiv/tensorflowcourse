"use client";

/**
 * Global error boundary — catches render errors in route segments.
 * Must be a Client Component per Next.js App Router conventions.
 */
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook for future telemetry — keep as console for now.
    // eslint-disable-next-line no-console
    console.error("[route error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-start justify-center px-6 py-16">
      <div className="mb-4 h-1 w-20 bg-orange-500" />
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-400">
        Something broke
      </p>
      <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
        This page hit a snag.
      </h1>
      <p className="mb-2 max-w-2xl text-lg text-slate-300">
        An unexpected error prevented this section from rendering. You can try
        again — if it keeps happening, the details below may help.
      </p>

      {error.digest && (
        <p className="mb-6 font-mono text-xs text-slate-500">
          error id: {error.digest}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-orange-500 px-5 py-2.5 font-semibold text-black transition hover:bg-orange-400"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-cyan-400/40 bg-cyan-400/5 px-5 py-2.5 font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
