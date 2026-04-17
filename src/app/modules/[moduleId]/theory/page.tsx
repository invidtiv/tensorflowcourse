import { getModule, getAdjacentModules } from "@/lib/modules";
import { getModuleTheoryContent, getAllModuleIds } from "@/lib/content";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { mdxComponents } from "@/components/mdx/MDXComponents";
import VideoEmbed from "@/components/content/VideoEmbed";
import VideoTranscript from "@/components/content/VideoTranscript";

// Theory pages are content-driven and the MDX compile step is pure, so there
// is no value in rendering them dynamically on every request. Opt into full
// static generation — Next will prerender one HTML file per module at build
// time and serve it from the edge cache.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllModuleIds().map((moduleId) => ({ moduleId }));
}

interface PageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function TheoryPage({ params }: PageProps) {
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

  const theoryData = getModuleTheoryContent(moduleId);
  const { prev, next } = getAdjacentModules(moduleId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Modules", href: "/modules" },
          { label: `Module ${mod.number}`, href: `/modules/${moduleId}` },
          { label: "Theory" },
        ]}
      />

      <div className="mt-8 mb-6">
        <span
          className="text-xs font-mono font-semibold uppercase tracking-wider"
          style={{ color: mod.color }}
        >
          Module {mod.number} — Theory
        </span>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mt-2">
          {mod.title}
        </h1>
      </div>

      {/* Video slot — rendered from _meta.json videoId / videoUrl so all modules
          get a lecture player without needing to manually inline <VideoEmbed> in
          each theory.mdx. Module 01 used to inline it; this slot replaces that.
          Falls back to nothing when neither field is set (future modules).      */}
      {(mod.videoId || mod.videoUrl) && (
        <div className="mb-8">
          <VideoEmbed
            src={mod.videoUrl ?? mod.videoId}
            type={mod.videoUrl ? "mp4" : "youtube"}
            title={`Module ${mod.number} — Introduction lecture`}
            moduleId={moduleId}
            captions={mod.videoCaptions}
          />
          {mod.transcriptUrl && (
            <div className="mt-2">
              <VideoTranscript
                src={mod.transcriptUrl}
                videoId={mod.videoId}
                title="Lecture transcript"
              />
            </div>
          )}
        </div>
      )}

      {/* MDX content — compiled on the server with math + GFM + autolinked
          headings. The mdxComponents map handles <Callout>, <CodeBlock>,
          tables, links, etc. */}
      {theoryData ? (
        <article className="theory-prose max-w-none">
          <MDXRemote
            source={theoryData.content}
            components={mdxComponents}
            options={{
              parseFrontmatter: false,
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkMath],
                rehypePlugins: [
                  rehypeSlug,
                  [
                    rehypeAutolinkHeadings,
                    {
                      behavior: "wrap",
                      properties: {
                        className: ["heading-anchor"],
                      },
                    },
                  ],
                  rehypeKatex,
                ],
              },
            }}
          />
        </article>
      ) : (
        <div className="p-8 rounded-xl border border-white/[0.06] bg-surface-1/30 text-center">
          <p className="text-text-muted text-lg mb-4">
            Theory content is being prepared for this module.
          </p>
          <p className="text-text-muted text-sm">
            Content will be available soon. Check back later or proceed to the labs.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/[0.06]">
        {prev ? (
          <Link
            href={`/modules/${prev.id}/theory`}
            className="group flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous: {prev.shortTitle}
          </Link>
        ) : <div />}
        <Link
          href={`/modules/${moduleId}/labs`}
          className="group flex items-center gap-2 text-sm text-neon-cyan hover:text-white transition-colors"
        >
          Continue to Labs
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
