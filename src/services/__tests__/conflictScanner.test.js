import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { scanForConflicts, extractNumbers, isWithinTaggedSection } from '../conflictScanner.js';

describe('Conflict Scanner Service', () => {
  const testDocsDir = path.join(process.cwd(), 'docs', 'test-scan');
  const testBaselineDir = path.join(process.cwd(), 'docs', 'baseline');
  const testBaselinePath = path.join(testBaselineDir, 'current.json');

  beforeEach(async () => {
    // Create test baseline
    await fs.mkdir(testBaselineDir, { recursive: true });
    const baseline = {
      metadata: { version: '1.0.0' },
      defaultInputs: { nSites: 17000, minDocs: 5 },
      scenarioConfigs: {},
      assumptionPresets: {}
    };
    await fs.writeFile(testBaselinePath, JSON.stringify(baseline, null, 2), 'utf-8');

    // Create test docs directory
    await fs.mkdir(testDocsDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up
    try {
      await fs.rm(testDocsDir, { recursive: true, force: true });
      await fs.rm(testBaselineDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore
    }
  });

  describe('extractNumbers', () => {
    it('should extract numeric values from text', () => {
      const text = 'We have 17000 sites and 135000 documents.';
      const numbers = extractNumbers(text);

      expect(numbers).toContain('17000');
      expect(numbers).toContain('135000');
    });

    it('should ignore numbers in code blocks', () => {
      const text = `
Some text with 17000 sites.

\`\`\`javascript
const sites = 20000; // Should be ignored
\`\`\`

Another 17000 mention.
`;
      const numbers = extractNumbers(text);

      expect(numbers).toContain('17000');
      expect(numbers).not.toContain('20000');
    });

    it('should extract numbers with commas', () => {
      const text = 'Total cost: £1,500,000 for 17,000 sites.';
      const numbers = extractNumbers(text);

      expect(numbers).toContain('1,500,000');
      expect(numbers).toContain('17,000');
    });

    it('should extract decimal numbers', () => {
      const text = 'Margin of 0.50 and rate of 47.5%';
      const numbers = extractNumbers(text);

      expect(numbers).toContain('0.50');
      expect(numbers).toContain('47.5');
    });
  });

  describe('isWithinTaggedSection', () => {
    it('should detect number within [BASELINE - SSOT] tag', () => {
      const text = `
Some text before.

<!-- BASELINE - SSOT -->
We have 17000 sites.
<!-- /BASELINE - SSOT -->

Some text after.
`;
      const result = isWithinTaggedSection(text, '17000', 'BASELINE');
      expect(result).toBe(true);
    });

    it('should detect number within [DISCUSSION] tag', () => {
      const text = `
<!-- CLIENT COMMS - DISCUSSION -->
Maybe 18000 or 20000 sites?
<!-- /CLIENT COMMS - DISCUSSION -->
`;
      const result = isWithinTaggedSection(text, '18000', 'DISCUSSION');
      expect(result).toBe(true);
    });

    it('should detect number within [ARCHIVED] tag', () => {
      const text = `
<!-- ARCHIVED -->
Old baseline was 15000 sites.
<!-- /ARCHIVED -->
`;
      const result = isWithinTaggedSection(text, '15000', 'ARCHIVED');
      expect(result).toBe(true);
    });

    it('should return false for untagged number', () => {
      const text = `
Some untagged text with 17000 sites.
`;
      const result = isWithinTaggedSection(text, '17000', 'BASELINE');
      expect(result).toBe(false);
    });
  });

  describe('scanForConflicts', () => {
    it('should detect untagged numbers differing from baseline', async () => {
      // Create test doc with conflict
      const testDoc = `
# Test Document

We are discussing 18000 sites for this project.

The baseline is 17000 sites.
`;
      await fs.writeFile(
        path.join(testDocsDir, 'test.md'),
        testDoc,
        'utf-8'
      );

      const conflicts = await scanForConflicts(testDocsDir);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toHaveProperty('file');
      expect(conflicts[0]).toHaveProperty('value');
      expect(conflicts[0]).toHaveProperty('line');
      expect(conflicts[0].value).toBe('18000');
    });

    it('should not flag numbers within tagged sections', async () => {
      const testDoc = `
# Test Document

<!-- CLIENT COMMS - DISCUSSION -->
We discussed 18000 or 20000 sites.
<!-- /CLIENT COMMS - DISCUSSION -->

<!-- BASELINE - SSOT -->
The baseline is 17000 sites.
<!-- /BASELINE - SSOT -->
`;
      await fs.writeFile(
        path.join(testDocsDir, 'test.md'),
        testDoc,
        'utf-8'
      );

      const conflicts = await scanForConflicts(testDocsDir);

      expect(conflicts).toHaveLength(0);
    });

    it('should skip _archive directory', async () => {
      // Create _archive with conflicts
      const archiveDir = path.join(testDocsDir, '_archive');
      await fs.mkdir(archiveDir, { recursive: true });

      const archiveDoc = `Old data: 15000 sites`;
      await fs.writeFile(
        path.join(archiveDir, 'old.md'),
        archiveDoc,
        'utf-8'
      );

      const conflicts = await scanForConflicts(testDocsDir);

      // Should not flag archived files
      expect(conflicts.every(c => !c.file.includes('_archive'))).toBe(true);
    });

    it('should generate detailed conflict report', async () => {
      const testDoc = `Line 1
Line 2
Line 3: We have 18000 sites here.
Line 4
`;
      await fs.writeFile(
        path.join(testDocsDir, 'conflict.md'),
        testDoc,
        'utf-8'
      );

      const conflicts = await scanForConflicts(testDocsDir);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].file).toContain('conflict.md');
      expect(conflicts[0].line).toBe(3);
      expect(conflicts[0].value).toBe('18000');
      expect(conflicts[0].context).toContain('We have 18000 sites');
    });

    it('should return empty array if no conflicts', async () => {
      const testDoc = `
<!-- BASELINE - SSOT -->
We have 17000 sites.
<!-- /BASELINE - SSOT -->
`;
      await fs.writeFile(
        path.join(testDocsDir, 'good.md'),
        testDoc,
        'utf-8'
      );

      const conflicts = await scanForConflicts(testDocsDir);

      expect(conflicts).toHaveLength(0);
    });

    it('should handle multiple files', async () => {
      await fs.writeFile(
        path.join(testDocsDir, 'doc1.md'),
        'Untagged 18000 here',
        'utf-8'
      );

      await fs.writeFile(
        path.join(testDocsDir, 'doc2.md'),
        'Another untagged 20000 here',
        'utf-8'
      );

      const conflicts = await scanForConflicts(testDocsDir);

      expect(conflicts.length).toBeGreaterThanOrEqual(2);
      const values = conflicts.map(c => c.value);
      expect(values).toContain('18000');
      expect(values).toContain('20000');
    });
  });
});
