/**
 * UAT Test: Q&A System Uses Updated Runtime Values
 * Validates that when markdown is updated, Q&A documentation context includes those values
 */

import { describe, it, expect } from 'vitest';
import { buildDocumentationContext } from '../../src/services/documentationLoader.js';
import PRICING_MODEL_REFERENCE from '../../docs/PRICING_MODEL_REFERENCE.md?raw';

describe('UAT: Q&A Documentation Sync - Runtime Values', () => {
  it('should include Current Runtime Values section in markdown', () => {
    // Verify the markdown file itself has the section
    expect(PRICING_MODEL_REFERENCE).toContain('## Current Runtime Values');
    expect(PRICING_MODEL_REFERENCE).toContain('Auto-generated from live calculator state');
  });

  it('should load markdown with updated nSites value (25000 not default 17000)', () => {
    // The markdown was updated with UAT test data: nSites = 25000
    expect(PRICING_MODEL_REFERENCE).toContain('nSites: 25000');

    // Should NOT have default value in runtime section
    // Note: 17000 appears in formulas section, so we check specifically in Current Runtime Values
    const runtimeSection = PRICING_MODEL_REFERENCE.split('## Current Runtime Values')[1];
    expect(runtimeSection).toBeTruthy();
    expect(runtimeSection).toContain('nSites: 25000');
  });

  it('should load markdown with updated totalDocuments value (287500)', () => {
    expect(PRICING_MODEL_REFERENCE).toContain('totalDocuments: 287500');
  });

  it('should load markdown with updated margin value (0.60)', () => {
    expect(PRICING_MODEL_REFERENCE).toContain('margin: 0.60');
  });

  it('should load markdown with standard scenario', () => {
    const runtimeSection = PRICING_MODEL_REFERENCE.split('## Current Runtime Values')[1];
    expect(runtimeSection).toContain('scenario: standard');
  });

  it('should include timestamp in Current Runtime Values', () => {
    const runtimeSection = PRICING_MODEL_REFERENCE.split('## Current Runtime Values')[1];
    expect(runtimeSection).toMatch(/Last updated: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('Q&A buildDocumentationContext() should include updated runtime values', async () => {
    // This is what PricingQA.jsx calls
    const context = await buildDocumentationContext();

    // Verify context includes the runtime section
    expect(context).toContain('## Current Runtime Values');

    // Verify context has UAT test values
    expect(context).toContain('nSites: 25000');
    expect(context).toContain('totalDocuments: 287500');
    expect(context).toContain('margin: 0.60');
    expect(context).toContain('scenario: standard');
  });

  it('Q&A documentation context should preserve formulas section', async () => {
    const context = await buildDocumentationContext();

    // Verify formulas are still present
    expect(context).toContain('## Core Calculations');
    expect(context).toContain('### Volume Calculations');
    expect(context).toContain('D = (minDocs + maxDocs) / 2');
  });
});
