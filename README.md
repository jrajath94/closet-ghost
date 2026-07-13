# The Closet Ghost

**A real-time AI fashion critic that sees you, judges you, and reimagines your entire style.**

Built for [Runway Hackathon NYC](https://runwayml.com/) — March 31, 2025

---

## What It Does

The Closet Ghost is an interactive web experience where a centuries-old Parisian fashion spirit materializes through your screen, observes your outfit via webcam, and delivers brutally honest (but warmly theatrical) style critiques in real time.

It doesn't stop at critique. The ghost generates AI-reimagined versions of your look — transforming you into everything from Tokyo streetwear to 1970s rock revival — using Runway's image generation pipeline.

**Core loop:** See your outfit. Judge it. Transform it.

## How It Works

The app combines two Runway APIs in a real-time feedback loop:

1. **Character API (GWM-1 Avatars)** — Powers the live ghost character. The ghost sees the user's webcam feed, maintains a theatrical personality, and triggers structured UI events (style verdicts, image generation requests, dramatic reactions) through tool calling.

2. **gen4_image API** — When the ghost suggests a new style, it captures a frame from the user's webcam and sends it as a reference image to gen4_image, generating a reimagined look in the suggested style. The result appears in a sidebar gallery.

The two APIs create a closed loop: the character *sees* you, *critiques* you, and *transforms* you — all in a single conversational session.

### Architecture

```
Browser (Next.js client)
  |
  +-- AvatarCall (WebRTC via LiveKit)
  |   +-- AvatarVideo         Ghost character stream
  |   +-- UserVideo            Webcam feed (ghost sees this)
  |   +-- Client Event Handlers
  |       +-- style_roast      Verdict cards in sidebar
  |       +-- generate_look    Triggers gen4_image pipeline
  |       +-- ghost_reaction   Full-screen reaction overlay
  |
  +-- API Routes (Next.js server)
      +-- /api/avatar/connect  Session creation + polling
      +-- /api/generate        gen4_image task creation
      +-- /api/tasks/[id]      Task status polling
```

### Client Event Tools

The ghost character has three tools it can invoke during conversation:

| Tool | Purpose | UI Effect |
|------|---------|-----------|
| `style_roast` | Deliver a rated critique (1-10) | Verdict card appears in sidebar |
| `generate_look` | Suggest a new style + trigger image gen | Image generation starts, result appears in gallery |
| `ghost_reaction` | Express a dramatic emotional reaction | Full-screen overlay (Appalled / Impressed / etc.) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.2, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Avatar SDK | `@runwayml/avatars-react` (WebRTC via LiveKit) |
| Server SDK | `@runwayml/sdk` (session management, image generation) |
| Character Model | GWM-1 Avatars (real-time) |
| Image Model | gen4_image_turbo |
| Knowledge Base | fashion-knowledge.md (fashion expertise, style archetypes) |

## Character Design

**The Closet Ghost** is a centuries-old Parisian couturier who died in the 1800s and has been haunting wardrobes ever since. The character was designed with:

- **Personality prompt** defining theatrical delivery, French fashion vocabulary, specific critique patterns, and tool-calling behavior
- **Knowledge base** covering 8 style archetypes with full outfit descriptions, color theory, fit principles, fabric guides, fashion history, and brand references
- **Voice** set to the Victoria preset for a firm, professional tone that gives authority to the roasts
- **Visual design** as a stylized ghost with monocle, beret, and Victorian cape, created in Nano Banana and processed by Runway's avatar pipeline

The personality is designed to be adversarial but warm. The ghost roasts with love, references fashion history with authority, and gets genuinely emotional about good tailoring.

## Setup

```bash
# Clone
git clone https://github.com/jrajath94/closet-ghost.git
cd closet-ghost

# Install
npm install

# Configure
cp .env.local.example .env.local
# Add your Runway API key and avatar ID

# Run
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|------------|
| `RUNWAY_API_KEY` | Your Runway API secret (starts with `key_`) |
| `NEXT_PUBLIC_AVATAR_ID` | Your custom avatar UUID from Runway Developer Portal |
| `NEXT_PUBLIC_RUNWAYML_BASE_URL` | `https://api.dev.runwayml.com` |

### Creating Your Own Avatar

```bash
# Automated setup (uploads image + creates avatar)
npx tsx scripts/setup-avatar.ts
```

Or manually via the [Runway Developer Portal](https://dev.runwayml.com/).

## Project Structure

```
closet-ghost/
  app/
    page.tsx                     Landing page
    ghost/page.tsx               Ghost experience (session + avatar)
    api/
      avatar/connect/route.ts    Session creation with personality + tools
      generate/route.ts          gen4_image task creation
      tasks/[id]/route.ts        Generation task polling
  components/
    GhostExperience.tsx          Main composition (avatar + sidebar + overlays)
    RoastCard.tsx                Style verdict display
    StyleGallery.tsx             Generated looks gallery with lightbox
    GhostReactionOverlay.tsx     Dramatic reaction overlay
    TranscriptPanel.tsx          Live conversation transcript
  lib/
    ghost-tools.ts               Client event tool definitions
    runway-api.ts                Runway REST API client
    webcam-capture.ts            Webcam frame capture for gen4_image
  knowledge/
    fashion-knowledge.md         Fashion expertise document
  scripts/
    setup-avatar.ts              Automated avatar creation script
```

## API Usage

This project uses Runway's Character API and image generation APIs. Refer to [Runway's pricing documentation](https://runwayml.com/pricing) for current cost details.

## Acknowledgments

- [Runway](https://runwayml.com/) for the Character API, gen4_image, and GWM-1
- [Runway Avatars React SDK](https://github.com/runwayml/avatars-sdk-react) for WebRTC components and hooks
- Character image created with [Nano Banana](https://nanobanana.com/)

## License

MIT
