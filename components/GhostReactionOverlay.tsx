'use client';

import { useState, useEffect } from 'react';

interface GhostReactionOverlayProps {
  reaction: 'horror' | 'approval' | 'intrigued' | 'disgusted' | 'impressed';
  message: string;
}

const REACTION_LABELS: Record<string, string> = {
  horror: 'Appalled',
  approval: 'Approved',
  intrigued: 'Intrigued',
  disgusted: 'Dismayed',
  impressed: 'Impressed',
};

export function GhostReactionOverlay({ reaction, message }: GhostReactionOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => setExiting(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center pointer-events-none
        transition-opacity duration-500
        ${visible && !exiting ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <div
        className={`
          bg-black/80 backdrop-blur-sm border border-zinc-700
          px-10 py-6 text-center
          transition-all duration-500
          ${visible && !exiting ? 'scale-100' : 'scale-95'}
        `}
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">
          {REACTION_LABELS[reaction] || reaction}
        </p>
        <p className="text-white text-base font-light max-w-xs">{message}</p>
      </div>
    </div>
  );
}
