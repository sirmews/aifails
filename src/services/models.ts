import type { ModelOption } from '../core/types';

const KV_MODELS_KEY = 'openrouter_models_v1';
const CACHE_TTL_SECONDS = 86400; // 24 hours

export async function getModels(kv?: KVNamespace): Promise<ModelOption[]> {
  // 1. Try reading from Cloudflare KV if binding is available
  if (kv) {
    try {
      const cached = await kv.get<ModelOption[]>(KV_MODELS_KEY, 'json');
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached;
      }
    } catch {
      // Ignore KV errors and fallback to fetch
    }
  }

  // 2. Fetch fresh models from OpenRouter API with a 3-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`OpenRouter API returned status ${res.status}`);
    }

    const raw = (await res.json()) as {
      data?: Array<{ id: string; name: string }>;
    };

    const models: ModelOption[] = (raw.data ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      provider: m.id.includes('/') ? m.id.split('/')[0] : 'Unknown',
    }));

    // 3. Store in Cloudflare KV for 24h in background
    if (kv && models.length > 0) {
      try {
        await kv.put(KV_MODELS_KEY, JSON.stringify(models), {
          expirationTtl: CACHE_TTL_SECONDS,
        });
      } catch {
        // Ignore KV write failure
      }
    }

    return models;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Failed to fetch models from OpenRouter:', err);
    return [];
  }
}
