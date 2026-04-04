import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-6">
          AI Fashion Critique
        </p>

        <h1 className="text-5xl font-light text-white mb-2 tracking-tight">
          The Closet Ghost
        </h1>

        <div className="w-12 h-px bg-zinc-700 mx-auto my-6" />

        <p className="text-zinc-400 text-base leading-relaxed mb-10">
          A centuries-old fashion spirit judges your outfit in real time,
          then reimagines your style with AI-generated looks.
        </p>

        <Link
          href="/ghost"
          className="
            inline-block bg-white text-black px-8 py-3 text-sm font-medium
            tracking-wide uppercase
            hover:bg-zinc-200 active:bg-zinc-300
            transition-colors duration-200
          "
        >
          Begin Session
        </Link>

        <div className="mt-16 grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-xs font-medium text-zinc-300 mb-1">See</p>
            <p className="text-[11px] text-zinc-600">Webcam analysis</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-zinc-300 mb-1">Judge</p>
            <p className="text-[11px] text-zinc-600">Style verdict</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-zinc-300 mb-1">Transform</p>
            <p className="text-[11px] text-zinc-600">AI reimagination</p>
          </div>
        </div>
      </div>

      <p className="absolute bottom-6 text-[10px] text-zinc-700 tracking-wider uppercase">
        Powered by Runway Character API
      </p>
    </main>
  );
}
