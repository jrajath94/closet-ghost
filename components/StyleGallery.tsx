'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface GeneratedLook {
  id: string;
  style: string;
  description: string;
  imageUrl?: string;
  status: 'generating' | 'ready' | 'failed';
}

interface StyleGalleryProps {
  looks: GeneratedLook[];
}

export function StyleGallery({ looks }: StyleGalleryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (looks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
        <div className="w-8 h-8 border border-zinc-800 rounded-full flex items-center justify-center mb-3">
          <div className="w-2 h-2 bg-zinc-700 rounded-full" style={{ animation: 'pulse-subtle 2s ease-in-out infinite' }} />
        </div>
        <p className="text-zinc-500 text-[11px] leading-relaxed">
          The Ghost will generate<br />style transformations here
        </p>
      </div>
    );
  }

  const expanded = looks.find(l => l.id === expandedId);

  return (
    <>
      {/* Lightbox overlay */}
      {expanded && expanded.status === 'ready' && expanded.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setExpandedId(null)}
        >
          <div className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="relative aspect-square w-full">
              <Image
                src={expanded.imageUrl}
                alt={expanded.style}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-white text-sm font-medium tracking-wide">{expanded.style}</p>
              <p className="text-zinc-500 text-xs mt-1">{expanded.description}</p>
              <button
                onClick={() => setExpandedId(null)}
                className="mt-4 text-zinc-600 text-[10px] uppercase tracking-[0.2em] hover:text-zinc-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery grid */}
      <div className="flex flex-col gap-3 overflow-y-auto h-full">
        {looks.map((look, i) => (
          <div
            key={look.id}
            className="group"
            style={{ animation: `fadeIn 0.3s ease-out ${i * 0.1}s both` }}
          >
            {look.status === 'generating' ? (
              <div className="border border-zinc-800/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 border border-zinc-700 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-zinc-300 text-xs font-medium truncate">{look.style}</p>
                    <p className="text-zinc-600 text-[10px] mt-0.5">Generating image...</p>
                  </div>
                </div>
              </div>
            ) : look.status === 'ready' && look.imageUrl ? (
              <button
                onClick={() => setExpandedId(look.id)}
                className="w-full text-left border border-zinc-800/60 hover:border-zinc-700 transition-colors duration-200 overflow-hidden"
              >
                <div className="relative aspect-[4/3] bg-zinc-900">
                  <Image
                    src={look.imageUrl}
                    alt={look.style}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs font-medium">{look.style}</p>
                    <p className="text-zinc-400 text-[10px] mt-0.5 line-clamp-1">{look.description}</p>
                  </div>
                </div>
              </button>
            ) : (
              <div className="border border-zinc-800/30 p-3">
                <p className="text-zinc-700 text-[10px]">{look.style} — generation failed</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
