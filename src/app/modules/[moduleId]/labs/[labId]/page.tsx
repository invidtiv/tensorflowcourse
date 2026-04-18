import { getModule } from "@/lib/modules";
import { getLabContent, getModuleLabsList } from "@/lib/content";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Button from "@/components/ui/Button";
import Link from "next/link";
import TheoryContentRenderer from "../../theory/TheoryContentRenderer";
import LabAttemptTracker from "./LabAttemptTracker";

interface PageProps {
  params: Promise<{ moduleId: string; labId: string }>;
}

export default async function LabPage({ params }: PageProps) {
  const { moduleId, labId } = await params;
  const mod = getModule(moduleId);

  if (!mod) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">Module not found</h1>
        <Button href="/modules">Back to Modules</Button>
      </div>
    );
  }

  const labData = getLabContent(moduleId, labId);
  const labs = getModuleLabsList(moduleId);
  const currentIdx = labs.findIndex((l) => l.id === labId);
  const prevLab = currentIdx > 0 ? labs[currentIdx - 1] : null;
  const nextLab = currentIdx < labs.length - 1 ? labs[currentIdx + 1] : null;
  const labTitle = labData?.frontmatter?.title as string || labs[currentIdx]?.title || labId;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Track when the student opens a lab for analytics */}
      <LabAttemptTracker moduleId={moduleId} labId={labId} />
      <Breadcrumb
        items={[
          { label: "Modules", href: "/modules" },
          { label: `Module ${mod.number}`, href: `/modules/${moduleId}` },
          { label: "Labs", href: `/modules/${moduleId}/labs` },
          { label: labTitle },
        ]}
      />

      <div className="mt-8 mb-6">
        <span
          className="text-xs font-mono font-semibold uppercase tracking-wider"
          style={{ color: mod.color }}
        >
          Module {mod.number} — Lab {currentIdx + 1} of {labs.length}
        </span>
        <h1 className="text-3xl font-heading font-bold text-text-primary mt-2">
          {labTitle}
        </h1>
      </div>

      {/* Content */}
      {labData ? (
        <TheoryContentRenderer content={labData.content} />
      ) : (
        <div className="p-8 rounded-xl border border-white/[0.06] bg-surface-1/30 text-center">
          <p className="text-text-muted">Lab content is being prepared.</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/[0.06]">
        {prevLab ? (
          <Link
            href={`/modules/${moduleId}/labs/${prevLab.id}`}
            className="group flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous Lab
          </Link>
        ) : (
          <Link
            href={`/modules/${moduleId}/labs`}
            className="group flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Labs
          </Link>
        )}
        {nextLab ? (
          <Link
            href={`/modules/${moduleId}/labs/${nextLab.id}`}
            className="group flex items-center gap-2 text-sm text-neon-cyan hover:text-white transition-colors"
          >
            Next Lab
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <Link
            href={`/modules/${moduleId}/quiz`}
            className="group flex items-center gap-2 text-sm text-neon-cyan hover:text-white transition-colors"
          >
            Take the Quiz
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
