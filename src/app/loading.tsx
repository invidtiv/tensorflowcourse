/**
 * Global loading UI — shown while route segments stream in.
 * Dark-AI-themed skeleton matching the site's navy/orange palette.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading content"
      className="mx-auto w-full max-w-5xl px-6 py-16"
    >
      {/* Eyebrow shimmer */}
      <div className="mb-6 h-3 w-32 animate-pulse rounded-full bg-orange-500/30" />

      {/* Title shimmer */}
      <div className="mb-4 h-10 w-3/4 animate-pulse rounded-md bg-white/10" />
      <div className="mb-10 h-10 w-1/2 animate-pulse rounded-md bg-white/10" />

      {/* Paragraph lines */}
      <div className="space-y-3">
        {[
          "w-full",
          "w-11/12",
          "w-10/12",
          "w-full",
          "w-9/12",
        ].map((w, i) => (
          <div
            key={i}
            className={`h-3 animate-pulse rounded bg-white/5 ${w}`}
          />
        ))}
      </div>

      {/* Callout card shimmer */}
      <div className="mt-10 h-32 w-full animate-pulse rounded-lg border border-cyan-400/10 bg-cyan-400/[0.03]" />

      {/* Code block shimmer */}
      <div className="mt-6 h-48 w-full animate-pulse rounded-lg border border-white/5 bg-black/40" />

      {/* Accessible label */}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
