import { NextResponse } from 'next/server';
import { runwayApiRequest } from '@/lib/runway-api';

interface TaskResult {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  output?: string[];
  failure?: string;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const task = await runwayApiRequest<TaskResult>(`/v1/tasks/${id}`, {
      apiKey,
    });

    return NextResponse.json(task);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
