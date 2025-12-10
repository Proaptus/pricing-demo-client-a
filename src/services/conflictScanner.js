/**
 * Conflict Scanner Service
 * Scans documentation files for untagged numeric values that could conflict with baseline
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Extract numeric values from text, excluding code blocks
 * @param {string} text - Text to extract numbers from
 * @returns {string[]} - Array of numeric strings
 */
export function extractNumbers(text) {
  // Remove code blocks first (```)
  const textWithoutCodeBlocks = text.replace(/```[\s\S]*?```/g, '');

  // Match numbers (with optional commas and decimals)
  // Matches: 17000, 17,000, 0.50, 47.5, 135000, 1,500,000
  // Pattern: digits with optional commas OR plain numbers OR decimals
  const numberPattern = /\b\d{1,3}(?:,\d{3})+\b|\b\d+\.\d+\b|\b\d+\b/g;
  const matches = textWithoutCodeBlocks.match(numberPattern);

  return matches || [];
}

/**
 * Check if a number appears within a tagged section
 * @param {string} text - Full text to search
 * @param {string} number - Number to look for
 * @param {string} tagType - Tag type: 'BASELINE', 'DISCUSSION', or 'ARCHIVED'
 * @returns {boolean} - True if number is within tagged section
 */
export function isWithinTaggedSection(text, number, tagType) {
  // Build tag patterns based on type
  const tagPatterns = {
    'BASELINE': /<!--\s*BASELINE\s*-\s*SSOT\s*-->([\s\S]*?)<!--\s*\/BASELINE\s*-\s*SSOT\s*-->/gi,
    'DISCUSSION': /<!--\s*CLIENT\s*COMMS\s*-\s*DISCUSSION\s*-->([\s\S]*?)<!--\s*\/CLIENT\s*COMMS\s*-\s*DISCUSSION\s*-->/gi,
    'ARCHIVED': /<!--\s*ARCHIVED\s*-->([\s\S]*?)<!--\s*\/ARCHIVED\s*-->/gi,
  };

  const pattern = tagPatterns[tagType];
  if (!pattern) {
    return false;
  }

  // Find all tagged sections
  const matches = [...text.matchAll(pattern)];

  // Check if number appears in any tagged section
  for (const match of matches) {
    const sectionContent = match[1];
    if (sectionContent.includes(number)) {
      return true;
    }
  }

  return false;
}

/**
 * Load baseline values for comparison
 * @returns {Promise<Object|null>} - Baseline object or null
 */
async function loadBaseline() {
  try {
    const baselinePath = path.join(process.cwd(), 'docs', 'baseline', 'current.json');
    const content = await fs.readFile(baselinePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

/**
 * Get baseline numeric values as strings
 * @param {Object} baseline - Baseline object
 * @returns {Set<string>} - Set of baseline values
 */
function getBaselineValues(baseline) {
  if (!baseline) return new Set();

  const values = new Set();

  // Extract from defaultInputs
  if (baseline.defaultInputs) {
    Object.values(baseline.defaultInputs).forEach(val => {
      if (typeof val === 'number') {
        values.add(String(val));
        // Also add comma-formatted version
        values.add(val.toLocaleString('en-US'));
      }
    });
  }

  return values;
}

/**
 * Check if a number is significant enough to report
 * @param {string} number - Number as string
 * @returns {boolean} - True if significant
 */
function isSignificantNumber(number) {
  // Remove commas for comparison
  const numValue = parseFloat(number.replace(/,/g, ''));

  // Flag if:
  // - Number is >= 100 (likely a significant value, not a line number)
  // - OR it's a decimal (like 0.50, 47.5)
  return numValue >= 100 || number.includes('.');
}

/**
 * Scan a single file for conflicts
 * @param {string} filePath - Path to file
 * @param {Set<string>} baselineValues - Set of baseline values
 * @returns {Promise<Object[]>} - Array of conflicts found
 */
async function scanFile(filePath, baselineValues) {
  const content = await fs.readFile(filePath, 'utf-8');
  const numbers = extractNumbers(content);
  const conflicts = [];

  // Split into lines for line number tracking
  const lines = content.split('\n');

  // Track which numbers we've already reported to avoid duplicates
  const reported = new Set();

  for (const number of numbers) {
    // Skip if already reported
    if (reported.has(number)) {
      continue;
    }

    // Skip if this is a baseline value
    if (baselineValues.has(number)) {
      continue;
    }

    // Skip insignificant numbers (line numbers, small values)
    if (!isSignificantNumber(number)) {
      continue;
    }

    // Check if within any tagged section
    const inBaseline = isWithinTaggedSection(content, number, 'BASELINE');
    const inDiscussion = isWithinTaggedSection(content, number, 'DISCUSSION');
    const inArchived = isWithinTaggedSection(content, number, 'ARCHIVED');

    // If not tagged, it's a potential conflict
    if (!inBaseline && !inDiscussion && !inArchived) {
      // Find line number and context
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(number)) {
          conflicts.push({
            file: filePath,
            line: i + 1,
            value: number,
            context: lines[i].trim().substring(0, 100), // First 100 chars
          });
          reported.add(number);
          break; // Only report first occurrence per number
        }
      }
    }
  }

  return conflicts;
}

/**
 * Recursively scan directory for markdown files
 * @param {string} dir - Directory to scan
 * @returns {Promise<string[]>} - Array of file paths
 */
async function findMarkdownFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip _archive directories
    if (entry.name === '_archive') {
      continue;
    }

    if (entry.isDirectory()) {
      const subFiles = await findMarkdownFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Scan documentation directory for conflicts
 * @param {string} docsDir - Directory to scan (default: docs/)
 * @returns {Promise<Object[]>} - Array of conflicts
 */
export async function scanForConflicts(docsDir = path.join(process.cwd(), 'docs')) {
  try {
    // Load baseline for comparison
    const baseline = await loadBaseline();
    const baselineValues = getBaselineValues(baseline);

    // Find all markdown files
    const markdownFiles = await findMarkdownFiles(docsDir);

    // Scan each file
    const allConflicts = [];
    for (const file of markdownFiles) {
      const conflicts = await scanFile(file, baselineValues);
      allConflicts.push(...conflicts);
    }

    return allConflicts;
  } catch (err) {
    console.error('Error scanning for conflicts:', err);
    return [];
  }
}
