import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { syncMarkdownWithRuntime } from '../markdownSync.js';
import { defaultInputs, SCENARIO_CONFIGS } from '../../data/baselineConstants.js';

describe('Markdown Sync Service', () => {
  const docsDir = path.join(process.cwd(), 'docs');
  const pricingModelPath = path.join(docsDir, 'PRICING_MODEL_REFERENCE.md');
  const clientReqPath = path.join(docsDir, 'CLIENT_REQUIREMENTS.md');
  const backupPath = path.join(docsDir, 'PRICING_MODEL_REFERENCE.md.backup');

  beforeEach(async () => {
    // Backup original file
    const original = await fs.readFile(pricingModelPath, 'utf-8');
    await fs.writeFile(backupPath, original, 'utf-8');
  });

  afterEach(async () => {
    // Restore original file
    try {
      const backup = await fs.readFile(backupPath, 'utf-8');
      await fs.writeFile(pricingModelPath, backup, 'utf-8');
      await fs.unlink(backupPath);
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  describe('syncMarkdownWithRuntime()', () => {
    it('should update PRICING_MODEL_REFERENCE.md with current runtime values', async () => {
      // Mock computed model
      const mockInputs = { ...defaultInputs, nSites: 20000 };
      const mockModel = {
        totalDocuments: 150000,
        totalPages: 2190000,
        manualReviewCost: 5000.00,
        ocrCost: 2200.00,
        llmCost: 6500.00,
        totalCAPEX: 450000,
        totalOPEX: 12000,
        pricePerSite: 30.00,
        margin: 0.50,
      };
      const mockScenario = 'standard';

      // Sync markdown with runtime values
      await syncMarkdownWithRuntime(mockInputs, mockModel, mockScenario);

      // Read updated markdown
      const updatedMarkdown = await fs.readFile(pricingModelPath, 'utf-8');

      // Verify Section B exists
      expect(updatedMarkdown).toContain('## Current Runtime Values');

      // Verify current values appear in markdown
      expect(updatedMarkdown).toContain('nSites: 20000');
      expect(updatedMarkdown).toContain('totalDocuments: 150000');
      expect(updatedMarkdown).toContain('totalPages: 2190000');
      expect(updatedMarkdown).toContain('scenario: standard');
      expect(updatedMarkdown).toContain('margin: 0.50');

      // Verify Section A (formulas) still exists
      expect(updatedMarkdown).toContain('## Core Calculations');
      expect(updatedMarkdown).toContain('### Volume Calculations');
    });

    it('should preserve Section A (formulas) when updating Section B (values)', async () => {
      const mockInputs = defaultInputs;
      const mockModel = {
        totalDocuments: 127500,
        totalPages: 1861500,
        margin: 0.50,
      };

      // Read original
      const originalMarkdown = await fs.readFile(pricingModelPath, 'utf-8');
      const formulaSection = originalMarkdown.match(/## Core Calculations[\s\S]*?## Competitive Benchmarks/);

      // Sync
      await syncMarkdownWithRuntime(mockInputs, mockModel, 'standard');

      // Read updated
      const updatedMarkdown = await fs.readFile(pricingModelPath, 'utf-8');
      const updatedFormulaSection = updatedMarkdown.match(/## Core Calculations[\s\S]*?## Competitive Benchmarks/);

      // Formula section should be unchanged
      expect(updatedFormulaSection).toBeTruthy();
      expect(updatedFormulaSection[0]).toBe(formulaSection[0]);
    });

    it('should update existing Section B if it already exists', async () => {
      // First sync with values
      const initialInputs = { ...defaultInputs, nSites: 15000 };
      const initialModel = { totalDocuments: 112500, margin: 0.33 };
      await syncMarkdownWithRuntime(initialInputs, initialModel, 'conservative');

      const firstUpdate = await fs.readFile(pricingModelPath, 'utf-8');
      expect(firstUpdate).toContain('nSites: 15000');
      expect(firstUpdate).toContain('conservative');

      // Second sync with different values
      const updatedInputs = { ...defaultInputs, nSites: 25000 };
      const updatedModel = { totalDocuments: 187500, margin: 0.75 };
      await syncMarkdownWithRuntime(updatedInputs, updatedModel, 'aggressive');

      const secondUpdate = await fs.readFile(pricingModelPath, 'utf-8');

      // Should have new values
      expect(secondUpdate).toContain('nSites: 25000');
      expect(secondUpdate).toContain('aggressive');

      // Should NOT have old values in runtime section
      expect(secondUpdate).not.toContain('nSites: 15000');
      expect(secondUpdate).not.toContain('scenario: conservative');
    });

    it('should format runtime values as YAML for readability', async () => {
      const mockInputs = defaultInputs;
      const mockModel = {
        totalDocuments: 127500,
        totalPages: 1861500,
        manualReviewCost: 4016.60,
        totalCAPEX: 416555,
        margin: 0.50,
      };

      await syncMarkdownWithRuntime(mockInputs, mockModel, 'standard');

      const updatedMarkdown = await fs.readFile(pricingModelPath, 'utf-8');

      // Check for YAML-style formatting
      expect(updatedMarkdown).toMatch(/```yaml[\s\S]*?nSites: \d+[\s\S]*?```/);
      expect(updatedMarkdown).toMatch(/scenario: standard/);
    });

    it('should include timestamp in Section B', async () => {
      const mockInputs = defaultInputs;
      const mockModel = { totalDocuments: 127500 };

      await syncMarkdownWithRuntime(mockInputs, mockModel, 'standard');

      const updatedMarkdown = await fs.readFile(pricingModelPath, 'utf-8');

      // Check for ISO timestamp
      expect(updatedMarkdown).toMatch(/updated_at: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
