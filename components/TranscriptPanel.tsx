'use client';

import { useRef, useEffect } from 'react';

interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
}

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
}

export function TranscriptPanel({ entries }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="bg-black/70 backdrop-blur-sm p-3 max-h-28 overflow-y-auto border-t border-zinc-800/50"
    >
      {entries.slice(-5).map((entry) => (
        <p key={entry.id} className="text-[11px] mb-1 last:mb-0">
          <span className={`font-medium ${entry.speaker === 'ghost' ? 'text-zinc-300' : 'text-zinc-500'}`}>
            {entry.speaker === 'ghost' ? 'Ghost' : 'You'}:
          </span>{' '}
          <span className="text-zinc-400">{entry.text}</span>
        </p>
      ))}
    </div>
  );
}
