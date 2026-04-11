// DEPRECATED — kept as a stub to avoid breaking any stale imports.
//
// The theory page previously rendered module content through a hand-rolled
// regex markdown pass that did not support KaTeX math, GFM tables, or real
// MDX components. It has been replaced by `next-mdx-remote/rsc` + remark-math
// + rehype-katex, wired up directly in `page.tsx`. This file is a no-op and
// should not be imported anywhere.
//
// If you see this file show up in a render, check your import paths — you
// probably meant to import the MDXRemote pipeline from the theory page.

interface TheoryContentRendererProps {
  content: string;
}

export default function TheoryContentRenderer(_: TheoryContentRendererProps) {
  return null;
}
