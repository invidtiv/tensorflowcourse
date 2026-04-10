import { getModule } from "@/lib/modules";
import { getModuleLabsList } from "@/lib/content";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface PageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function LabsListPage({ params }: PageProps) {
  const { moduleId } = await params;
  const mod = getModule(moduleId);

  if (!mod) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">Module not found</h1>
        <Button href="/modules">Back to Modules</Button>
      </div>
    );
  }

  const labs = getModuleLabsList(moduleId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Modules", href: "/modules" },
          { label: `Module ${mod.number}`, href: `/modules/${moduleId}` },
          { label: "Labs" },
        ]}
      />

      <div className="mt-8 mb-8">
        <span
          className="text-xs font-mono font-semibold uppercase tracking-wider"
          style={{ color: mod.color }}
        >
          Module {mod.number} — Labs
        </span>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mt-2 mb-3">
          {mod.shortTitle} — Hands-on Labs
        </h1>
        <p className="text-text-secondary">
          {labs.length > 0
            ? `${labs.length} lab exercises to reinforce your understanding.`
            : "Lab exercises are being prepared for this module."}
        </p>
      </div>

      {labs.length > 0 ? (
        <div className="space-y-3">
          {labs.map((lab, i) => (
            <Link
              key={lab.id}
              href={`/modules/${moduleId}/labs/${lab.id}`}
              className="group flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-surface-1/30 hover:border-neon-purple/30 hover:bg-surface-1/50 transition-all"
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: `${mod.color}15`, color: mod.color }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-text-primary group-hover:text-white transition-colors truncate">
                  {lab.title}
                </h3>
              </div>
              <svg className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-xl border border-white/[0.06] bg-surface-1/30 text-center">
          <p className="text-text-muted text-lg mb-2">Labs coming soon</p>
          <p className="text-text-muted text-sm">
            Content is being converted. Check back shortly.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/[0.06]">
        <Link
          href={`/modules/${moduleId}/theory`}
          className="group flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Theory
        </Link>
        <Link
          href={`/modules/${moduleId}/quiz`}
          className="group flex items-center gap-2 text-sm text-neon-cyan hover:text-white transition-colors"
        >
          Take the Quiz
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
