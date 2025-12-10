import { describe, it, expect } from 'vitest';
import { loadDocumentation, buildDocumentationContext } from '../documentationLoader';

describe('Documentation Loader Service', () => {
  describe('loadDocumentation', () => {
    it('should return an object with documentation content', async () => {
      const docs = await loadDocumentation();

      expect(docs).toBeDefined();
      expect(typeof docs).toBe('object');
    });

    it('should include README content', async () => {
      const docs = await loadDocumentation();

      expect(docs.README).toBeDefined();
      expect(docs.README).toContain('Cornerstone Pricing Documentation');
      expect(docs.README).toContain('17,000 sites');
    });

    it('should include pricing model reference content', async () => {
      const docs = await loadDocumentation();

      expect(docs.PRICING_MODEL_REFERENCE).toBeDefined();
      expect(docs.PRICING_MODEL_REFERENCE).toContain('Pricing Model Reference');
      expect(docs.PRICING_MODEL_REFERENCE).toContain('Client Baseline');
      expect(docs.PRICING_MODEL_REFERENCE).toContain('Core Calculations');
    });

    it('should include functional spec content', async () => {
      const docs = await loadDocumentation();

      expect(docs.FUNCTIONAL_SPEC).toBeDefined();
      expect(docs.FUNCTIONAL_SPEC).toContain('calculator');
    });

    it('should include client requirements', async () => {
      const docs = await loadDocumentation();

      expect(docs.CLIENT_REQUIREMENTS).toBeDefined();
      expect(docs.CLIENT_REQUIREMENTS).toContain('Iain Harris');
      expect(docs.CLIENT_REQUIREMENTS).toContain('17000');
    });

    it('should include scanning calculation spec', async () => {
      const docs = await loadDocumentation();

      expect(docs.SCANNING_CALCULATION).toBeDefined();
      expect(docs.SCANNING_CALCULATION).toContain('scanning');
    });
  });

  describe('buildDocumentationContext', () => {
    it('should return a formatted string', async () => {
      const context = await buildDocumentationContext();

      expect(typeof context).toBe('string');
      expect(context.length).toBeGreaterThan(100);
    });

    it('should include section headers', async () => {
      const context = await buildDocumentationContext();

      expect(context).toContain('# CORNERSTONE PRICING DOCUMENTATION');
      expect(context).toMatch(/##.*README/);
      expect(context).toMatch(/##.*PRICING MODEL REFERENCE/);
    });

    it('should include all documentation sections', async () => {
      const context = await buildDocumentationContext();

      // Check for key sections
      expect(context).toContain('17,000 sites');
      expect(context).toContain('Iain Harris');
      expect(context).toContain('scanning');
      expect(context).toContain('Cornerstone Telecommunications Infrastructure');
    });

    it('should format sections with clear delimiters', async () => {
      const context = await buildDocumentationContext();

      // Check for section separators
      expect(context).toMatch(/---/);
      expect(context).toMatch(/## README/i);
    });

    it('should handle errors gracefully', async () => {
      // This should not throw even if some docs are missing
      const context = await buildDocumentationContext();

      expect(context).toBeDefined();
      expect(context.length).toBeGreaterThan(0);
    });
  });
});
