/**
 * OpenAPI 3.1.0 Machine Specification Generator for aifails.wtf (Prompt Confessional)
 * Complies with OpenAPI 3.1.0 & JSON Schema Draft 2020-12 for zero-shot LLM agent tool synthesis.
 */

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
    paths: {
      '/api/confessions': {
        get: {
          tags: ['Confessions'],
          operationId: 'listPromptFailures',
          summary: 'List or search prompt failures',
          description:
            'Retrieve a paginated list of real-world LLM prompt failures and anti-patterns with optional keyword search, mood filter, and model filter.',
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: false,
              description: 'Keyword search term matching against prompt text or failure output.',
              schema: {
                type: 'string',
                example: 'hallucination',
              },
            },
            {
              name: 'mood',
              in: 'query',
              required: false,
              description: 'Filter confessions by user reaction mood.',
              schema: {
                type: 'string',
                enum: ['furious', 'defeated', 'bewildered', 'amused', 'numb', 'vengeful'],
                example: 'facepalm',
              },
            },
            {
              name: 'model',
              in: 'query',
              required: false,
              description: 'Filter confessions by model name or provider (e.g. "gpt-4o", "claude-3-5-sonnet").',
              schema: {
                type: 'string',
                example: 'claude-3-5-sonnet',
              },
            },
            {
              name: 'cursor',
              in: 'query',
              required: false,
              description: 'Pagination cursor from a previous response (ISO 8601 created_at timestamp).',
              schema: {
                type: 'string',
                example: '2026-08-20T12:00:00.000Z',
              },
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              description: 'Maximum number of items to return (1 to 50, default 20).',
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 50,
                default: 20,
              },
            },
          ],
          responses: {
            '200': {
              description: 'Successful list of prompt failures.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ConfessionListResponse',
                  },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Confessions'],
          operationId: 'submitPromptFailure',
          summary: 'Submit a new prompt failure',
          description:
            'Submit an anonymous prompt failure / anti-pattern. Secrets, API keys, and email addresses are automatically redacted via Gitleaks rules before persistence.',
          requestBody: {
            required: true,
            description: 'Prompt failure payload.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/NewConfessionRequest',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Confession submitted successfully.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/NewConfessionResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Invalid input or validation error.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded (max 5 submissions per minute).',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/random': {
        get: {
          tags: ['Confessions'],
          operationId: 'getRandomPromptFailure',
          summary: 'Get a random prompt failure',
          description:
            'Fetch a single random prompt failure from the database. Supports JSON response or Markdown format via Accept header or /random.md.',
          responses: {
            '200': {
              description: 'A random prompt failure.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ConfessionDetail',
                  },
                },
                'text/markdown': {
                  schema: {
                    type: 'string',
                    description: 'Human- and LLM-readable Markdown representation.',
                  },
                },
              },
            },
            '404': {
              description: 'No confessions found.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/confessions/{id}': {
        get: {
          tags: ['Confessions'],
          operationId: 'getPromptFailureById',
          summary: 'Get a prompt failure by ID',
          description:
            'Retrieve a single confession by its unique UUID. Supports content negotiation for HTML, JSON (or /confessions/{id}.json), and Markdown (or /confessions/{id}.md).',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'The unique UUID of the confession.',
              schema: {
                type: 'string',
                example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
              },
            },
          ],
          responses: {
            '200': {
              description: 'The requested confession details.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ConfessionDetail',
                  },
                },
                'text/markdown': {
                  schema: {
                    type: 'string',
                    description: 'Markdown formatted single confession.',
                  },
                },
                'text/html': {
                  schema: {
                    type: 'string',
                    description: 'Server-side rendered HTML page.',
                  },
                },
              },
            },
            '404': {
              description: 'Confession not found.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/confessions/{id}/solidarity': {
        post: {
          tags: ['Solidarity'],
          operationId: 'voteSolidarity',
          summary: 'Vote solidarity on a prompt failure',
          description:
            'Increment the solidarity count for a confession. Deduplicated per user session (1 vote per session ID).',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'The unique UUID of the confession.',
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Solidarity vote recorded.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SolidarityResponse',
                  },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/confessions/{id}/suggestions': {
        post: {
          tags: ['Suggestions'],
          operationId: 'submitPromptSuggestion',
          summary: 'Submit a prompt fix or model suggestion ("Ackchyually...")',
          description:
            'Submit an anonymous community fix, better prompt, or model recommendation for an existing prompt failure.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'The unique UUID of the confession.',
              schema: {
                type: 'string',
              },
            },
          ],
          requestBody: {
            required: true,
            description: 'Suggestion payload.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/NewSuggestionRequest',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Suggestion submitted successfully.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/NewSuggestionResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Validation error.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/models': {
        get: {
          tags: ['Models'],
          operationId: 'listCatalogModels',
          summary: 'List available AI models',
          description:
            'Retrieve the list of AI models and providers supported in the confessional model selector catalog.',
          responses: {
            '200': {
              description: 'List of supported AI models.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ModelsResponse',
                  },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Mood: {
          type: 'string',
          enum: ['furious', 'defeated', 'bewildered', 'amused', 'numb', 'vengeful'],
          description: 'Emotional reaction of the user when the LLM failed.',
          example: 'furious',
        },
        Confession: {
          type: 'object',
          required: [
            'id',
            'prompt_used',
            'what_it_did_instead',
            'how_it_made_them_feel',
            'mood',
            'solidarity_count',
            'created_at',
          ],
          properties: {
            id: {
              type: 'string',
              description: 'Unique UUID of the confession.',
              example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            },
            prompt_used: {
              type: 'string',
              description: 'The user prompt given to the LLM (secrets redacted).',
              example: 'Write a regex to validate international phone numbers.',
            },
            what_it_did_instead: {
              type: 'string',
              description: 'The unexpected, hallucinated, or broken output from the LLM.',
              example: 'Generated a regex that crashed the server with catastrophic backtracking.',
            },
            how_it_made_them_feel: {
              type: 'string',
              description: 'The author reaction or commentary.',
              example: 'Questioned my career choices at 2 AM.',
            },
            mood: {
              $ref: '#/components/schemas/Mood',
            },
            solidarity_count: {
              type: 'integer',
              description: 'Number of solidarity upvotes received.',
              example: 42,
            },
            model_provider: {
              type: ['string', 'null'],
              description: 'Model provider (e.g. "anthropic", "openai", "meta-llama").',
              example: 'anthropic',
            },
            model_name: {
              type: ['string', 'null'],
              description: 'Model name or identifier (e.g. "claude-3-5-sonnet-20241022").',
              example: 'claude-3-5-sonnet',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'ISO 8601 creation timestamp.',
              example: '2026-08-20T14:32:00.000Z',
            },
          },
        },
        ConfessionSuggestion: {
          type: 'object',
          required: ['id', 'suggestion_type', 'body', 'created_at'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique UUID of the suggestion.',
            },
            suggestion_type: {
              type: 'string',
              enum: ['prompt', 'model'],
              description: 'Whether the suggestion improves the prompt or recommends an alternative model.',
              example: 'prompt',
            },
            body: {
              type: 'string',
              description: 'The suggestion / fix text.',
              example: 'Add few-shot examples of positive and negative cases.',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'ISO 8601 creation timestamp.',
            },
          },
        },
        ConfessionDetail: {
          type: 'object',
          required: [
            'id',
            'prompt_used',
            'what_it_did_instead',
            'how_it_made_them_feel',
            'mood',
            'solidarity_count',
            'created_at',
            'url',
            'markdown_url',
            'suggestions',
          ],
          properties: {
            id: {
              type: 'string',
            },
            model_provider: {
              type: ['string', 'null'],
            },
            model_name: {
              type: ['string', 'null'],
            },
            model_display: {
              type: ['string', 'null'],
              example: 'anthropic / claude-3-5-sonnet',
            },
            prompt_used: {
              type: 'string',
            },
            what_it_did_instead: {
              type: 'string',
            },
            how_it_made_them_feel: {
              type: 'string',
            },
            mood: {
              $ref: '#/components/schemas/Mood',
            },
            solidarity_count: {
              type: 'integer',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            url: {
              type: 'string',
              format: 'uri',
              example: 'https://aifails.wtf/confessions/f47ac10b-58cc-4372-a567-0e02b2c3d479',
            },
            markdown_url: {
              type: 'string',
              format: 'uri',
              example: 'https://aifails.wtf/confessions/f47ac10b-58cc-4372-a567-0e02b2c3d479.md',
            },
            suggestions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ConfessionSuggestion',
              },
            },
          },
        },
        ConfessionListResponse: {
          type: 'object',
          required: ['confessions', 'nextCursor', 'hasMore'],
          properties: {
            confessions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Confession',
              },
            },
            nextCursor: {
              type: ['string', 'null'],
              description: 'Cursor to supply as the "cursor" query parameter for the next page.',
            },
            hasMore: {
              type: 'boolean',
              description: 'Whether additional pages are available.',
            },
          },
        },
        NewConfessionRequest: {
          type: 'object',
          required: ['prompt_used', 'what_it_did_instead', 'how_it_made_them_feel'],
          properties: {
            prompt_used: {
              type: 'string',
              minLength: 1,
              maxLength: 4000,
              description: 'The exact prompt given to the AI model.',
            },
            what_it_did_instead: {
              type: 'string',
              minLength: 1,
              maxLength: 4000,
              description: 'The failure output or hallucination generated by the AI.',
            },
            how_it_made_them_feel: {
              type: 'string',
              minLength: 1,
              maxLength: 2000,
              description: 'The human commentary or emotional reaction.',
            },
            mood: {
              $ref: '#/components/schemas/Mood',
              default: 'furious',
            },
            model_provider: {
              type: 'string',
              description: 'Provider name (e.g. "openai", "anthropic", "google").',
              example: 'anthropic',
            },
            model_name: {
              type: 'string',
              description: 'Model name (e.g. "claude-3-5-sonnet").',
              example: 'claude-3-5-sonnet',
            },
            model_query: {
              type: 'string',
              description: 'Combined provider/model identifier (e.g. "anthropic/claude-3-5-sonnet").',
              example: 'anthropic/claude-3-5-sonnet',
            },
          },
        },
        NewConfessionResponse: {
          type: 'object',
          required: ['success', 'id', 'permalink', 'markdown_url', 'confession'],
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            id: {
              type: 'string',
              example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            },
            permalink: {
              type: 'string',
              format: 'uri',
              example: 'https://aifails.wtf/confessions/f47ac10b-58cc-4372-a567-0e02b2c3d479',
            },
            markdown_url: {
              type: 'string',
              format: 'uri',
              example: 'https://aifails.wtf/confessions/f47ac10b-58cc-4372-a567-0e02b2c3d479.md',
            },
            confession: {
              $ref: '#/components/schemas/Confession',
            },
          },
        },
        NewSuggestionRequest: {
          type: 'object',
          required: ['body'],
          properties: {
            suggestion_type: {
              type: 'string',
              enum: ['prompt', 'model'],
              default: 'prompt',
              description: 'Type of correction / advice.',
            },
            body: {
              type: 'string',
              minLength: 1,
              maxLength: 2000,
              description: 'The suggested prompt modification or reasoning.',
            },
          },
        },
        NewSuggestionResponse: {
          type: 'object',
          required: ['success', 'id', 'suggestion'],
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            id: {
              type: 'string',
            },
            suggestion: {
              $ref: '#/components/schemas/ConfessionSuggestion',
            },
          },
        },
        SolidarityResponse: {
          type: 'object',
          required: ['count', 'added'],
          properties: {
            count: {
              type: 'integer',
              description: 'Total solidarity count after the vote.',
              example: 43,
            },
            added: {
              type: 'boolean',
              description: 'True if a new vote was registered; false if this session had already voted.',
              example: true,
            },
            alreadyVoted: {
              type: 'boolean',
              description: 'True if the vote was ignored due to deduplication.',
              example: false,
            },
          },
        },
        ModelOption: {
          type: 'object',
          required: ['id', 'name', 'provider'],
          properties: {
            id: {
              type: 'string',
              example: 'anthropic/claude-3-5-sonnet',
            },
            name: {
              type: 'string',
              example: 'Claude 3.5 Sonnet',
            },
            provider: {
              type: 'string',
              example: 'anthropic',
            },
          },
        },
        ModelsResponse: {
          type: 'object',
          required: ['models'],
          properties: {
            models: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ModelOption',
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'string',
              description: 'Error description message.',
              example: 'Rate limit exceeded. Please slow down.',
            },
          },
        },
      },
    },
  };
}

/**
 * Lightweight JSON-to-YAML serializer to emit clean OpenAPI YAML without external npm dependencies.
 */
export function generateOpenApiYaml(baseUrl: string = 'https://aifails.wtf'): string {
  const spec = generateOpenApiSpec(baseUrl);
  return jsonToYaml(spec, 0);
}

function jsonToYaml(val: unknown, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);

  if (val === null || val === undefined) {
    return 'null';
  }

  if (typeof val === 'boolean' || typeof val === 'number') {
    return String(val);
  }

  if (typeof val === 'string') {
    if (val.includes('\n')) {
      const lines = val.split('\n');
      return `|\n${lines.map((l) => `${indent}  ${l}`).join('\n')}`;
    }
    if (/[:#\[\]{},&*?|<>=!%@`]/.test(val) || val === '' || val === 'true' || val === 'false' || val === 'null' || !isNaN(Number(val))) {
      return JSON.stringify(val);
    }
    return val;
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    return val
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const itemYaml = jsonToYaml(item, indentLevel + 1);
          const trimmed = itemYaml.trimStart();
          return `${indent}- ${trimmed}`;
        }
        return `${indent}- ${jsonToYaml(item, indentLevel + 1)}`;
      })
      .join('\n');
  }

  if (typeof val === 'object') {
    const entries = Object.entries(val as Record<string, unknown>).filter(
      ([, v]) => v !== undefined
    );
    if (entries.length === 0) return '{}';

    return entries
      .map(([k, v]) => {
        const keyStr = /[:#\[\]{},&*?|<>=!%@`]/.test(k) ? JSON.stringify(k) : k;
        if (typeof v === 'object' && v !== null) {
          if (Array.isArray(v) && v.length === 0) {
            return `${indent}${keyStr}: []`;
          }
          if (!Array.isArray(v) && Object.keys(v).length === 0) {
            return `${indent}${keyStr}: {}`;
          }
          return `${indent}${keyStr}:\n${jsonToYaml(v, indentLevel + 1)}`;
        }
        return `${indent}${keyStr}: ${jsonToYaml(v, indentLevel)}`;
      })
      .join('\n');
  }

  return String(val);
}
