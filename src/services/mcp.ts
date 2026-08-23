import type { D1Database } from '@cloudflare/workers-types';
import {
  MCP_TOOLS_DEFINITIONS,
  executeGetAntiPatterns,
  executeGetRandomFail,
  executeSubmitFail,
} from './mcp-tools';

export type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
};

export type JsonRpcResponse = {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
};

export async function handleMcpJsonRpc(
  db: D1Database,
  request: JsonRpcRequest,
  baseUrl: string = 'https://aifails.wtf',
  options?: {
    isWriteRateLimited?: () => Promise<boolean>;
    onConfessionCreated?: () => void;
  }
): Promise<JsonRpcResponse | null> {
  const id = request.id ?? null;

  // Notifications have no id and do not require a response
  if (request.method === 'notifications/initialized' || request.method === 'initialized') {
    return null;
  }

  if (request.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        serverInfo: {
          name: 'aifails-mcp',
          title: 'Prompt Confessional MCP',
          version: '1.0.0',
        },
        capabilities: {
          tools: {
            listChanged: false,
          },
        },
        instructions:
          'Prompt Confessional MCP provides real-world LLM failure modes, hallucinations, and negative prompt constraints to help AI coding agents avoid common pitfalls.',
      },
    };
  }

  if (request.method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: MCP_TOOLS_DEFINITIONS,
      },
    };
  }

  if (request.method === 'tools/call') {
    const params = request.params as { name?: string; arguments?: Record<string, unknown> } | undefined;
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};

    if (!toolName) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32602,
          message: 'Invalid params: missing tool "name"',
        },
      };
    }

    try {
      if (toolName === 'get_anti_patterns') {
        const text = await executeGetAntiPatterns(
          db,
          {
            query: typeof toolArgs['query'] === 'string' ? toolArgs['query'] : undefined,
            model: typeof toolArgs['model'] === 'string' ? toolArgs['model'] : undefined,
            limit: typeof toolArgs['limit'] === 'number' ? toolArgs['limit'] : undefined,
          },
          baseUrl
        );

        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text }],
          },
        };
      }

      if (toolName === 'get_random_fail') {
        const text = await executeGetRandomFail(
          db,
          {
            exclude_id: typeof toolArgs['exclude_id'] === 'string' ? toolArgs['exclude_id'] : undefined,
          },
          baseUrl
        );

        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text }],
          },
        };
      }

      if (toolName === 'submit_fail') {
        // Enforce rate limiter check on writes
        if (options?.isWriteRateLimited && (await options.isWriteRateLimited())) {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32000,
              message: 'Rate limit exceeded for submissions. Please slow down.',
            },
          };
        }

        const res = await executeSubmitFail(
          db,
          {
            prompt_used: String(toolArgs['prompt_used'] || ''),
            what_it_did_instead: String(toolArgs['what_it_did_instead'] || ''),
            how_it_made_them_feel: String(toolArgs['how_it_made_them_feel'] || ''),
            mood: typeof toolArgs['mood'] === 'string' ? toolArgs['mood'] : undefined,
            model: typeof toolArgs['model'] === 'string' ? toolArgs['model'] : undefined,
          },
          baseUrl
        );

        if (options?.onConfessionCreated) {
          options.onConfessionCreated();
        }

        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `✅ ${res.message}\nID: ${res.id}\nPermalink: ${res.permalink}`,
              },
            ],
          },
        };
      }

      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Unknown tool "${toolName}"`,
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: `Error executing tool: ${message}` }],
          isError: true,
        },
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: `Method "${request.method}" not found`,
    },
  };
}
