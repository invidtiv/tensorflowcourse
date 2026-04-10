"use client";

import { useState } from "react";

interface VideoEmbedProps {
  videoId: string;
  title?: string;
}

export default function VideoEmbed({ videoId, title = "Video" }: VideoEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className="my-6 rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="relative aspect-video bg-surface-1">
        {!loaded ? (
          <button
            className="absolute inset-0 w-full h-full flex items-center justify-center group cursor-pointer"
            onClick={() => setLoaded(true)}
            aria-label={`Play ${title}`}
            style={{
              backgroundImage: `url(${thumbnailUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-bg-primary/40" />
            <div className="relative w-16 h-16 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center group-hover:bg-neon-cyan/30 group-hover:scale-110 transition-all">
              <svg className="w-7 h-7 text-neon-cyan ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        )}
      </div>
      {title && (
        <div className="px-4 py-2.5 bg-surface-1/50 border-t border-white/[0.06]">
          <span className="text-sm text-text-secondary">{title}</span>
        </div>
      )}
    </div>
  );
}
