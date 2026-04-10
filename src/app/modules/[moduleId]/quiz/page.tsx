import { getModule } from "@/lib/modules";
import { getModuleQuiz } from "@/lib/content";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Button from "@/components/ui/Button";
import Quiz from "@/components/quiz/Quiz";

interface PageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function QuizPage({ params }: PageProps) {
  const { moduleId } = await params;
  const mod = getModule(moduleId);

  if (!mod) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">
          Module not found
        </h1>
        <Button href="/modules">Back to Modules</Button>
      </div>
    );
  }

  const quiz = getModuleQuiz(moduleId);
  const hasQuestions = !!quiz && quiz.questions.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Modules", href: "/modules" },
          { label: `Module ${mod.number}`, href: `/modules/${moduleId}` },
          { label: "Quiz" },
        ]}
      />

      <div className="mt-8 mb-8">
        <span
          className="text-xs font-mono font-semibold uppercase tracking-wider"
          style={{ color: mod.color }}
        >
          Module {mod.number} — Quiz
        </span>
        <h1 className="text-3xl font-heading font-bold text-text-primary mt-2 mb-2">
          {mod.shortTitle} — Knowledge Check
        </h1>
        {hasQuestions && quiz && (
          <p className="text-sm text-text-muted">
            {quiz.questions.length} questions · {quiz.passingScore}% to pass · instant feedback
            after each answer
          </p>
        )}
      </div>

      {hasQuestions && quiz ? (
        <Quiz
          moduleId={moduleId}
          questions={quiz.questions}
          passingScore={quiz.passingScore}
          accentColor={mod.color}
        />
      ) : (
        <div className="p-12 rounded-xl border border-white/[0.06] bg-surface-1/30 text-center">
          <div className="text-5xl mb-4">🧪</div>
          <h2 className="text-xl font-heading font-semibold text-text-primary mb-3">
            Quiz Coming Soon
          </h2>
          <p className="text-text-muted max-w-md mx-auto mb-6">
            No quiz questions are authored for this module yet. In the meantime, review the
            theory or get hands-on with the labs.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" href={`/modules/${moduleId}/theory`}>
              Review Theory
            </Button>
            <Button variant="outline" href={`/modules/${moduleId}/labs`}>
              Practice Labs
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
