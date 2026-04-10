interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "beginner" | "intermediate" | "advanced" | "success" | "warning";
  className?: string;
}

const variantClasses = {
  default: "bg-surface-2 text-text-secondary border-white/10",
  beginner: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20",
  intermediate: "bg-neon-purple/10 text-neon-purple border-neon-purple/20",
  advanced: "bg-tf-orange/10 text-tf-orange border-tf-orange/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
};

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
