"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ImageZoomProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  className?: string;
}

export default function ImageZoom({
  src,
  alt,
  width = 800,
  height = 600,
  caption,
  className = "",
}: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <figure className={`my-6 ${className}`}>
        <div
          className="relative cursor-zoom-in rounded-lg overflow-hidden border border-white/[0.08] hover:border-neon-cyan/30 transition-colors group"
          onClick={() => setIsZoomed(true)}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-auto"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white/0 group-hover:text-white/70 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
        {caption && (
          <figcaption className="mt-2 text-center text-sm text-text-muted italic">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox overlay */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md cursor-zoom-out p-4"
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-[90vw] max-h-[90vh]"
            >
              <Image
                src={src}
                alt={alt}
                width={width * 2}
                height={height * 2}
                className="w-auto h-auto max-w-full max-h-[90vh] rounded-lg"
              />
              {caption && (
                <p className="mt-3 text-center text-sm text-text-secondary">
                  {caption}
                </p>
              )}
            </motion.div>

            {/* Close button */}
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-surface-1/80 text-text-secondary hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
