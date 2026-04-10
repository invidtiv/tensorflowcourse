interface CalloutProps {
  type?: "info" | "warning" | "tip" | "pitfall" | "note";
  title?: string;
  children: React.ReactNode;
}

const config = {
  info: {
    icon: "💡",
    borderColor: "border-neon-cyan/30",
    bgColor: "bg-neon-cyan/5",
    titleColor: "text-neon-cyan",
    defaultTitle: "Info",
  },
  warning: {
    icon: "⚠️",
    borderColor: "border-warning/30",
    bgColor: "bg-warning/5",
    titleColor: "text-warning",
    defaultTitle: "Warning",
  },
  tip: {
    icon: "✅",
    borderColor: "border-success/30",
    bgColor: "bg-success/5",
    titleColor: "text-success",
    defaultTitle: "Tip",
  },
  pitfall: {
    icon: "🚨",
    borderColor: "border-error/30",
    bgColor: "bg-error/5",
    titleColor: "text-error",
    defaultTitle: "Common Pitfall",
  },
  note: {
    icon: "📝",
    borderColor: "border-neon-purple/30",
    bgColor: "bg-neon-purple/5",
    titleColor: "text-neon-purple",
    defaultTitle: "Note",
  },
};

export default function Callout({ type = "info", title, children }: CalloutProps) {
  const c = config[type];
  return (
    <div className={`my-4 rounded-xl border-l-4 ${c.borderColor} ${c.bgColor} p-5`}>
      <div className="flex items-center gap-2 mb-2">
        <span>{c.icon}</span>
        <span className={`text-sm font-semibold ${c.titleColor}`}>
          {title || c.defaultTitle}
        </span>
      </div>
      <div className="text-sm text-text-secondary leading-relaxed">{children}</div>
    </div>
  );
}
