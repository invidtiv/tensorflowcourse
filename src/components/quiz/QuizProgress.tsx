"use client";

interface QuizProgressProps {
  current: number; // 0-indexed question position
  total: number;
  answered: number;
  accentColor?: string;
}

/**
 * Thin progress bar + status row shown above each quiz question.
 * Shows "Question X of Y" and a tinted fill matching the module color.
 */
export default function QuizProgress({ current, total, answered, accentColor = "#00d4ff" }: QuizProgressProps) {
  const safeTotal = Math.max(total, 1);
  const percent = Math.min(100, Math.round(((current + 1) / safeTotal) * 100));
  const answeredPercent = Math.min(100, Math.round((answered / safeTotal) * 100));

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-2">
        <span className="text-text-muted">
          Question <span className="text-text-primary">{Math.min(current + 1, total)}</span> of {total}
        </span>
        <span className="text-text-muted">
          Answered <span className="text-text-primary">{answered}</span>/{total}
          <span className="text-text-muted/60 ml-2">({answeredPercent}%)</span>
        </span>
      </div>

      <div
        className="relative h-1.5 rounded-full overflow-hidden bg-white/[0.05]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="absolute inset-y-0 left-0 transition-all duration-300 ease-out"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${accentColor}80 0%, ${accentColor} 100%)`,
            boxShadow: `0 0 12px ${accentColor}66`,
          }}
        />
      </div>
    </div>
  );
}
