import type { ModelOption } from '../core/types';

const KV_MODELS_KEY = 'openrouter_models_v1';
const CACHE_TTL_SECONDS = 86400; // 24 hours in Cloudflare KV
const IN_MEMORY_CACHE_TTL_MS = 3600 * 1000; // 1 hour in isolate RAM

let memoryCache: { models: ModelOption[]; expiresAt: number } | null = null;

export async function getModels(kv?: KVNamespace): Promise<ModelOption[]> {
  // 0. Fast-path: return from in-memory RAM cache if warm (zero KV cost)
  if (memoryCache && Date.now() < memoryCache.expiresAt && memoryCache.models.length > 0) {
    return memoryCache.models;
  }

  // 1. Try reading from Cloudflare KV if binding is available
  if (kv) {
    try {
      const cached = await kv.get<ModelOption[]>(KV_MODELS_KEY, 'json');
      if (cached && Array.isArray(cached) && cached.length > 0) {
        memoryCache = { models: cached, expiresAt: Date.now() + IN_MEMORY_CACHE_TTL_MS };
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

    memoryCache = { models, expiresAt: Date.now() + IN_MEMORY_CACHE_TTL_MS };
    return models;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Failed to fetch models from OpenRouter:', err);
    return FALLBACK_MODELS;
  }
}

const FALLBACK_MODELS: ModelOption[] = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic: Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'openai/gpt-4o', name: 'OpenAI: GPT-4o', provider: 'openai' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek: R1', provider: 'deepseek' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta: Llama 3.3 70B Instruct', provider: 'meta-llama' },
  { id: 'google/gemini-pro-1.5', name: 'Google: Gemini Pro 1.5', provider: 'google' },
];
