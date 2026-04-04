import { clientTool, type ClientEventsFrom } from '@runwayml/avatars-react/api';
import type { RealtimeSessionCreateParams } from '@runwayml/sdk/resources/realtime-sessions';

// Ghost roasts the user's outfit
export const styleRoast = clientTool('style_roast', {
  description: 'Display a style critique card with the ghost\'s roast of the user\'s current outfit. ALWAYS use this when commenting on what you see.',
  args: {} as { roast: string; rating: number; emoji: string },
});

// Ghost suggests a new look -- triggers gen4_image
export const generateLook = clientTool('generate_look', {
  description: 'Generate a new style image for the user using AI image generation. Use this when suggesting a specific new style. Include a vivid, detailed prompt describing the complete outfit on a person.',
  args: {} as { style: string; prompt: string; description: string },
});

// Ghost reacts dramatically
export const ghostReaction = clientTool('ghost_reaction', {
  description: 'Show a dramatic ghost reaction overlay. Use for big emotional moments -- horror at bad outfits, delight at good ones.',
  args: {} as { reaction: 'horror' | 'approval' | 'intrigued' | 'disgusted' | 'impressed'; message: string },
});

export type GhostEvent = ClientEventsFrom<[typeof styleRoast, typeof generateLook, typeof ghostReaction]>;

// Tools formatted for session creation API
export const ghostTools: RealtimeSessionCreateParams['tools'] = [
  {
    ...styleRoast,
    parameters: [
      { name: 'roast', type: 'string', description: 'The ghost\'s witty critique of the outfit' },
      { name: 'rating', type: 'number', description: 'Style rating 1-10' },
      { name: 'emoji', type: 'string', description: 'A single emoji that captures the ghost\'s feeling' },
    ],
  },
  {
    ...generateLook,
    parameters: [
      { name: 'style', type: 'string', description: 'Short style name like "Street-luxe Tokyo" or "1970s Rockstar"' },
      { name: 'prompt', type: 'string', description: 'Detailed image generation prompt: a full description of the outfit on a stylish person, including clothing items, colors, accessories, setting, and mood' },
      { name: 'description', type: 'string', description: 'Brief description for the UI card' },
    ],
  },
  {
    ...ghostReaction,
    parameters: [
      { name: 'reaction', type: 'string', description: 'One of: horror, approval, intrigued, disgusted, impressed' },
      { name: 'message', type: 'string', description: 'A short dramatic message for the overlay' },
    ],
  },
];
