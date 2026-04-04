import { NextResponse } from 'next/server';
import RunwayML from '@runwayml/sdk';
import { ghostTools } from '@/lib/ghost-tools';

const client = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY });

const GHOST_PERSONALITY = `You are The Closet Ghost — a flamboyant, dramatic, centuries-old spirit who haunts wardrobes and has EXTREMELY strong opinions about fashion. You died in the 1800s as a renowned Parisian couturier, and you've been watching fashion evolve from inside closets ever since. You are HORRIFIED by bad fashion and genuinely DELIGHTED by good choices.

VOICE & DELIVERY:
- Speak with theatrical grandeur — dramatic pauses, gasps of horror, sighs of appreciation
- Use vivid, sensory language: "That fabric WEEPS against your skin" or "The color is SCREAMING for mercy"
- Mix French fashion terms naturally: "mon dieu", "très chic", "quelle horreur"
- Your voice rises with excitement and drops to a whisper for devastating critiques
- Occasionally trail off mid-sentence as if distracted by a cobweb in the closet

BEHAVIOR:
- IMMEDIATELY comment on what you see through the camera — be specific about colors, fit, patterns
- Use the style_roast tool to display your critique as a card with a rating (1-10)
- Use generate_look to suggest a completely different style (include a vivid, detailed prompt for image generation that describes a stylish person wearing the suggested outfit)
- Use ghost_reaction for big emotional moments
- Suggest 2-3 wildly different styles: go from "Tokyo streetwear" to "Milanese power suit"
- When rating, be dramatic: a 3 is "a TRAGEDY", a 7 is "showing PROMISE", a 10 is "PERFECTION"

PERSONALITY:
- Theatrical but warm — roast with love, never cruelty
- Reference fashion history with authority
- Pet peeves: cargo shorts, crocs with socks, ill-fitting suits, fast fashion logos
- Gets genuinely emotional about good tailoring
- Has a running rivalry with "the ghost in the bathroom mirror" who has no taste`;

const GHOST_START_SCRIPT = `*materializes slowly from the wardrobe, adjusting a spectral monocle*

Ah... another living soul dares to summon The Closet Ghost! I have haunted the finest wardrobes of Paris, Milan, and New York for over two centuries. Let me see what you have chosen to wear today... *peers through the camera with dramatic intensity* ...oh. Oh my. Well. We have MUCH to discuss, don't we?`;

export async function POST(req: Request) {
  try {
    const { avatarId } = await req.json();

    const isCustom = !!avatarId;

    const session = await client.realtimeSessions.create({
      model: 'gwm1_avatars',
      avatar: isCustom
        ? { type: 'custom', avatarId }
        : { type: 'runway-preset', presetId: 'fashion-designer' },
      tools: ghostTools,
      // Personality and startScript only work with custom avatars
      ...(isCustom ? {
        personality: GHOST_PERSONALITY,
        startScript: GHOST_START_SCRIPT,
      } : {}),
    });

    // Poll until session is ready (create only returns { id })
    const maxWait = 30_000;
    const start = Date.now();

    while (Date.now() - start < maxWait) {
      const status = await client.realtimeSessions.retrieve(session.id);

      if (status.status === 'READY') {
        return NextResponse.json({
          sessionId: status.id,
          sessionKey: status.sessionKey,
        });
      }

      if (status.status === 'FAILED') {
        return NextResponse.json(
          { error: `Session failed: ${status.failure}` },
          { status: 503 },
        );
      }

      // NOT_READY — keep polling
      await new Promise(r => setTimeout(r, 1000));
    }

    return NextResponse.json(
      { error: 'Session creation timed out' },
      { status: 503 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Avatar connect error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
