import React from 'react';
import { describe, it, expect, test, vi } from 'vitest';
import { computeModel, defaultInputs, SCENARIO_CONFIGS } from '../../src/components/CornerstonePricingCalculator';

// Mock Streamdown component
vi.mock('streamdown', () => ({
  Streamdown: ({ children }) => <div>{children}</div>,
}));

describe('Manual Review Billing Logic - Business Logic Validation', () => {

  test('CRITICAL: billing should match the semantic description', () => {
    // WE ARE PROAPTUS (the vendor), CORNERSTONE is the client
    // The description says: "They know their data best; we provide exceptions, guidance, spot checks"
    // This means: Cornerstone (client) does MAJORITY of work, we (Proaptus) do MINORITY (spot checks)
    // Therefore: If ourManualReviewPct = 75, that should mean:
    //   - CORNERSTONE does 75% of the work (they know their data)
    //   - PROAPTUS (us) does 25% of the work (our spot checks)
    //   - PROAPTUS BILLS FOR 25% (not 75%)

    const inputs = { ...defaultInputs };
    const config = SCENARIO_CONFIGS.conservative;
    const model = computeModel(inputs, config);

    // Calculate total review hours
    const avgDocs = (inputs.minDocs + inputs.maxDocs) / 2;
    const totalDocs = inputs.nSites * avgDocs;
    const flaggedForReview = totalDocs * (
      inputs.qGood * inputs.rGood +
      inputs.qMed * inputs.rMed +
      inputs.qPoor * inputs.rPoor
    );
    const H_rev = (flaggedForReview * inputs.reviewMinutes) / 60;
    const H_conflict = inputs.nSites * (inputs.conflictMinutes / 60);
    const totalReviewHours = H_rev + H_conflict;

    // FIXED: Removed hardcoded 0.10 multiplier - scanning service is billed separately
    // No reduction multiplier - the split is already defined by ourManualReviewPct
    const effectiveTotalHours = totalReviewHours;

    // CORRECT LOGIC: If ourManualReviewPct = 75, Cornerstone does 75%, Proaptus (us) does 25%
    // So PROAPTUS BILLS FOR 25% (100 - 75 = 25)
    const expectedOurPortion = (100 - inputs.ourManualReviewPct) / 100; // 25%
    const expectedBilledHours = effectiveTotalHours * expectedOurPortion;
    const expectedBilledCost = expectedBilledHours * config.analystRate;

    // This test now PASSES with the corrected logic
    expect(model.C_manual).toBeCloseTo(expectedBilledCost, 2);
  });

  test('semantic meaning: ourManualReviewPct represents Cornerstone portion, NOT Proaptus portion', () => {
    // WE ARE PROAPTUS (vendor), CORNERSTONE is client
    // If the variable is called "ourManualReviewPct = 75"
    // The description says "they know their data best, we provide spot checks"
    // Variable represents: "What % does CORNERSTONE handle" (75% - they know their data)
    // Proaptus bills for: 100 - ourManualReviewPct (25%)

    const inputs = { ...defaultInputs, ourManualReviewPct: 80 }; // Cornerstone does 80%
    const config = SCENARIO_CONFIGS.conservative;
    const model = computeModel(inputs, config);

    // We should bill for 20% (100 - 80), not 80%

    const avgDocs = (inputs.minDocs + inputs.maxDocs) / 2;
    const totalDocs = inputs.nSites * avgDocs;
    const flaggedForReview = totalDocs * (
      inputs.qGood * inputs.rGood +
      inputs.qMed * inputs.rMed +
      inputs.qPoor * inputs.rPoor
    );
    const H_rev = (flaggedForReview * inputs.reviewMinutes) / 60;
    const H_conflict = inputs.nSites * (inputs.conflictMinutes / 60);
    const totalReviewHours = H_rev + H_conflict;
    // FIXED: No multiplier - scanning is billed separately
    const effectiveTotalHours = totalReviewHours;

    const expectedOurPortion = (100 - inputs.ourManualReviewPct) / 100; // 20%
    const expectedBilledCost = effectiveTotalHours * expectedOurPortion * config.analystRate;

    expect(model.C_manual).toBeCloseTo(expectedBilledCost, 2);
  });

  test('baseline: with ourManualReviewPct=75, Proaptus bills for 25% (spot checks), not 75%', () => {
    // WE ARE PROAPTUS (vendor), CORNERSTONE is client
    // Baseline has ourManualReviewPct = 75
    // Meaning: CORNERSTONE handles 75% (they know their data)
    // PROAPTUS handles 25% (spot checks, guidance, exceptions)
    // Therefore: PROAPTUS BILLS FOR 25%

    expect(defaultInputs.ourManualReviewPct).toBe(75);

    const inputs = { ...defaultInputs };
    const config = SCENARIO_CONFIGS.conservative;
    const model = computeModel(inputs, config);

    // Calculate what 25% billing should be
    const avgDocs = (inputs.minDocs + inputs.maxDocs) / 2;
    const totalDocs = inputs.nSites * avgDocs;
    const flaggedForReview = totalDocs * (
      inputs.qGood * inputs.rGood +
      inputs.qMed * inputs.rMed +
      inputs.qPoor * inputs.rPoor
    );
    const H_rev = (flaggedForReview * inputs.reviewMinutes) / 60;
    const H_conflict = inputs.nSites * (inputs.conflictMinutes / 60);
    const totalReviewHours = H_rev + H_conflict;
    // FIXED: No multiplier - scanning service is billed separately
    const effectiveTotalHours = totalReviewHours;

    const ourPortion = 0.25; // 25% - our spot checks
    const expectedBilledCost = effectiveTotalHours * ourPortion * config.analystRate;

    // Test now PASSES with corrected logic
    expect(model.C_manual).toBeCloseTo(expectedBilledCost, 2);
  });
});
