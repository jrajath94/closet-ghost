'use client';

import { useState, useCallback, useRef } from 'react';
import {
  AvatarCall,
  AvatarVideo,
  UserVideo,
  ControlBar,
  useClientEvent,
  useTranscription,
} from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';
import type { GhostEvent } from '@/lib/ghost-tools';
import { captureWebcamFrame } from '@/lib/webcam-capture';
import { RoastCard } from './RoastCard';
import { StyleGallery, type GeneratedLook } from './StyleGallery';
import { GhostReactionOverlay } from './GhostReactionOverlay';
import { TranscriptPanel } from './TranscriptPanel';

type StyleRoastArgs = Extract<GhostEvent, { tool: 'style_roast' }>['args'];
type GenerateLookArgs = Extract<GhostEvent, { tool: 'generate_look' }>['args'];
type GhostReactionArgs = Extract<GhostEvent, { tool: 'ghost_reaction' }>['args'];

interface GhostExperienceProps {
  session: { sessionId: string; sessionKey: string };
  avatarId: string;
  onEnd: () => void;
}

export function GhostExperience({ session, avatarId, onEnd }: GhostExperienceProps) {
  const [roasts, setRoasts] = useState<Array<StyleRoastArgs & { id: number }>>([]);
  const [looks, setLooks] = useState<GeneratedLook[]>([]);
  const [reaction, setReaction] = useState<GhostReactionArgs | null>(null);
  const [transcripts, setTranscripts] = useState<Array<{ id: string; speaker: string; text: string }>>([]);
  const [activeTab, setActiveTab] = useState<'verdicts' | 'looks'>('verdicts');
  const nextId = useRef(0);

  const handleRoast = useCallback((args: StyleRoastArgs) => {
    setRoasts(prev => [...prev, { ...args, id: nextId.current++ }]);
    setActiveTab('verdicts');
  }, []);

  const handleGenerateLook = useCallback(async (args: GenerateLookArgs) => {
    const lookId = `look-${nextId.current++}`;
    const newLook: GeneratedLook = {
      id: lookId,
      style: args.style,
      description: args.description,
      status: 'generating',
    };
    setLooks(prev => [...prev, newLook]);
    setActiveTab('looks');

    try {
      const referenceImage = captureWebcamFrame();

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: args.prompt, referenceImage }),
      });
      const { taskId, error } = await res.json();
      if (error) throw new Error(error);

      let attempts = 0;
      while (attempts < 60) {
        await new Promise(r => setTimeout(r, 2500));
        const taskRes = await fetch(`/api/tasks/${taskId}`);
        const task = await taskRes.json();

        if (task.status === 'SUCCEEDED' && task.output?.[0]) {
          setLooks(prev =>
            prev.map(l => l.id === lookId ? { ...l, status: 'ready' as const, imageUrl: task.output[0] } : l)
          );
          return;
        }
        if (task.status === 'FAILED') throw new Error(task.failure || 'Generation failed');
        attempts++;
      }
      throw new Error('Generation timed out');
    } catch (err) {
      console.error('Look generation failed:', err);
      setLooks(prev =>
        prev.map(l => l.id === lookId ? { ...l, status: 'failed' as const } : l)
      );
    }
  }, []);

  const handleReaction = useCallback((args: GhostReactionArgs) => {
    setReaction(args);
    setTimeout(() => setReaction(null), 4000);
  }, []);

  const handleTranscript = useCallback((entry: { participantIdentity: string; text: string }) => {
    setTranscripts(prev => [
      ...prev.slice(-20),
      {
        id: `t-${nextId.current++}`,
        speaker: entry.participantIdentity.includes('avatar') ? 'ghost' : 'you',
        text: entry.text,
      },
    ]);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#09090b]">
      {/* Main Stage */}
      <div className="flex-1 relative min-w-0">
        <AvatarCall
          avatarId={avatarId}
          sessionId={session.sessionId}
          sessionKey={session.sessionKey}
          baseUrl={process.env.NEXT_PUBLIC_RUNWAYML_BASE_URL}
          onEnd={onEnd}
          onError={(err) => console.error('Avatar error:', err)}
        >
          <div className="absolute inset-0 bg-black">
            <AvatarVideo className="w-full h-full object-cover" />

            {/* User webcam pip — bottom left, above controls */}
            <div className="absolute bottom-16 left-4 w-48 h-36 overflow-hidden border border-zinc-700/60 bg-zinc-900 z-10">
              <UserVideo className="w-full h-full object-cover" />
            </div>
          </div>

          <GhostEventHandlers
            onRoast={handleRoast}
            onGenerateLook={handleGenerateLook}
            onReaction={handleReaction}
            onTranscript={handleTranscript}
          />

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-center z-20">
            <div className="bg-black/80 backdrop-blur-sm px-4 py-2 border border-zinc-800/60">
              <ControlBar />
            </div>
          </div>
        </AvatarCall>

        {/* Transcript */}
        <div className="absolute bottom-14 left-0 right-0 z-10">
          <TranscriptPanel entries={transcripts} />
        </div>

        {/* Reaction overlay */}
        {reaction && (
          <GhostReactionOverlay reaction={reaction.reaction} message={reaction.message} />
        )}
      </div>

      {/* Right Sidebar — tabbed */}
      <div className="w-80 border-l border-zinc-800/40 flex flex-col bg-[#0b0b0d]">
        {/* Tab header */}
        <div className="flex border-b border-zinc-800/40">
          <button
            onClick={() => setActiveTab('verdicts')}
            className={`flex-1 py-3 text-[10px] uppercase tracking-[0.25em] text-center transition-colors relative ${
              activeTab === 'verdicts' ? 'text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            Verdicts
            {roasts.length > 0 && (
              <span className="ml-1.5 text-zinc-500">{roasts.length}</span>
            )}
            {activeTab === 'verdicts' && (
              <span className="absolute bottom-0 left-4 right-4 h-px bg-zinc-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('looks')}
            className={`flex-1 py-3 text-[10px] uppercase tracking-[0.25em] text-center transition-colors relative ${
              activeTab === 'looks' ? 'text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            Looks
            {looks.length > 0 && (
              <span className="ml-1.5 text-zinc-500">{looks.length}</span>
            )}
            {activeTab === 'looks' && (
              <span className="absolute bottom-0 left-4 right-4 h-px bg-zinc-400" />
            )}
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-3">
          {activeTab === 'verdicts' ? (
            <div className="space-y-2">
              {roasts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-8 h-8 border border-zinc-800 rounded-full flex items-center justify-center mb-3">
                    <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full" style={{ animation: 'pulse-subtle 2s ease-in-out infinite' }} />
                  </div>
                  <p className="text-zinc-600 text-[11px]">Awaiting judgment...</p>
                </div>
              ) : (
                roasts.map((roast) => (
                  <RoastCard key={roast.id} roast={roast.roast} rating={roast.rating} emoji={roast.emoji} />
                ))
              )}
            </div>
          ) : (
            <StyleGallery looks={looks} />
          )}
        </div>

        {/* Session info footer */}
        <div className="border-t border-zinc-800/40 px-3 py-2 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-700">Session Active</span>
          <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function GhostEventHandlers(props: {
  onRoast: (args: StyleRoastArgs) => void;
  onGenerateLook: (args: GenerateLookArgs) => void;
  onReaction: (args: GhostReactionArgs) => void;
  onTranscript: (entry: { participantIdentity: string; text: string }) => void;
}) {
  useClientEvent<GhostEvent, 'style_roast'>('style_roast', props.onRoast);
  useClientEvent<GhostEvent, 'generate_look'>('generate_look', props.onGenerateLook);
  useClientEvent<GhostEvent, 'ghost_reaction'>('ghost_reaction', props.onReaction);
  useTranscription(props.onTranscript);
  return null;
}
