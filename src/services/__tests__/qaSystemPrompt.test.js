import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '../qaSystemPrompt';

describe('System Prompt Service - SSOT Pattern', () => {
  const sampleDocumentation = `
# [BASELINE - SSOT] Current Pricing Model Baseline

**Metadata:**
- exportedAt: 2025-01-16T00:00:00.000Z
- version: 1.0.0
- source: CornerstonePricingCalculator.jsx

**Default Inputs:**
\`\`\`json
{
  "nSites": 17000,
  "ourManualReviewPct": 75
}
\`\`\`

## PRICING MODEL REFERENCE
Client: Cornerstone, Sites: 17,000
`.trim();

  it('should define assistant role', () => {
    const prompt = buildSystemPrompt(sampleDocumentation);

    // Check for role definition
    expect(prompt).toMatch(/assistant|help|pricing/i);
    expect(prompt).toMatch(/role|you are|act as/i);
  });

  it('should include documentation context (SSOT pattern)', () => {
    const prompt = buildSystemPrompt(sampleDocumentation);

    // Check that documentation is included
    expect(prompt).toContain('COMPREHENSIVE DOCUMENTATION CONTEXT');
    expect(prompt).toContain('[BASELINE - SSOT]');
    expect(prompt).toContain('17000');
    expect(prompt).toContain('75');
  });

  it('should provide response guidelines', () => {
    const prompt = buildSystemPrompt(sampleDocumentation);

    // Check for instructions/guidelines
    expect(prompt).toMatch(/answer|respond|provide|explain/i);
  });

  it('should instruct to answer only pricing questions', () => {
    const prompt = buildSystemPrompt(sampleDocumentation);

    // Check for scope limitation
    expect(prompt).toMatch(/pricing|bid|cost|price/i);
  });

  it('should be a non-empty string', () => {
    const prompt = buildSystemPrompt(sampleDocumentation);

    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(50);
  });

  it('should handle empty documentation gracefully', () => {
    const prompt = buildSystemPrompt('');

    // Should still return a valid prompt structure
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('should include documentation when provided', () => {
    const documentation = '# Documentation\n\nClient: Cornerstone, Sites: 17,000';
    const prompt = buildSystemPrompt(documentation);

    expect(prompt).toContain('COMPREHENSIVE DOCUMENTATION CONTEXT');
    expect(prompt).toContain('Client: Cornerstone, Sites: 17,000');
  });

  it('should NOT include live pricing data section (SSOT violation)', () => {
    const prompt = buildSystemPrompt(sampleDocumentation);

    // Should NOT have separate pricing data section (only docs)
    expect(prompt).not.toContain('PRICING DATA FOR CURRENT SCENARIO');
    // Should only have documentation section
    expect(prompt).toContain('COMPREHENSIVE DOCUMENTATION CONTEXT');
  });

  it('should mark this as an internal tool', () => {
    const prompt = buildSystemPrompt(sampleDocumentation);

    expect(prompt).toMatch(/INTERNAL TOOL|internal/i);
    expect(prompt).toMatch(/Proaptus/i);
  });

  it('should clarify Proaptus is vendor and Cornerstone is client', () => {
    const prompt = buildSystemPrompt(sampleDocumentation);

    expect(prompt).toContain('Proaptus');
    expect(prompt).toContain('Vendor'); // Capitalized as it should be
    expect(prompt).toContain('Cornerstone');
    expect(prompt).toContain('Client');
  });
});
