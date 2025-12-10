import React from 'react';
import { describe, it, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { computeModel, defaultInputs, SCENARIO_CONFIGS } from '../../src/components/CornerstonePricingCalculator';
import CostBreakdownWaterfall from '../../src/components/pricing/CostBreakdownWaterfall';

// Mock Streamdown component
vi.mock('streamdown', () => ({
  Streamdown: ({ children }) => <div>{children}</div>,
}));

describe('Cost Semantics - Business Logic & Text Correctness', () => {

  // ========================================================================
  // ISSUE 1: OCR COST SEMANTICS
  // ========================================================================

  test('CRITICAL: OCR should NOT be £0 when scanning enabled - scanning creates images, OCR reads them', () => {
    // BUSINESS LOGIC:
    // - Scanning Service = Physical prep + scanning hardware → creates IMAGES
    // - OCR = Azure cloud service → converts IMAGES to machine-readable TEXT
    // - These are SEPARATE billable services!
    //
    // COMPETITIVE ANALYSIS (REF-2025-11-scanning-competitive-analysis) states:
    // "DIY Alternative = Paper Escape (£0.02-£0.04) + Azure OCR (£0.001) + manual classification"
    // This proves OCR is a SEPARATE service that runs AFTER scanning

    const inputs = {
      ...defaultInputs,
      includeScanningService: true
    };
    const config = SCENARIO_CONFIGS.conservative;
    const model = computeModel(inputs, config);

    // Calculate expected OCR cost (Azure pricing £1.50 per 1,000 pages = £0.0015/page)
    const totalPages = model.N_pages;
    const expectedOCRCost = (totalPages / 1000) * inputs.ocrCostPer1000;

    // ASSERTION: OCR should have a cost even when scanning is enabled
    // Current WRONG logic: C_OCR = inputs.includeScanningService ? 0 : (...)
    // This test will FAIL because current code sets OCR to £0 when scanning enabled
    expect(model.C_OCR).toBeGreaterThan(0);
    expect(model.C_OCR).toBeCloseTo(expectedOCRCost, 2);
  });

  test('scanning and OCR are separate line items with separate costs', () => {
    // When both scanning and OCR are enabled:
    // 1. Scanning service should have a cost (physical handling)
    // 2. OCR should have a cost (text extraction from scanned images)
    // 3. Both should appear as separate billable items

    const inputs = {
      ...defaultInputs,
      includeScanningService: true
    };
    const config = SCENARIO_CONFIGS.conservative;
    const model = computeModel(inputs, config);

    // Both should have costs
    expect(model.C_scanning).toBeGreaterThan(0);
    expect(model.C_OCR).toBeGreaterThan(0);

    // They should be different costs (not the same service)
    expect(model.C_scanning).not.toBe(model.C_OCR);

    // OCR should be much cheaper per page than scanning
    // (Azure OCR ~£0.0015/page vs Scanning ~£0.05/page)
    const ocrPerPage = model.C_OCR / model.N_pages;
    const scanningPerPage = model.C_scanning / model.N_pages;
    expect(ocrPerPage).toBeLessThan(scanningPerPage);
  });

  test('ingestion passthrough cost includes both scanning equipment AND OCR when scanning enabled', () => {
    // COST STRUCTURE:
    // Ingestion Passthrough = OCR + LLM + Scanning Equipment (when enabled)
    // Ingestion Labor = Manual Review + Scanning Labor (when enabled)

    const inputs = {
      ...defaultInputs,
      includeScanningService: true
    };
    const config = SCENARIO_CONFIGS.conservative;
    const model = computeModel(inputs, config);

    // Calculate expected passthrough cost
    const expectedPassthrough =
      model.C_OCR +
      model.C_LLM +
      model.scanningResult.scanningPassthroughCost;

    // This will FAIL because current code excludes OCR from passthrough when scanning enabled
    expect(model.ingestionPassthroughCost).toBeCloseTo(expectedPassthrough, 2);
  });

  // ========================================================================
  // ISSUE 2: MANUAL REVIEW BILLING TEXT SEMANTICS
  // ========================================================================

  test('CRITICAL: billing text should say "we bill (100 - ourManualReviewPct)%" not "we bill ourManualReviewPct%"', () => {
    // BUSINESS LOGIC:
    // - ourManualReviewPct = 75 means "Proaptus handles 75% (they know their data)"
    // - We handle remaining 25% (our spot checks, guidance, exceptions)
    // - Therefore we BILL FOR 25%, not 75%
    //
    // SEMANTIC CORRECTNESS:
    // Text should say: "Cornerstone bills 25%" (not "bills the first 75%")

    const inputs = {
      ...defaultInputs,
      ourManualReviewPct: 75
    };
    const config = SCENARIO_CONFIGS.conservative;
    const model = computeModel(inputs, config);

    const formatGBP = (val) => `£${val.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;

    // Render the CostBreakdownWaterfall component
    render(
      <CostBreakdownWaterfall
        model={model}
        inputs={inputs}
        formatGBP={formatGBP}
      />
    );

    // The text should say "Cornerstone bills 25%" (the portion we actually bill)
    // NOT "Cornerstone bills the first 75%" (which is Proaptus's portion)

    // Current WRONG text: "Cornerstone bills the first {inputs.ourManualReviewPct}%"
    // This test will FAIL because current text shows 75% instead of 25%

    const ourBilledPct = 100 - inputs.ourManualReviewPct; // 25%
    const billingTextRegex = new RegExp(`Cornerstone bills.*${ourBilledPct}%`, 'i');

    expect(screen.getByText(billingTextRegex)).toBeInTheDocument();
  });

  test('billing text should explain that ourManualReviewPct represents Proaptus portion, not ours', () => {
    // SEMANTIC CLARITY:
    // The text should make it clear that:
    // - ourManualReviewPct = what Proaptus handles
    // - (100 - ourManualReviewPct) = what we handle and bill for

    const inputs = {
      ...defaultInputs,
      ourManualReviewPct: 80  // Proaptus handles 80%
    };
    const config = SCENARIO_CONFIGS.conservative;
    const model = computeModel(inputs, config);

    const formatGBP = (val) => `£${val.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;

    render(
      <CostBreakdownWaterfall
        model={model}
        inputs={inputs}
        formatGBP={formatGBP}
      />
    );

    // Text should mention both portions with correct semantics:
    // - "Cornerstone bills 20%" (what we do)
    // - "Proaptus handles 80%" (what they do)

    const ourPct = 100 - inputs.ourManualReviewPct; // 20%
    const proaptusText = new RegExp(`Proaptus.*${inputs.ourManualReviewPct}%`, 'i');
    const ourText = new RegExp(`Cornerstone bills.*${ourPct}%`, 'i');

    // This will FAIL because current text doesn't clarify Proaptus vs Cornerstone portions
    expect(screen.getByText(proaptusText)).toBeInTheDocument();
    expect(screen.getByText(ourText)).toBeInTheDocument();
  });

  test('cost breakdown text should adapt when ourManualReviewPct changes', () => {
    // DYNAMIC SEMANTICS:
    // If user changes ourManualReviewPct from 75% to 50%:
    // - Proaptus portion changes from 75% to 50%
    // - Our portion changes from 25% to 50%
    // - Text should reflect new percentages

    const inputs1 = { ...defaultInputs, ourManualReviewPct: 75 };
    const inputs2 = { ...defaultInputs, ourManualReviewPct: 50 };
    const config = SCENARIO_CONFIGS.conservative;

    const model1 = computeModel(inputs1, config);
    const model2 = computeModel(inputs2, config);

    const formatGBP = (val) => `£${val.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;

    // Render with 75% Proaptus portion
    const { rerender } = render(
      <CostBreakdownWaterfall
        model={model1}
        inputs={inputs1}
        formatGBP={formatGBP}
      />
    );

    // Should show "Cornerstone bills 25%"
    expect(screen.getByText(/Cornerstone bills.*25%/i)).toBeInTheDocument();

    // Rerender with 50% Proaptus portion
    rerender(
      <CostBreakdownWaterfall
        model={model2}
        inputs={inputs2}
        formatGBP={formatGBP}
      />
    );

    // Should now show "Cornerstone bills 50%"
    // This will FAIL because current text uses ourManualReviewPct directly
    expect(screen.getByText(/Cornerstone bills.*50%/i)).toBeInTheDocument();
  });

  // ========================================================================
  // SEMANTIC VALIDATION: Machine Costs Text
  // ========================================================================

  test('machine costs text should show OCR + LLM even when scanning enabled', () => {
    // TEXT SEMANTICS:
    // "Machine costs remain minimal: OCR £X + LLM £Y = £Z"
    // Should show BOTH OCR and LLM costs even when scanning is enabled

    const inputs = {
      ...defaultInputs,
      includeScanningService: true
    };
    const config = SCENARIO_CONFIGS.conservative;
    const model = computeModel(inputs, config);

    const formatGBP = (val) => `£${val.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;

    render(
      <CostBreakdownWaterfall
        model={model}
        inputs={inputs}
        formatGBP={formatGBP}
      />
    );

    // Text should mention both OCR and LLM with actual costs
    // Current WRONG behavior: Shows "OCR £0" when scanning enabled
    // This test will FAIL
    expect(screen.getByText(/OCR £\d+/i)).toBeInTheDocument();
    expect(screen.getByText(/LLM £\d+/i)).toBeInTheDocument();
  });
});
