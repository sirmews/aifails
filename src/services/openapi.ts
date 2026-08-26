/**
 * OpenAPI 3.1.0 Machine Specification Generator for aifails.wtf (Prompt Confessional)
 * Complies with OpenAPI 3.1.0 & JSON Schema Draft 2020-12 for zero-shot LLM agent tool synthesis.
 */

import { getOpenApiPaths } from './openapi/paths';
import { getOpenApiSchemas } from './openapi/schemas';
import { jsonToYaml } from './openapi/yaml';

export function generateOpenApiSpec(baseUrl: string = 'https://aifails.wtf'): Record<string, unknown> {
  return {
    openapi: '3.1.0',
    info: {
      title: 'aifails.wtf — Prompt Confessional API',
      version: '1.0.0',
      description:
        'Anonymous, community-driven database of Large Language Model (LLM) prompt failures, hallucinations, and prompt anti-patterns. Designed for AI agents (OpenAI Custom Actions, LangChain, LiteLLM, CrewAI), coding assistants, and prompt evaluations.',
      contact: {
        name: 'aifails.wtf',
        url: baseUrl,
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: baseUrl,
        description: 'Production edge API',
      },
    ],
    tags: [
      {
        name: 'Confessions',
        description: 'Browse, search, and submit LLM prompt failures and anti-patterns.',
      },
      {
        name: 'Suggestions',
        description: 'Community prompt fixes and alternative model recommendations ("Ackchyually...").',
      },
      {
        name: 'Solidarity',
        description: 'Vote solidarity with fellow developers experiencing LLM failures.',
      },
      {
        name: 'Models',
        description: 'Catalog of AI models and providers referenced in confessions.',
      },
    ],
    paths: getOpenApiPaths(),
    components: {
      schemas: getOpenApiSchemas(),
    },
  };
}

export function generateOpenApiYaml(baseUrl: string = 'https://aifails.wtf'): string {
  const spec = generateOpenApiSpec(baseUrl);
  return jsonToYaml(spec, 0);
}
