#!/usr/bin/env node

/**
 * Export baseline values to docs/baseline/current.json
 * Run with: node scripts/exportBaseline.js
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import directly from source
import { defaultInputs, SCENARIO_CONFIGS, ASSUMPTION_PRESETS } from '../src/components/CornerstonePricingCalculator.jsx';

async function exportBaseline() {
  const baselineDir = path.join(__dirname, '..', 'docs', 'baseline');
  const outputPath = path.join(baselineDir, 'current.json');

  // Create directory if it doesn't exist
  await fs.mkdir(baselineDir, { recursive: true });

  // Build baseline object
  const baseline = {
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      source: 'CornerstonePricingCalculator.jsx',
      description: 'Baseline values for Cornerstone pricing model - SSOT for documentation'
    },
    defaultInputs: defaultInputs,
    scenarioConfigs: SCENARIO_CONFIGS,
    assumptionPresets: ASSUMPTION_PRESETS
  };

  // Write formatted JSON
  await fs.writeFile(
    outputPath,
    JSON.stringify(baseline, null, 2),
    'utf-8'
  );

  console.log('✅ Baseline exported successfully to:', outputPath);
  console.log('📦 Baseline contains:');
  console.log('   - defaultInputs');
  console.log('   - scenarioConfigs (conservative, standard, aggressive)');
  console.log('   - assumptionPresets (excellent, high, medium, low)');
}

// Run export
exportBaseline().catch(error => {
  console.error('❌ Export failed:', error.message);
  process.exit(1);
});
