import { describe, it, expect } from 'vitest';
import { formatPricingDataForLLM } from '../formatModelForLLM';

describe('Data Formatting Service', () => {
  const sampleInputs = {
    nSites: 1000,
    minDocs: 100,
    maxDocs: 500,
    pagesLease: 5,
    pagesDeed: 3,
    pagesLicence: 2,
    pagesPlan: 1,
    mixLease: 0.4,
    mixDeed: 0.3,
    mixLicence: 0.2,
    mixPlan: 0.1,
    qGood: 0.5,
    qMed: 0.3,
    qPoor: 0.2,
    rGood: 0.1,
    rMed: 0.3,
    rPoor: 0.5,
    reviewMinutes: 10,
    conflictMinutes: 20,
    ocrCostPer1000: 1.50,
    tokensPerPage: 500,
    llmCostPerMTokens: 0.25,
    pipelinePasses: 2,
    saDays: 5,
    mlDays: 10,
    beDays: 15,
    feDays: 12,
    devopsDays: 3,
    qaDays: 8,
    pmDays: 10,
    penTest: 2000,
    azureSearch: 150,
    appHosting: 200,
    monitoring: 50,
    supportHours: 40,
    supportRate: 100,
  };

  const sampleModel = {
    // Volume calculations
    N_docs: 300000,
    N_pages: 1200000,
    D: 300, // avg docs per site
    P_doc: 4, // avg pages per doc

    // Ingestion costs
    C_OCR: 1800,
    C_LLM: 15000,
    C_manual: 108200,
    ingestionTotalCost: 125000,

    // Ingestion pricing
    P_OCR: 2000,
    P_LLM: 16500,
    P_manual_eng: 150000,
    ingestionTotalPrice: 168500,

    // Build costs
    buildLaborCost: 150000,
    buildPassthroughCost: 50000,
    buildTotalCost: 200000,

    // Build pricing
    buildLaborPrice: 225000,
    buildPassthroughPrice: 55000,
    buildTotalPrice: 280000,

    // OPEX
    opexTotalCost: 25000,
    opexTotalPrice: 27500,
    opexAnnualCost: 300000,
    opexAnnualPrice: 330000,

    // CAPEX totals
    capexOneTimeCost: 325000,
    capexOneTimePrice: 448500,

    // Total quote
    totalQuoteCost: 625000,
    totalQuotePrice: 778500,

    // Margins
    grossMargin: 0.197,
    capexGrossMargin: 0.275,

    // Benchmarks
    benchManualTotal: 3600000,
    benchCompetitorTotal: 1500000,
    savingsVsManual: 3151500,
    savingsVsCompetitor: 1051500,

    // Cost drivers
    pctManualOfIngestion: 86.6,
    pctOCROfIngestion: 1.4,
    pctLLMOfIngestion: 12.0,
    pctManualOfTotal: 17.3,
    pctBuildOfTotal: 48.0,
    pctOPEXOfTotal: 48.0,

    // Config
    config: {
      laborMargin: 0.50,
      passthroughMargin: 0.10,
      targetMargin: 0.25,
    },
  };

  const sampleScenario = 'Standard';

  it('should include all input parameters', () => {
    const formatted = formatPricingDataForLLM(sampleInputs, sampleModel, sampleScenario);

    // Check for key input fields (human-readable labels)
    expect(formatted).toContain('Total Sites');
    expect(formatted).toContain('1,000');
    expect(formatted).toContain('Minimum Documents');
    expect(formatted).toContain('Maximum Documents');
    expect(formatted).toContain('Lease Pages');
    expect(formatted).toContain('Lease Documents');
    expect(formatted).toContain('Good Quality');
    expect(formatted).toContain('Good Quality Review Rate');
  });

  it('should include cost calculations', () => {
    const formatted = formatPricingDataForLLM(sampleInputs, sampleModel, sampleScenario);

    // Check for cost components (with formatted numbers)
    expect(formatted).toContain('Ingestion CAPEX');
    expect(formatted).toContain('£125,000');
    expect(formatted).toContain('Build CAPEX');
    expect(formatted).toContain('£200,000');
    expect(formatted).toContain('Monthly OPEX');
    expect(formatted).toContain('£25,000');
    expect(formatted).toContain('Total Cost');
    expect(formatted).toContain('£325,000'); // CAPEX one-time cost
    expect(formatted).toContain('£625,000'); // Total quote cost (CAPEX + Annual OPEX)
  });

  it('should include margin analysis', () => {
    const formatted = formatPricingDataForLLM(sampleInputs, sampleModel, sampleScenario);

    // Check for margin components (with formatted currency)
    expect(formatted).toContain('CAPEX Price per Document');
    expect(formatted).toContain('£1'); // £448,500 / 300,000 docs
    expect(formatted).toContain('Total Price');
    expect(formatted).toContain('£448,500'); // CAPEX one-time price
    expect(formatted).toContain('£778,500'); // Total quote price
    expect(formatted).toContain('Total Profit');
    expect(formatted).toContain('£153,500'); // Total profit (Price - Cost)
    expect(formatted).toContain('Overall Gross Margin');
    expect(formatted).toContain('19.70'); // Gross margin percentage
  });

  it('should include scenario details', () => {
    const formatted = formatPricingDataForLLM(sampleInputs, sampleModel, sampleScenario);

    // Check for scenario information
    expect(formatted).toContain('Scenario');
    expect(formatted).toContain('Standard');
  });

  it('should format currency values with GBP symbol', () => {
    const formatted = formatPricingDataForLLM(sampleInputs, sampleModel, sampleScenario);

    // Check for GBP currency formatting
    expect(formatted).toMatch(/£[\d,]+/);
  });

  it('should produce readable structured text', () => {
    const formatted = formatPricingDataForLLM(sampleInputs, sampleModel, sampleScenario);

    // Check that output is non-empty string
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(100);

    // Check for section headers (readable structure)
    expect(formatted).toMatch(/[A-Z][a-z]+:/);
  });

  it('should include volume calculations', () => {
    const formatted = formatPricingDataForLLM(sampleInputs, sampleModel, sampleScenario);

    // Check for volume metrics (with formatted numbers)
    expect(formatted).toContain('Total Documents');
    expect(formatted).toContain('300,000');
    expect(formatted).toContain('Total Pages');
    expect(formatted).toContain('1,200,000');
  });
});
