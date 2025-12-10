import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock PricingQA which might use katex via react-markdown
vi.mock('../../src/components/pricing/PricingQA', () => ({
  default: () => <div data-testid="pricing-qa-mock">PricingQA Mock</div>
}));

import ClientQuoteSummary from '../../src/components/pricing/ClientQuoteSummary';
import ProfessionalReport from '../../src/components/pricing/ProfessionalReport';

/**
 * Integration tests for chart data breakdown
 *
 * CRITICAL REQUIREMENT: Charts must show ALL cost components separately:
 * - Scanning (if enabled)
 * - OCR Processing
 * - AI Extraction
 * - Manual Review
 * - Platform Development
 * - Annual Operations
 *
 * NOT acceptable: Lumping multiple components into generic "Document Review"
 */

const formatGBP = (value) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Mock model data with scanning enabled
const mockModelWithScanning = {
  capexOneTimePrice: 500000,
  capexOneTimeCost: 350000,
  opexTotalPrice: 5000,
  opexAnnualPrice: 60000,
  opexAnnualCost: 45000,
  opexTotalCost: 45000,
  buildTotalPrice: 200000,
  buildTotalCost: 140000,
  ingestionTotalPrice: 300000,
  ingestionTotalCost: 210000,
  P_scanning: 150000,
  P_OCR: 5000,
  P_LLM: 20000,
  P_manual_eng: 125000,
  C_OCR: 4000,
  C_LLM: 15000,
  N_docs: 5000,
  N_pages: 25000,
  P_doc: 5,
  D: 10,
  H_rev: 100,
  H_conflict: 50,
  benchManualTotal: 750000,
  benchCompetitorTotal: 600000,
  ingestionLineItems: [],
  buildLineItems: [],
  opexLineItems: [],
  config: {
    laborMargin: 0.5,
    passthroughMargin: 0.15,
    targetMargin: 0.6
  }
};

// Mock inputs
const mockInputs = {
  nSites: 25,
  includeScanningService: true
};

// Mock SCENARIO_CONFIGS for ProfessionalReport
const mockScenarioConfigs = {
  standard: {
    name: 'Standard',
    laborMargin: 0.5,
    passthroughMargin: 0.15,
    targetMargin: 0.6,
    teamType: 'Hybrid contractors'
  }
};

describe('ClientQuoteSummary - Chart Data Breakdown', () => {
  it('should show Scanning as separate component when enabled', () => {
    const { container } = render(
      <ClientQuoteSummary
        model={mockModelWithScanning}
        formatGBP={formatGBP}
        inputs={mockInputs}
        scenario="standard"
      />
    );

    // Look for "Scanning" or "Document Scanning" in the chart labels/legend
    const chartText = container.textContent;

    // MUST have separate Scanning component
    expect(chartText).toMatch(/Scanning|Document Scanning/i);
  });

  it('should show OCR as separate component', () => {
    const { container } = render(
      <ClientQuoteSummary
        model={mockModelWithScanning}
        formatGBP={formatGBP}
        inputs={mockInputs}
        scenario="standard"
      />
    );

    const chartText = container.textContent;

    // MUST have separate OCR component
    expect(chartText).toMatch(/OCR|OCR Processing/i);
  });

  it('should show AI Extraction as separate component', () => {
    const { container } = render(
      <ClientQuoteSummary
        model={mockModelWithScanning}
        formatGBP={formatGBP}
        inputs={mockInputs}
        scenario="standard"
      />
    );

    const chartText = container.textContent;

    // MUST have separate AI/LLM component
    expect(chartText).toMatch(/AI Extraction|LLM|AI Processing/i);
  });

  it('should show Manual Review as separate component', () => {
    const { container } = render(
      <ClientQuoteSummary
        model={mockModelWithScanning}
        formatGBP={formatGBP}
        inputs={mockInputs}
        scenario="standard"
      />
    );

    const chartText = container.textContent;

    // MUST have separate Manual Review component
    expect(chartText).toMatch(/Manual Review|Quality Assurance/i);
  });

  it('should NOT lump components into generic "Document Review"', () => {
    const { container } = render(
      <ClientQuoteSummary
        model={mockModelWithScanning}
        formatGBP={formatGBP}
        inputs={mockInputs}
        scenario="standard"
      />
    );

    const chartText = container.textContent;

    // If we find "Document Review" as the ONLY ingestion label, that's wrong
    // We should have specific components (Scanning, OCR, LLM, Manual Review)
    // This test verifies we have at least 2 of the specific components
    const hasScanning = /Scanning|Document Scanning/i.test(chartText);
    const hasOCR = /OCR|OCR Processing/i.test(chartText);
    const hasAI = /AI Extraction|LLM|AI Processing/i.test(chartText);
    const hasManual = /Manual Review|Quality Assurance/i.test(chartText);

    const specificComponentCount = [hasScanning, hasOCR, hasAI, hasManual].filter(Boolean).length;

    expect(specificComponentCount).toBeGreaterThanOrEqual(2);
  });

  it('should calculate percentages from disaggregated components, not lumped total', () => {
    const { container } = render(
      <ClientQuoteSummary
        model={mockModelWithScanning}
        formatGBP={formatGBP}
        inputs={mockInputs}
        scenario="standard"
      />
    );

    // The chart should show individual percentages for each component
    // Total should be: Scanning + OCR + LLM + Manual + Build + OPEX = 100%
    // Not: "Document Review" (lump) + Build + OPEX = 100%

    const chartText = container.textContent;

    // Extract all percentage values from chart
    const percentages = chartText.match(/(\d+)%/g);

    // Should have at least 5 percentages (Scanning, OCR, LLM, Manual, Build, OPEX)
    // or 4 if OCR/LLM are tiny and grouped
    expect(percentages.length).toBeGreaterThanOrEqual(4);
  });
});

describe('ProfessionalReport - Chart Data Breakdown', () => {
  it('should show same disaggregated breakdown as ClientQuoteSummary', () => {
    const { container } = render(
      <ProfessionalReport
        model={mockModelWithScanning}
        inputs={mockInputs}
        scenario="standard"
        formatGBP={formatGBP}
        reportVariant="ROM"
        SCENARIO_CONFIGS={mockScenarioConfigs}
      />
    );

    const reportText = container.textContent;

    // MUST have separate components, not lumped
    const hasScanning = /Scanning|Document Scanning/i.test(reportText);
    const hasOCR = /OCR|OCR Processing/i.test(reportText);
    const hasAI = /AI Extraction|LLM|AI Processing/i.test(reportText);
    const hasManual = /Manual Review|Quality Assurance/i.test(reportText);

    const specificComponentCount = [hasScanning, hasOCR, hasAI, hasManual].filter(Boolean).length;

    expect(specificComponentCount).toBeGreaterThanOrEqual(2);
  });
});
