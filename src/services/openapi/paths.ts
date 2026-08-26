export function getOpenApiPaths(): Record<string, unknown> {
  return {
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
              example: 'furious',
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
  };
}
