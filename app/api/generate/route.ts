import { NextResponse } from 'next/server';
import { runwayApiRequest } from '@/lib/runway-api';

interface GenerateRequest {
  prompt: string;
  referenceImage?: string; // base64 data URI
}

interface TaskResponse {
  id: string;
  status: string;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const { prompt, referenceImage } = (await req.json()) as GenerateRequest;

    const body: Record<string, unknown> = {
      model: 'gen4_image_turbo',
      promptText: referenceImage
        ? `IMG_1 reimagined as: ${prompt}`
        : prompt,
      ratio: '1080:1080',
      ...(referenceImage ? {
        referenceImages: [{ uri: referenceImage }],
      } : {}),
    };

    const task = await runwayApiRequest<TaskResponse>('/v1/text_to_image', {
      method: 'POST',
      body,
      apiKey,
    });

    return NextResponse.json({ taskId: task.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Generate error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
