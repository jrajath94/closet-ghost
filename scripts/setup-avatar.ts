/**
 * Setup Script: Creates the Closet Ghost avatar programmatically via Runway SDK.
 *
 * Usage:
 *   1. Add your RUNWAY_API_KEY to .env.local
 *   2. Place your ghost image at public/ghost-avatar.png (from Nano Banana)
 *   3. Run: npx tsx scripts/setup-avatar.ts
 *
 * The script will:
 *   - Upload the image to Runway
 *   - Create the avatar with personality, voice, and start script
 *   - Output the AVATAR_ID to add to .env.local
 */

import RunwayML from '@runwayml/sdk';
import * as fs from 'fs';
import * as path from 'path';

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

async function main() {
  // Load env
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const [key, ...rest] = line.split('=');
      if (key && rest.length > 0) {
        process.env[key.trim()] = rest.join('=').trim();
      }
    }
  }

  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) {
    console.error('ERROR: Set RUNWAY_API_KEY in .env.local first');
    process.exit(1);
  }

  const client = new RunwayML({ apiKey });

  // Step 1: Upload ghost image
  const imagePath = path.resolve(__dirname, '..', 'public', 'ghost-avatar.png');
  if (!fs.existsSync(imagePath)) {
    console.error('ERROR: Place your ghost image at public/ghost-avatar.png');
    console.error('Create it in Nano Banana using this prompt:\n');
    console.error(`"A stylish cartoon ghost character portrait, front-facing, centered.
The ghost is an elegant Parisian couturier spirit with a translucent pale lavender body,
wearing a flowing spectral cape with high collar, a monocle over one eye, and a tiny
beret tilted at a rakish angle. Expressive dramatic eyes, arched judging eyebrows,
sly smirk. One ghostly hand raised with pointed finger as if critiquing. Tim Burton
whimsy meets high fashion illustration. Purple and silver tones, ethereal glow.
Dark background, face clearly centered."`);
    process.exit(1);
  }

  console.log('Uploading ghost image...');
  const imageFile = fs.readFileSync(imagePath);
  const blob = new Blob([imageFile], { type: 'image/png' });
  const file = new File([blob], 'ghost-avatar.png', { type: 'image/png' });

  const upload = await client.uploads.createEphemeral({ file });
  console.log(`Image uploaded: ${upload.uri}`);

  // Step 2: Create avatar
  console.log('Creating avatar...');
  const avatar = await client.avatars.create({
    name: 'The Closet Ghost',
    personality: GHOST_PERSONALITY,
    referenceImage: upload.uri,
    voice: { type: 'runway-live-preset', presetId: 'victoria' },
    startScript: GHOST_START_SCRIPT,
    imageProcessing: 'optimize',
  });

  console.log(`\nAvatar created! ID: ${avatar.id}`);
  console.log(`Status: ${avatar.status}`);

  // Step 3: Poll until ready
  console.log('Waiting for avatar to be ready...');
  let status = avatar;
  while (status.status === 'PROCESSING') {
    await new Promise(r => setTimeout(r, 2000));
    status = await client.avatars.retrieve(avatar.id) as typeof avatar;
    process.stdout.write('.');
  }

  if (status.status === 'READY') {
    console.log('\nAvatar is READY!');
    console.log(`\nAdd this to your .env.local:`);
    console.log(`NEXT_PUBLIC_AVATAR_ID=${avatar.id}`);

    // Auto-update .env.local
    let envContent = fs.readFileSync(envPath, 'utf-8');
    envContent = envContent.replace(
      /^NEXT_PUBLIC_AVATAR_ID=.*$/m,
      `NEXT_PUBLIC_AVATAR_ID=${avatar.id}`,
    );
    fs.writeFileSync(envPath, envContent);
    console.log('\n.env.local updated automatically!');
  } else {
    console.error(`\nAvatar creation failed with status: ${status.status}`);
    if ('failure' in status) {
      console.error(`Failure: ${(status as { failure: string }).failure}`);
    }
  }
}

main().catch(console.error);
