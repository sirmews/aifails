export function getOpenApiSchemas(): Record<string, unknown> {
  return {
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
      required: ['success', 'count', 'added', 'alreadyVoted'],
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
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
  };
}
