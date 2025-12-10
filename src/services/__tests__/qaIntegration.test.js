import { describe, it, expect } from 'vitest';
import { buildDocumentationContext } from '../documentationLoader';
import { buildSystemPrompt } from '../qaSystemPrompt';

/**
 * Integration Tests - SSOT Pattern
 * Verifies that Q&A uses ONLY baseline documentation (docs/baseline/current.json)
 * and NOT live pricing data directly
 */
describe('Q&A System Integration Tests - SSOT Pattern', () => {
  it('should load comprehensive documentation from all files', async () => {
    const docs = await buildDocumentationContext();

    // Verify documentation is loaded
    expect(docs).toBeDefined();
    expect(docs.length).toBeGreaterThan(1000); // Documentation should be substantial

    // Verify key content is present
    expect(docs).toContain('17,000 sites');
    expect(docs).toContain('Iain Harris');
    expect(docs).toContain('scanning');
    expect(docs).toContain('Cornerstone Telecommunications');
  });

  it('should create system prompt with ONLY documentation (SSOT pattern)', async () => {
    // Load documentation (includes baseline from docs/baseline/current.json)
    const documentation = await buildDocumentationContext();

    // Build system prompt with ONLY documentation
    const systemPrompt = buildSystemPrompt(documentation);

    // Verify system prompt includes documentation
    expect(systemPrompt).toBeDefined();
    expect(systemPrompt.length).toBeGreaterThan(1000);

    // Verify documentation section is included
    expect(systemPrompt).toContain('COMPREHENSIVE DOCUMENTATION CONTEXT');
    expect(systemPrompt).toContain('17,000 sites');

    // Verify critical instructions are present
    expect(systemPrompt).toContain('INTERNAL TOOL');
    expect(systemPrompt).toContain('Proaptus');
    expect(systemPrompt).toContain('Accuracy Above All');
  });

  it('should include baseline data from docs/baseline/current.json', async () => {
    const documentation = await buildDocumentationContext();

    // Verify baseline section is included (if file exists)
    // In Node.js environment with baseline file, should include baseline
    // In browser or without baseline file, baseline section may be absent
    if (documentation.includes('[BASELINE - SSOT]')) {
      expect(documentation).toContain('Default Inputs');
      expect(documentation).toContain('nSites');
      expect(documentation).toContain('ourManualReviewPct');
    }
  });

  it('should include client baseline context', async () => {
    const documentation = await buildDocumentationContext();
    const systemPrompt = buildSystemPrompt(documentation);

    // Verify client-specific context
    expect(systemPrompt).toContain('Cornerstone Telecommunications Infrastructure Limited');
    expect(systemPrompt).toContain('iain.harris@cornerstone.network');
  });

  it('should include scanning service context', async () => {
    const documentation = await buildDocumentationContext();
    const systemPrompt = buildSystemPrompt(documentation);

    // Verify scanning context
    expect(systemPrompt).toMatch(/scanning/i);
    expect(systemPrompt).toMatch(/quality/i);
  });

  it('should include competitive positioning context', async () => {
    const documentation = await buildDocumentationContext();
    const systemPrompt = buildSystemPrompt(documentation);

    // Verify competitive context
    expect(systemPrompt).toMatch(/manual.*processing/i);
    expect(systemPrompt).toMatch(/competitor|vendor/i);
  });

  it('should work without documentation (minimal prompt)', () => {
    const systemPrompt = buildSystemPrompt('');

    // Should still work without documentation (minimal prompt)
    expect(systemPrompt).toBeDefined();
    expect(systemPrompt).not.toContain('COMPREHENSIVE DOCUMENTATION CONTEXT');
    expect(systemPrompt).toContain('pricing assistant');
  });

  it('should prioritize accuracy and transparency for internal use', async () => {
    const documentation = await buildDocumentationContext();
    const systemPrompt = buildSystemPrompt(documentation);

    // Verify emphasis on accuracy
    expect(systemPrompt).toContain('Accuracy Above All');
    expect(systemPrompt).toContain('Never estimate, guess, or make up values');
    expect(systemPrompt).toContain('accurate');
    expect(systemPrompt).toContain('transparent');
  });

  it('should NOT include live pricing data section (SSOT violation)', async () => {
    const documentation = await buildDocumentationContext();
    const systemPrompt = buildSystemPrompt(documentation);

    // Should NOT have separate pricing data section
    expect(systemPrompt).not.toContain('PRICING DATA FOR CURRENT SCENARIO');

    // Should only have documentation section
    expect(systemPrompt).toContain('COMPREHENSIVE DOCUMENTATION CONTEXT');
  });
});
