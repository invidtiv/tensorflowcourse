"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: string;
}

export default function Card({ children, className = "", hover = true, glow }: CardProps) {
  const glowStyle = glow
    ? { "--card-glow": glow } as React.CSSProperties
    : {};

  return (
    <div
      className={`
        rounded-xl border border-white/[0.06] bg-surface-1/50 backdrop-blur-sm
        ${hover ? "transition-all duration-300 hover:border-white/[0.12] hover:bg-surface-1/70 hover:shadow-lg hover:-translate-y-0.5" : ""}
        ${glow ? `hover:border-[color:var(--card-glow)]/30 hover:shadow-[0_0_30px_rgba(var(--card-glow),0.1)]` : ""}
        ${className}
      `}
      style={glowStyle}
    >
      {children}
    </div>
  );
}
