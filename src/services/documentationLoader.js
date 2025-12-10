/**
 * Documentation Loader Service
 * Loads and formats comprehensive documentation context for the Q&A LLM
 */

// Import active documentation files as raw text (LLM-optimized, verified 2025-11-15)
import README from '../../docs/README.md?raw';
import PRICING_MODEL_REFERENCE from '../../docs/PRICING_MODEL_REFERENCE.md?raw';
import CLIENT_REQUIREMENTS from '../../docs/CLIENT_REQUIREMENTS.md?raw';
import SCANNING_CALCULATION from '../../docs/SCANNING_CALCULATION_SPECIFICATION.md?raw';
import FUNCTIONAL_SPEC from '../../docs/PRICING_CALCULATOR_FUNCTIONAL_SPEC.md?raw';

/**
 * Load baseline values from docs/baseline/current.json
 * Only works in Node.js environment (server-side, tests)
 * Returns null in browser environment
 * @returns {Promise<Object|null>} - Baseline object or null if file doesn't exist
 */
async function loadBaseline() {
  // Check if we're in Node.js environment (process.cwd exists)
  // Note: Can't use window check because happy-dom provides window in tests
  if (typeof process === 'undefined' || typeof process.cwd !== 'function') {
    // Browser environment (or non-Node) - cannot use fs module
    return null;
  }

  try {
    // Dynamic import to avoid loading fs in browser
    const { promises: fs } = await import('fs');
    const path = await import('path');

    const baselinePath = path.join(process.cwd(), 'docs', 'baseline', 'current.json');
    const fileContent = await fs.readFile(baselinePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (err) {
    // File doesn't exist or can't be read - return null
    return null;
  }
}

/**
 * Format baseline data for LLM context
 * @param {Object} baseline - Baseline data object
 * @returns {string} - Formatted baseline section
 */
function formatBaseline(baseline) {
  let formatted = `
## [BASELINE - SSOT] Current Pricing Model Baseline

**Metadata:**
- exportedAt: ${baseline.metadata.exportedAt}
- version: ${baseline.metadata.version}
- source: ${baseline.metadata.source}

**Default Inputs:**
\`\`\`json
${JSON.stringify(baseline.defaultInputs, null, 2)}
\`\`\`

**Scenario Configurations:**
\`\`\`json
${JSON.stringify(baseline.scenarioConfigs, null, 2)}
\`\`\`

**Assumption Presets:**
\`\`\`json
${JSON.stringify(baseline.assumptionPresets, null, 2)}
\`\`\`
`;

  // Add runtime state section if available (current application state)
  if (baseline.runtimeState && baseline.runtimeState !== null) {
    formatted += `

**Current Runtime State:**
\`\`\`json
${JSON.stringify(baseline.runtimeState, null, 2)}
\`\`\`
`;
  }

  formatted += `

---
`;

  return formatted;
}

/**
 * Load all active documentation files (LLM-optimized, 62% token reduction)
 * @returns {Promise<Object>} - Object containing all documentation content
 */
export async function loadDocumentation() {
  return {
    README,
    PRICING_MODEL_REFERENCE,
    CLIENT_REQUIREMENTS,
    SCANNING_CALCULATION,
    FUNCTIONAL_SPEC,
  };
}

/**
 * Build formatted documentation context for LLM
 * @returns {Promise<string>} - Formatted documentation string
 */
export async function buildDocumentationContext() {
  const docs = await loadDocumentation();
  const baseline = await loadBaseline();

  // Build baseline section if available
  const baselineSection = baseline ? formatBaseline(baseline) : '';

  return `
# CORNERSTONE PRICING DOCUMENTATION
# LLM-Optimized | 62% Token Reduction | Verified 2025-11-15

This documentation provides comprehensive context about the Cornerstone pricing model, client requirements, scanning services, and business rationale. All documentation is verified against code (lines 845-1044 of CornerstonePricingCalculator.jsx).

**Source of Truth**: Code always wins over documentation.

---

${baselineSection}

## README - Navigation & Quick Reference

${docs.README}

---

## PRICING MODEL REFERENCE - Complete Calculation Specification

${docs.PRICING_MODEL_REFERENCE}

---

## CLIENT REQUIREMENTS - Baseline & Scope

${docs.CLIENT_REQUIREMENTS}

---

## SCANNING CALCULATION - Scanning Cost Specification

${docs.SCANNING_CALCULATION}

---

## FUNCTIONAL SPEC - Technical Calculator Documentation

${docs.FUNCTIONAL_SPEC}

---

# USAGE INSTRUCTIONS FOR Q&A

When answering pricing questions:
1. ✅ Answer in clear, business-friendly language
2. ✅ Explain pricing strategies and cost drivers
3. ✅ Distinguish between: internal costs (Proaptus portion NOT billed) vs what client pays
4. ✅ Remember: Scanning reduces LLM costs 30%, manual review 90%
5. ✅ Use dual-margin pricing: labor (47-100%), passthrough (12-20%)
6. ✅ Client baseline: 17,000 sites (firm requirement)
7. ❌ Do NOT reference source code, file names, or line numbers
8. ❌ Do NOT mention technical implementation details

**Focus**: Business value, pricing strategy, and cost explanations.
`.trim();
}
