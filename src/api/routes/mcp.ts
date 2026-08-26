import { Hono } from 'hono';
import type { Env } from '../../types/env';
import { handleMcpJsonRpc, type JsonRpcRequest } from '../../services/mcp';
import { McpView } from '../../views/McpView';
import { getClientIp, isReadRateLimited, getSessionHelper, purgeEdgeCache } from '../helpers';

export const mcpRouter = new Hono<{ Bindings: Env }>();

// 1. Model Context Protocol (MCP) Guide HTML View
mcpRouter.get('/mcp', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/mcp`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const acceptHeader = c.req.header('accept') || '';
  if (acceptHeader.includes('application/json')) {
    return c.redirect('/.well-known/mcp/server-card.json');
  }
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return c.html(McpView());
});

mcpRouter.get('/skills', (c) => c.redirect('/mcp'));
mcpRouter.get('/agents', (c) => c.redirect('/mcp'));

// 2. Model Context Protocol (MCP) Streamable HTTP JSON-RPC Endpoint
mcpRouter.post('/mcp', async (c) => {
  const clientIp = getClientIp(c);
  if (await isReadRateLimited(c, `read:${clientIp}:/mcp`)) {
    return c.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32000, message: 'Rate limit exceeded. Please slow down.' },
      },
      429
    );
  }

  let body: JsonRpcRequest;
  try {
    body = (await c.req.json()) as JsonRpcRequest;
  } catch {
    return c.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error: invalid JSON' },
      },
      400
    );
  }

  const baseUrl = new URL(c.req.url).origin;
  const session = await getSessionHelper(c);

  const isWriteRateLimited = async () => {
    if (!c.env.CONFESSION_LIMITER) return false;
    const rateLimitKey = `${clientIp}:${session.sessionId}:mcp`;
    const { success } = await c.env.CONFESSION_LIMITER.limit({ key: rateLimitKey });
    return !success;
  };

  const response = await handleMcpJsonRpc(c.env.DB, body, baseUrl, {
    isWriteRateLimited,
    onConfessionCreated: () => purgeEdgeCache(c),
  });

  if (!response) {
    return c.body(null, 204);
  }

  c.header('Content-Type', 'application/json; charset=utf-8');
  c.header('Access-Control-Allow-Origin', '*');
  return c.json(response);
});

// 3. MCP Server Card
mcpRouter.get('/.well-known/mcp/server-card.json', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/.well-known/mcp/server-card.json`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const baseUrl = new URL(c.req.url).origin;
  const serverCard = {
    $schema: 'https://modelcontextprotocol.io/schema/server-card.json',
    name: 'aifails',
    title: 'Prompt Confessional MCP Server',
    description:
      'Anonymous confessions of prompt failures, model betrayals, and coding hallucinations. Query confessions, explore models, and submit prompt fails.',
    version: '1.0.0',
    homepage: baseUrl,
    transport: {
      type: 'http',
      url: `${baseUrl}/mcp`,
    },
    tools: [
      { name: 'list_recent_confessions', description: 'Retrieve latest confessions' },
      { name: 'get_random_confession', description: 'Fetch a random confession' },
      { name: 'get_confession', description: 'Retrieve single confession with community suggestions' },
      { name: 'list_models', description: 'List AI models with fail counts' },
      { name: 'submit_confession', description: 'Submit a new prompt fail' },
      { name: 'add_solidarity', description: 'Vote solidarity for a confession' },
      { name: 'submit_suggestion', description: 'Submit an Ackchyually fix' },
    ],
  };

  c.header('Content-Type', 'application/json; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  return c.json(serverCard);
});

mcpRouter.get('/.well-known/mcp.json', (c) => c.redirect('/.well-known/mcp/server-card.json'));
