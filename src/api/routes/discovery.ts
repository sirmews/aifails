import { Hono } from 'hono';
import type { Env } from '../../types/env';
import { getConfessions, getSuggestionsMapForConfessions } from '../../db';
import {
  generateLlmsTxt,
  generateLlmsFullTxt,
  generateSkillMarkdown,
  generateCliScript,
  generateAgentSkillsIndex,
} from '../../services/agent';
import { generateOpenApiSpec, generateOpenApiYaml } from '../../services/openapi';
import { generateChangelogMarkdown } from '../../services/changelog';
import { ChangelogView } from '../../views/ChangelogView';
import { getClientIp, isReadRateLimited, computeSha256Digest } from '../helpers';

export const discoveryRouter = new Hono<{ Bindings: Env }>();

// 1. RFC 9727 API Catalog Endpoint
discoveryRouter.get('/.well-known/api-catalog', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/.well-known/api-catalog`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const baseUrl = new URL(c.req.url).origin;
  const linkset = {
    linkset: [
      {
        anchor: baseUrl,
        'api-catalog': [
          {
            href: `${baseUrl}/.well-known/api-catalog`,
            type: 'application/linkset+json',
          },
        ],
        'service-desc': [
          {
            href: `${baseUrl}/openapi.json`,
            type: 'application/vnd.oai.openapi+json',
          },
          {
            href: `${baseUrl}/openapi.json`,
            type: 'application/json',
          },
          {
            href: `${baseUrl}/openapi.yaml`,
            type: 'application/yaml',
          },
          {
            href: `${baseUrl}/.well-known/mcp/server-card.json`,
            type: 'application/json',
          },
          {
            href: `${baseUrl}/.well-known/agent-skills/index.json`,
            type: 'application/json',
          },
          {
            href: `${baseUrl}/llms.txt`,
            type: 'text/plain',
          },
          {
            href: `${baseUrl}/cli.sh`,
            type: 'text/x-shellscript',
          },
        ],
        'service-doc': [
          {
            href: `${baseUrl}/llms-full.txt`,
            type: 'text/plain',
          },
          {
            href: `${baseUrl}/mcp`,
            type: 'text/html',
          },
          {
            href: `${baseUrl}/changelog`,
            type: 'text/html',
          },
        ],
        describedby: [
          {
            href: `${baseUrl}/feed.md`,
            type: 'text/markdown',
          },
          {
            href: `${baseUrl}/skill.md`,
            type: 'text/markdown',
          },
          {
            href: `${baseUrl}/.well-known/agent-skills/aifails/SKILL.md`,
            type: 'text/markdown',
          },
          {
            href: `${baseUrl}/changelog.md`,
            type: 'text/markdown',
          },
        ],
      },
    ],
  };

  return c.newResponse(JSON.stringify(linkset, null, 2), 200, {
    'Content-Type': 'application/linkset+json; charset=utf-8',
    'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    'Cache-Tag': 'discovery, api-catalog',
  });
});

// 2. LLMs.txt & Agent Catalog Standard Endpoints
discoveryRouter.get('/llms.txt', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/llms.txt`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const baseUrl = new URL(c.req.url).origin;
  c.header('Content-Type', 'text/plain; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  c.header('Cache-Tag', 'discovery, llms-txt');
  return c.text(generateLlmsTxt(baseUrl));
});

discoveryRouter.get('/llms-full.txt', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/llms-full.txt`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const { confessions } = await getConfessions(c.env.DB, { limit: 50 });
  const suggestionsMap = await getSuggestionsMapForConfessions(
    c.env.DB,
    confessions.map((conf) => conf.id)
  );
  const baseUrl = new URL(c.req.url).origin;
  c.header('Content-Type', 'text/plain; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  c.header('Cache-Tag', 'discovery, llms-txt');
  return c.text(generateLlmsFullTxt(confessions, suggestionsMap, baseUrl));
});

discoveryRouter.get('/feed.md', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/feed.md`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const { confessions } = await getConfessions(c.env.DB, { limit: 50 });
  const suggestionsMap = await getSuggestionsMapForConfessions(
    c.env.DB,
    confessions.map((conf) => conf.id)
  );
  const baseUrl = new URL(c.req.url).origin;
  return c.newResponse(generateLlmsFullTxt(confessions, suggestionsMap, baseUrl), 200, {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=300, s-maxage=3600',
    'Cache-Tag': 'feed, markdown',
  });
});

discoveryRouter.get('/confessions.md', (c) => c.redirect('/feed.md'));

// 3. OpenAPI 3.1 Specification Endpoints (JSON & YAML)
discoveryRouter.get('/openapi.json', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/openapi.json`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const baseUrl = new URL(c.req.url).origin;
  const spec = generateOpenApiSpec(baseUrl);
  return c.newResponse(JSON.stringify(spec, null, 2), 200, {
    'Content-Type': 'application/vnd.oai.openapi+json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Cache-Tag': 'discovery, openapi',
    'Access-Control-Allow-Origin': '*',
  });
});

discoveryRouter.get('/.well-known/openapi.json', (c) => c.redirect('/openapi.json'));

discoveryRouter.get('/openapi.yaml', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/openapi.yaml`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const baseUrl = new URL(c.req.url).origin;
  const yaml = generateOpenApiYaml(baseUrl);
  return c.newResponse(yaml, 200, {
    'Content-Type': 'application/yaml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Cache-Tag': 'discovery, openapi',
    'Access-Control-Allow-Origin': '*',
  });
});

discoveryRouter.get('/.well-known/openapi.yaml', (c) => c.redirect('/openapi.yaml'));

// 4. Agent Skill & CLI Download Endpoints
discoveryRouter.get('/skill.md', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/skill.md`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const baseUrl = new URL(c.req.url).origin;
  const skill = generateSkillMarkdown(baseUrl);
  const { hex, base64 } = await computeSha256Digest(skill);
  return c.newResponse(skill, 200, {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Cache-Tag': 'discovery, skill-md',
    'Access-Control-Allow-Origin': '*',
    'ETag': `"${hex}"`,
    'Digest': `sha-256=${base64}`,
    'X-Content-Type-Options': 'nosniff',
  });
});

discoveryRouter.get('/.well-known/skill.md', (c) => c.redirect('/skill.md'));

discoveryRouter.get('/cli.sh', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/cli.sh`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const baseUrl = new URL(c.req.url).origin;
  const script = generateCliScript(baseUrl);
  const { hex, base64 } = await computeSha256Digest(script);
  return c.newResponse(script, 200, {
    'Content-Type': 'text/x-shellscript; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Cache-Tag': 'discovery, cli-sh',
    'Access-Control-Allow-Origin': '*',
    'ETag': `"${hex}"`,
    'Digest': `sha-256=${base64}`,
    'X-Content-Type-Options': 'nosniff',
  });
});

discoveryRouter.get('/bin/aifails.sh', (c) => c.redirect('/cli.sh'));

// 5. RFC v0.2.0 Agent Skills Discovery Index & Artifacts
discoveryRouter.get('/.well-known/agent-skills/index.json', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/.well-known/agent-skills/index.json`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const baseUrl = new URL(c.req.url).origin;
  const index = await generateAgentSkillsIndex(baseUrl);
  return c.newResponse(JSON.stringify(index, null, 2), 200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Cache-Tag': 'discovery, agent-skills',
    'Access-Control-Allow-Origin': '*',
    'X-Content-Type-Options': 'nosniff',
  });
});

discoveryRouter.get('/.well-known/agent-skills/aifails/SKILL.md', (c) => c.redirect('/skill.md'));
discoveryRouter.get('/.well-known/skills/index.json', (c) => c.redirect('/.well-known/agent-skills/index.json', 301));

// 6. Product Changelog Endpoints (HTML & Markdown)
discoveryRouter.get('/changelog', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/changelog`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const acceptHeader = c.req.header('Accept') || '';
  const baseUrl = new URL(c.req.url).origin;

  if (acceptHeader.includes('text/markdown')) {
    return c.newResponse(generateChangelogMarkdown(baseUrl), 200, {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Cache-Tag': 'changelog',
    });
  }

  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  c.header('Cache-Tag', 'changelog');
  return c.html(ChangelogView());
});

discoveryRouter.get('/changelog.md', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/changelog.md`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const baseUrl = new URL(c.req.url).origin;
  return c.newResponse(generateChangelogMarkdown(baseUrl), 200, {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Cache-Tag': 'changelog',
    'Access-Control-Allow-Origin': '*',
  });
});
