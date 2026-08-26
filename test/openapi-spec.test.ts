import { describe, expect, it } from 'bun:test';
import { generateOpenApiSpec, generateOpenApiYaml } from '../src/services/openapi';

describe('OpenAPI 3.1.0 Specification Generator', () => {
  it('generates a valid OpenAPI 3.1.0 spec object', () => {
    const spec = generateOpenApiSpec('https://aifails.wtf') as Record<string, any>;
    expect(spec.openapi).toBe('3.1.0');
    expect(spec.info.title).toBe('aifails.wtf — Prompt Confessional API');
    expect(spec.paths['/api/confessions']).toBeDefined();
    expect(spec.paths['/api/confessions'].get.operationId).toBe('listPromptFailures');
    expect(spec.paths['/api/confessions'].post.operationId).toBe('submitPromptFailure');
    expect(spec.paths['/api/random'].get.operationId).toBe('getRandomPromptFailure');
    expect(spec.paths['/confessions/{id}'].get.operationId).toBe('getPromptFailureById');
    expect(spec.paths['/confessions/{id}/solidarity'].post.operationId).toBe('voteSolidarity');
    expect(spec.paths['/confessions/{id}/suggestions'].post.operationId).toBe('submitPromptSuggestion');
    expect(spec.paths['/api/models'].get.operationId).toBe('listCatalogModels');
    expect(spec.components.schemas.Confession).toBeDefined();
    expect(spec.components.schemas.NewConfessionRequest).toBeDefined();

    // Verify mood query example conforms to enum
    const moodParam = spec.paths['/api/confessions'].get.parameters.find((p: any) => p.name === 'mood');
    expect(moodParam.schema.enum).toContain(moodParam.schema.example);

    // Verify SolidarityResponse has success field
    expect(spec.components.schemas.SolidarityResponse.required).toContain('success');
  });

  it('generates clean OpenAPI YAML', () => {
    const yaml = generateOpenApiYaml('https://aifails.wtf');
    expect(yaml).toContain('openapi: 3.1.0');
    expect(yaml).toContain('title: aifails.wtf — Prompt Confessional API');
    expect(yaml).toContain('/api/confessions:');
    expect(yaml).toContain('operationId: listPromptFailures');
  });
});
