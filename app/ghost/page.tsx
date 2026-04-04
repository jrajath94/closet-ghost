'use client';

import { useState, Suspense } from 'react';
import { GhostExperience } from '@/components/GhostExperience';

const AVATAR_ID = process.env.NEXT_PUBLIC_AVATAR_ID || '';

export default function GhostPage() {
  const [session, setSession] = useState<{
    sessionId: string;
    sessionKey: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSummon() {
    setIsConnecting(true);
    setError(null);
    try {
      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId: AVATAR_ID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      setSession(data);
    } catch (err) {
      console.error('Failed to connect:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnecting(false);
    }
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-8">
            Style Session
          </p>
          <h1 className="text-3xl font-light text-white mb-3 tracking-tight">
            The Closet Ghost
          </h1>
          <p className="text-zinc-500 text-sm mb-10 leading-relaxed">
            Enable your webcam. The ghost will assess your outfit
            and suggest transformations.
          </p>
          {error && (
            <p className="text-red-400/80 text-xs mb-6 border border-red-900/30 p-3">
              {error}
            </p>
          )}
          <button
            onClick={handleSummon}
            disabled={isConnecting}
            className="
              bg-white text-black px-8 py-3 text-sm font-medium
              tracking-wide uppercase
              hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500
              transition-colors duration-200
              disabled:cursor-not-allowed
            "
          >
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border border-zinc-500 border-t-transparent rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              'Start Session'
            )}
          </button>
        </div>
      </main>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <p className="text-zinc-500 text-sm animate-pulse">Connecting...</p>
      </div>
    }>
      <GhostExperience
        session={session}
        avatarId={AVATAR_ID}
        onEnd={() => {
          setSession(null);
          setIsConnecting(false);
        }}
      />
    </Suspense>
  );
}
