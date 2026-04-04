'use client';

import { useState, useEffect } from 'react';

interface RoastCardProps {
  roast: string;
  rating: number;
  emoji: string;
}

export function RoastCard({ roast, rating }: RoastCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const ratingLabel =
    rating <= 2 ? 'Catastrophic'
    : rating <= 4 ? 'Concerning'
    : rating <= 6 ? 'Passable'
    : rating <= 8 ? 'Commendable'
    : 'Exquisite';

  const barColor =
    rating <= 3 ? 'bg-red-500/70'
    : rating <= 5 ? 'bg-amber-500/60'
    : rating <= 7 ? 'bg-zinc-400'
    : 'bg-emerald-500/70';

  return (
    <div
      className={`
        border-l-2 pl-3 py-3 pr-1
        transition-all duration-300 ease-out
        ${rating <= 3 ? 'border-l-red-500/40' : rating <= 5 ? 'border-l-amber-500/30' : rating <= 7 ? 'border-l-zinc-600' : 'border-l-emerald-500/40'}
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
      `}
    >
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">{ratingLabel}</span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-base font-light text-white tabular-nums">{rating}</span>
          <span className="text-zinc-700 text-[10px]">/10</span>
        </div>
      </div>
      <p className="text-zinc-400 text-[12px] leading-[1.6]">{roast}</p>
      <div className="mt-2.5 h-[2px] bg-zinc-900 relative overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-1000 ease-out`}
          style={{ width: `${rating * 10}%` }}
        />
      </div>
    </div>
  );
}
