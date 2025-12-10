/**
 * Markdown Sync Service
 * Updates markdown documentation files with current runtime values
 * Implements Q&A Documentation Sync Specification
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Sync PRICING_MODEL_REFERENCE.md with current runtime values
 * Updates Section B (Current Runtime Values) while preserving Section A (formulas)
 *
 * @param {Object} inputs - Current input state from Calculator
 * @param {Object} computedModel - Output from computeModel()
 * @param {string} scenario - Selected scenario name
 * @returns {Promise<void>}
 */
export async function syncMarkdownWithRuntime(inputs, computedModel, scenario) {
  const docsDir = path.join(process.cwd(), 'docs');
  const pricingModelPath = path.join(docsDir, 'PRICING_MODEL_REFERENCE.md');

  // Read current markdown
  const currentMarkdown = await fs.readFile(pricingModelPath, 'utf-8');

  // Build Section B (Current Runtime Values)
  const runtimeSection = buildRuntimeSection(inputs, computedModel, scenario);

  // Replace or append Section B
  let updatedMarkdown;
  const runtimeSectionMarker = '## Current Runtime Values';

  if (currentMarkdown.includes(runtimeSectionMarker)) {
    // Replace existing Section B - remove everything from marker to the final "---" before "**For implementation"
    // First, split at the marker
    const parts = currentMarkdown.split(runtimeSectionMarker);
    if (parts.length === 2) {
      // Find where the old runtime section ends (at the "---" before footer)
      const beforeRuntime = parts[0];
      const afterRuntimeStart = parts[1];

      // Find the final "---" section
      const footerMatch = currentMarkdown.match(/\n---\n\n\*\*For implementation details\*\*/);
      if (footerMatch) {
        // Everything before runtime section + new runtime section + footer
        updatedMarkdown = beforeRuntime + runtimeSection + '\n---\n\n**For implementation details**' + currentMarkdown.split('**For implementation details**')[1];
      } else {
        // No footer found, just replace to end
        updatedMarkdown = beforeRuntime + runtimeSection;
      }
    } else {
      // Unexpected format, fallback to simple replacement
      updatedMarkdown = currentMarkdown.replace(
        new RegExp(runtimeSectionMarker + '[\\s\\S]*$'),
        runtimeSection
      );
    }
  } else {
    // Append Section B before final "---" or at end
    if (currentMarkdown.includes('\n---\n\n**For implementation details**')) {
      updatedMarkdown = currentMarkdown.replace(
        '\n---\n\n**For implementation details**',
        `\n${runtimeSection}\n---\n\n**For implementation details**`
      );
    } else {
      updatedMarkdown = currentMarkdown + '\n\n' + runtimeSection;
    }
  }

  // Write updated markdown
  await fs.writeFile(pricingModelPath, updatedMarkdown, 'utf-8');
}

/**
 * Build Section B (Current Runtime Values) content
 * @param {Object} inputs - Current inputs
 * @param {Object} computedModel - Computed model output
 * @param {string} scenario - Scenario name
 * @returns {string} - Formatted markdown section
 */
function buildRuntimeSection(inputs, computedModel, scenario) {
  const timestamp = new Date().toISOString();

  return `## Current Runtime Values

> **Auto-generated from live calculator state**
> Last updated: ${timestamp}

### Current Inputs

\`\`\`yaml
# Client Baseline
nSites: ${inputs.nSites}
minDocs: ${inputs.minDocs}
maxDocs: ${inputs.maxDocs}

# Quality Preset
qualityPreset: ${inputs.qualityPreset}
qGood: ${inputs.qGood}
qMed: ${inputs.qMed}
qPoor: ${inputs.qPoor}

# Document Mix
docMixPreset: ${inputs.docMixPreset}
mixLease: ${inputs.mixLease}
mixDeed: ${inputs.mixDeed}
mixLicence: ${inputs.mixLicence}
mixPlan: ${inputs.mixPlan}

# Pages Per Document Type
pagesLease: ${inputs.pagesLease}
pagesDeed: ${inputs.pagesDeed}
pagesLicence: ${inputs.pagesLicence}
pagesPlan: ${inputs.pagesPlan}

# Review Configuration
reviewMinutes: ${inputs.reviewMinutes}
conflictMinutes: ${inputs.conflictMinutes}
ourManualReviewPct: ${inputs.ourManualReviewPct}

# Scanning Service
includeScanningService: ${inputs.includeScanningService}
${inputs.includeScanningService ? `scannerSpeed: ${inputs.scannerSpeed}
numberOfScanners: ${inputs.numberOfScanners}
workingHoursPerDay: ${inputs.workingHoursPerDay}
operatorHourlyRate: ${inputs.operatorHourlyRate}
scannerMonthlyLease: ${inputs.scannerMonthlyLease}` : '# (Scanning disabled)'}

# OCR & LLM Costs
ocrCostPer1000: ${inputs.ocrCostPer1000}
tokensPerPage: ${inputs.tokensPerPage}
pipelinePasses: ${inputs.pipelinePasses}
llmCostPerMTokens: ${inputs.llmCostPerMTokens}

# Build Team
saDays: ${inputs.saDays}
mlDays: ${inputs.mlDays}
beDays: ${inputs.beDays}
feDays: ${inputs.feDays}
devopsDays: ${inputs.devopsDays}
qaDays: ${inputs.qaDays}
pmDays: ${inputs.pmDays}
penTest: ${inputs.penTest}

# OPEX
azureSearch: ${inputs.azureSearch}
appHosting: ${inputs.appHosting}
monitoring: ${inputs.monitoring}
supportHours: ${inputs.supportHours}
supportRate: ${inputs.supportRate}
\`\`\`

### Current Scenario

\`\`\`yaml
scenario: ${scenario}
\`\`\`

### Computed Values

\`\`\`yaml
# Volume Calculations
totalDocuments: ${computedModel.totalDocuments || 'N/A'}
totalPages: ${computedModel.totalPages || 'N/A'}

# Cost Breakdown
manualReviewCost: ${computedModel.manualReviewCost ? computedModel.manualReviewCost.toFixed(2) : 'N/A'}
ocrCost: ${computedModel.ocrCost ? computedModel.ocrCost.toFixed(2) : 'N/A'}
llmCost: ${computedModel.llmCost ? computedModel.llmCost.toFixed(2) : 'N/A'}

# Total Quote
totalCAPEX: ${computedModel.totalCAPEX ? computedModel.totalCAPEX.toFixed(2) : 'N/A'}
totalOPEX: ${computedModel.totalOPEX ? computedModel.totalOPEX.toFixed(2) : 'N/A'}

# Pricing
pricePerSite: ${computedModel.pricePerSite ? computedModel.pricePerSite.toFixed(2) : 'N/A'}
margin: ${computedModel.margin ? computedModel.margin.toFixed(2) : 'N/A'}

# Metadata
updated_at: ${timestamp}
\`\`\`
`;
}
