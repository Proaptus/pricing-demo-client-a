import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { buildDocumentationContext } from '../documentationLoader.js';

describe('Documentation Loader - Baseline Integration', () => {
  const testBaselineDir = path.join(process.cwd(), 'docs', 'baseline');
  const testBaselinePath = path.join(testBaselineDir, 'current.json');

  beforeEach(async () => {
    // Create test baseline file
    await fs.mkdir(testBaselineDir, { recursive: true });

    const testBaseline = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        source: 'Test'
      },
      defaultInputs: {
        nSites: 17000,
        minDocs: 5,
        maxDocs: 10,
        qualityPreset: 'excellent'
      },
      scenarioConfigs: {
        conservative: {
          name: 'Conservative',
          laborMargin: 0.47,
          targetMargin: 0.40
        },
        standard: {
          name: 'Standard',
          laborMargin: 0.58,
          targetMargin: 0.50
        }
      },
      assumptionPresets: {
        excellent: {
          name: 'Excellent (Controlled Scan)',
          qGood: 0.92
        },
        medium: {
          name: 'Medium Quality',
          qGood: 0.50
        }
      }
    };

    await fs.writeFile(testBaselinePath, JSON.stringify(testBaseline, null, 2), 'utf-8');
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(testBaselineDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore errors
    }
  });

  it('should load baseline JSON from docs/baseline/current.json', async () => {
    const docs = await buildDocumentationContext();

    // Should include baseline data
    expect(docs).toContain('17000');
    expect(docs).toContain('excellent');
    expect(docs).toContain('Conservative');
  });

  it('should format baseline with [BASELINE - SSOT] tags', async () => {
    const docs = await buildDocumentationContext();

    // Should have baseline section with SSOT tag
    expect(docs).toContain('[BASELINE - SSOT]');
    expect(docs).toContain('BASELINE');
    expect(docs).toContain('SSOT');
  });

  it('should merge baseline with existing documentation', async () => {
    const docs = await buildDocumentationContext();

    // Should have existing docs sections
    expect(docs).toContain('CORNERSTONE PRICING DOCUMENTATION');

    // Should also have baseline data
    expect(docs).toContain('[BASELINE - SSOT]');
    expect(docs).toContain('17000');
  });

  it('should include defaultInputs in baseline section', async () => {
    const docs = await buildDocumentationContext();

    // Should include default inputs
    expect(docs).toContain('nSites');
    expect(docs).toContain('17000');
    expect(docs).toContain('qualityPreset');
  });

  it('should include scenario configs in baseline section', async () => {
    const docs = await buildDocumentationContext();

    // Should include scenario configs
    expect(docs).toContain('Conservative');
    expect(docs).toContain('laborMargin');
    expect(docs).toContain('0.47');
  });

  it('should include assumption presets in baseline section', async () => {
    const docs = await buildDocumentationContext();

    // Should include assumption presets
    expect(docs).toContain('Excellent');
    expect(docs).toContain('qGood');
    expect(docs).toContain('0.92');
  });

  it('should handle missing baseline file gracefully', async () => {
    // Delete baseline file
    await fs.rm(testBaselinePath, { force: true });

    // Should not throw
    const docs = await buildDocumentationContext();

    // Should still return documentation
    expect(docs).toContain('CORNERSTONE PRICING DOCUMENTATION');

    // Should not have baseline section
    expect(docs).not.toContain('[BASELINE - SSOT]');
  });

  it('should parse baseline JSON correctly', async () => {
    const docs = await buildDocumentationContext();

    // Should have properly parsed values
    expect(docs).toContain('17000'); // nSites
    expect(docs).toContain('excellent'); // qualityPreset
    expect(docs).toContain('0.92'); // qGood from excellent preset
  });

  it('should include metadata from baseline', async () => {
    const docs = await buildDocumentationContext();

    // Should include metadata
    expect(docs).toContain('version');
    expect(docs).toContain('1.0.0');
  });
});
