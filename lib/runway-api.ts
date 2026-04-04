const RUNWAY_BASE_URL = 'https://api.dev.runwayml.com';
const RUNWAY_API_VERSION = '2024-11-06';

export async function runwayApiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    apiKey: string;
  },
): Promise<T> {
  const { method = 'GET', body, apiKey } = options;

  const res = await fetch(`${RUNWAY_BASE_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'X-Runway-Version': RUNWAY_API_VERSION,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return {} as T;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Runway API error: ${res.status}`);
  }
  return data as T;
}
