import type { MDXComponents as MDXComponentsType } from "mdx/types";
import CodeBlock from "@/components/content/CodeBlock";
import Callout from "@/components/content/Callout";
import ColabButton from "@/components/content/ColabButton";
import MathBlock from "@/components/content/MathBlock";
import ImageZoom from "@/components/content/ImageZoom";
import VideoEmbed from "@/components/content/VideoEmbed";

/**
 * Custom MDX component mapping.
 * These components replace standard HTML elements and provide
 * custom components available in MDX content.
 */
export const mdxComponents: MDXComponentsType = {
  // Override default HTML elements
  pre: ({ children, ...props }: React.ComponentPropsWithoutRef<"pre">) => {
    // Extract code content and language from the nested <code> element
    const codeElement = children as React.ReactElement<{
      className?: string;
      children?: string;
    }>;
    if (codeElement?.props) {
      const className = codeElement.props.className || "";
      const language = className.replace("language-", "") || "text";
      const code = typeof codeElement.props.children === "string"
        ? codeElement.props.children
        : "";
      return <CodeBlock language={language}>{code}</CodeBlock>;
    }
    return <pre {...props}>{children}</pre>;
  },

  // Override inline code
  code: ({ children, className, ...props }: React.ComponentPropsWithoutRef<"code">) => {
    // If inside a <pre>, it's handled by the pre override above
    if (className?.startsWith("language-")) {
      return <code className={className} {...props}>{children}</code>;
    }
    return (
      <code className="bg-surface-1 px-1.5 py-0.5 rounded text-sm text-neon-cyan font-code" {...props}>
        {children}
      </code>
    );
  },

  // Override headings with IDs for table of contents
  h2: ({ children, ...props }: React.ComponentPropsWithoutRef<"h2">) => {
    const id = typeof children === "string"
      ? children.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
      : undefined;
    return (
      <h2 id={id} className="scroll-mt-24" {...props}>
        {children}
      </h2>
    );
  },

  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<"h3">) => {
    const id = typeof children === "string"
      ? children.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
      : undefined;
    return (
      <h3 id={id} className="scroll-mt-24" {...props}>
        {children}
      </h3>
    );
  },

  // Override tables with dark-theme styling.
  // GFM pipe tables (from remark-gfm) are parsed into real <table> elements,
  // so we style the full set of table children — without these, rows render
  // as borderless space-separated text and look like broken ASCII art.
  table: ({ children, ...props }: React.ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-6 rounded-lg border border-white/[0.08] bg-surface-1/30">
      <table className="w-full text-sm border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.ComponentPropsWithoutRef<"thead">) => (
    <thead className="bg-surface-2/60 border-b border-white/[0.08]" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: React.ComponentPropsWithoutRef<"tbody">) => (
    <tbody className="divide-y divide-white/[0.05]" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: React.ComponentPropsWithoutRef<"tr">) => (
    <tr className="hover:bg-white/[0.02] transition-colors" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: React.ComponentPropsWithoutRef<"th">) => (
    <th
      className="px-4 py-3 text-left font-semibold text-text-primary whitespace-nowrap"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.ComponentPropsWithoutRef<"td">) => (
    <td className="px-4 py-3 text-text-secondary align-top" {...props}>
      {children}
    </td>
  ),

  // Override blockquotes
  blockquote: ({ children, ...props }: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="border-l-3 border-neon-purple pl-4 my-4 italic text-text-secondary" {...props}>
      {children}
    </blockquote>
  ),

  // Override links to open external links in new tab
  a: ({ href, children, ...props }: React.ComponentPropsWithoutRef<"a">) => {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-neon-cyan hover:underline"
        {...props}
      >
        {children}
      </a>
    );
  },

  // Custom components available in MDX
  Callout,
  ColabButton,
  MathBlock,
  ImageZoom,
  VideoEmbed,
  CodeBlock,
};

export default mdxComponents;
