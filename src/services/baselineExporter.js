/**
 * Baseline Exporter Service
 * Exports baseline values (defaultInputs, SCENARIO_CONFIGS, ASSUMPTION_PRESETS)
 * to docs/baseline/current.json for SSOT documentation
 */

import { promises as fs } from 'fs';
import path from 'path';
import { defaultInputs, SCENARIO_CONFIGS, ASSUMPTION_PRESETS } from '../data/baselineConstants.js';

/**
 * Export baseline values to docs/baseline/current.json
 * Creates directory if it doesn't exist
 * Overwrites existing file
 *
 * @param {Object} [inputs] - Optional current inputs from Calculator component
 * @param {Object} [computedModel] - Optional computed model output from computeModel()
 * @param {string} [scenario] - Optional selected scenario name
 * @returns {Promise<void>}
 */
export async function exportBaseline(inputs = null, computedModel = null, scenario = null) {
  const baselineDir = path.join(process.cwd(), 'docs', 'baseline');
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

  // Add runtime state if parameters provided
  if (inputs !== null || computedModel !== null || scenario !== null) {
    baseline.runtimeState = {
      inputs: inputs,
      scenario: scenario,
      computedModel: computedModel
    };
  } else {
    // Backward compatibility - set to null when not provided
    baseline.runtimeState = null;
  }

  // Write formatted JSON
  await fs.writeFile(
    outputPath,
    JSON.stringify(baseline, null, 2),
    'utf-8'
  );
}
