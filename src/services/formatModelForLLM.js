/**
 * Data Formatting Service
 * Converts pricing model data into LLM-friendly structured text
 */

/**
 * Format pricing data for LLM consumption
 * @param {Object} inputs - User inputs (assumptions)
 * @param {Object} model - Computed pricing model
 * @param {string} scenario - Selected scenario name
 * @returns {string} - Formatted structured text for LLM context
 */
export function formatPricingDataForLLM(inputs, model, scenario) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-GB').format(value);
  };

  return `
# Cornerstone Pricing Model - ${scenario} Scenario

## Key Inputs

### Volume Assumptions
- Total Sites: ${formatNumber(inputs.nSites)}
- Minimum Documents per Site: ${formatNumber(inputs.minDocs)}
- Maximum Documents per Site: ${formatNumber(inputs.maxDocs)}

### Document Mix
- Lease Documents: ${(inputs.mixLease * 100).toFixed(1)}%
- Deed Documents: ${(inputs.mixDeed * 100).toFixed(1)}%
- Licence Documents: ${(inputs.mixLicence * 100).toFixed(1)}%
- Plan Documents: ${(inputs.mixPlan * 100).toFixed(1)}%

### Pages per Document Type
- Lease Pages: ${inputs.pagesLease}
- Deed Pages: ${inputs.pagesDeed}
- Licence Pages: ${inputs.pagesLicence}
- Plan Pages: ${inputs.pagesPlan}

### Quality Distribution
- Good Quality: ${(inputs.qGood * 100).toFixed(1)}%
- Medium Quality: ${(inputs.qMed * 100).toFixed(1)}%
- Poor Quality: ${(inputs.qPoor * 100).toFixed(1)}%

### Review Rates
- Good Quality Review Rate: ${(inputs.rGood * 100).toFixed(1)}%
- Medium Quality Review Rate: ${(inputs.rMed * 100).toFixed(1)}%
- Poor Quality Review Rate: ${(inputs.rPoor * 100).toFixed(1)}%

### Review Time
- Review Minutes per Document: ${inputs.reviewMinutes}
- Conflict Resolution Minutes: ${inputs.conflictMinutes}

### AI/OCR Costs
- OCR Cost per 1,000 Pages: ${formatCurrency(inputs.ocrCostPer1000)}
- Tokens per Page: ${formatNumber(inputs.tokensPerPage)}
- LLM Cost per Million Tokens: ${formatCurrency(inputs.llmCostPerMTokens)}
- Pipeline Passes: ${inputs.pipelinePasses}

### Team Days (Build Phase)
- Solution Architect Days: ${inputs.saDays}
- ML Engineer Days: ${inputs.mlDays}
- Backend Developer Days: ${inputs.beDays}
- Frontend Developer Days: ${inputs.feDays}
- DevOps Days: ${inputs.devopsDays}
- QA Days: ${inputs.qaDays}
- Project Manager Days: ${inputs.pmDays}

### Other Costs
- Penetration Testing: ${formatCurrency(inputs.penTest)}
- Azure Search (monthly): ${formatCurrency(inputs.azureSearch)}
- App Hosting (monthly): ${formatCurrency(inputs.appHosting)}
- Monitoring (monthly): ${formatCurrency(inputs.monitoring)}
- Support Hours (monthly): ${inputs.supportHours}
- Support Rate (per hour): ${formatCurrency(inputs.supportRate)}

## Calculated Volumes

- Total Documents: ${formatNumber(model.N_docs || 0)}
- Total Pages: ${formatNumber(model.N_pages || 0)}
- Average Documents per Site: ${formatNumber(model.D || 0)}
- Pages per Document (weighted average): ${formatNumber(model.P_doc || 0)}

## PART 1: Cost Breakdown (Internal Costs - What It Costs Cornerstone)

### Ingestion CAPEX (One-Time Internal Cost)
- OCR Cost (Internal): ${formatCurrency(model.C_OCR || 0)}
- LLM/AI Extraction Cost (Internal): ${formatCurrency(model.C_LLM || 0)}
- Manual Review Cost (Internal): ${formatCurrency(model.C_manual || 0)}
- **Total Ingestion CAPEX Cost (Internal)**: ${formatCurrency(model.ingestionTotalCost || 0)}

### Build CAPEX (One-Time Internal Cost)
- Labor Cost - Engineering (Internal): ${formatCurrency(model.buildLaborCost || 0)}
- Passthrough Cost - Pen-test, etc. (Internal): ${formatCurrency(model.buildPassthroughCost || 0)}
- **Total Build CAPEX Cost (Internal)**: ${formatCurrency(model.buildTotalCost || 0)}

### TOTAL ONE-TIME CAPEX COST (INTERNAL)
**${formatCurrency(model.capexOneTimeCost || 0)}** = Ingestion ${formatCurrency(model.ingestionTotalCost || 0)} + Build ${formatCurrency(model.buildTotalCost || 0)}

### Monthly OPEX (Recurring Internal Cost)
- Monthly Infrastructure Cost (Internal): ${formatCurrency(model.opexTotalCost || 0)}
- **Annual OPEX Cost (Internal - Monthly × 12)**: ${formatCurrency(model.opexAnnualCost || 0)}

## PART 2: Pricing Breakdown (Client Quote - What Client Pays)

### Ingestion CAPEX Pricing (Client Quote)
- OCR Price (Client Pays): ${formatCurrency(model.P_OCR || 0)}
- LLM/AI Extraction Price (Client Pays): ${formatCurrency(model.P_LLM || 0)}
- Manual Review Price (Client Pays): ${formatCurrency(model.P_manual_eng || 0)}
- **Total Ingestion CAPEX Price (Client Pays)**: ${formatCurrency(model.ingestionTotalPrice || 0)}

### Build CAPEX Pricing (Client Quote)
- Labor Price - Engineering (Client Pays): ${formatCurrency(model.buildLaborPrice || 0)}
- Passthrough Price - Pen-test, etc. (Client Pays): ${formatCurrency(model.buildPassthroughPrice || 0)}
- **Total Build CAPEX Price (Client Pays)**: ${formatCurrency(model.buildTotalPrice || 0)}

### TOTAL ONE-TIME CAPEX PRICE (CLIENT PAYS)
**${formatCurrency(model.capexOneTimePrice || 0)}** = Ingestion ${formatCurrency(model.ingestionTotalPrice || 0)} + Build ${formatCurrency(model.buildTotalPrice || 0)}

### Annual OPEX Pricing (Client Quote)
- **Monthly OPEX Price (Client Pays)**: ${formatCurrency(model.opexTotalPrice || 0)}
- **Annual OPEX Price (Client Pays - Monthly × 12)**: ${formatCurrency(model.opexAnnualPrice || 0)}

## Margin Analysis (CAPEX Only)

### Scenario Configuration
- Scenario Name: ${scenario}
- Labor Margin Target: ${(((model.config && model.config.laborMargin) || 0) * 100).toFixed(1)}%
- Passthrough Margin Target: ${(((model.config && model.config.passthroughMargin) || 0) * 100).toFixed(1)}%
- Overall CAPEX Margin Target: ${(((model.config && model.config.targetMargin) || 0) * 100).toFixed(1)}%

### CAPEX Financial Summary (One-Time Implementation)
- **Total CAPEX Cost (Internal)**: ${formatCurrency(model.capexOneTimeCost || 0)}
- **Total CAPEX Price (Client Quote)**: ${formatCurrency(model.capexOneTimePrice || 0)}
- **CAPEX Profit (Price - Cost)**: ${formatCurrency((model.capexOneTimePrice || 0) - (model.capexOneTimeCost || 0))}
- **CAPEX Gross Margin (Profit ÷ Price × 100)**: ${((model.capexGrossMargin || 0) * 100).toFixed(2)}%
- **Variance from Target**: ${(((model.capexGrossMargin || 0) * 100) - ((model.config && model.config.targetMargin || 0) * 100)).toFixed(2)}% (${((model.capexGrossMargin || 0) * 100) >= ((model.config && model.config.targetMargin || 0) * 100) ? 'On Target ✓' : 'Below Target'})

### Per-Document Pricing
- **CAPEX Price per Document**: ${formatCurrency((model.capexOneTimePrice || 0) / (model.N_docs || 1))} (Total CAPEX Price ÷ ${formatNumber(model.N_docs || 0)} docs)

## Competitive Benchmarks

- Manual Abstraction Total: ${formatCurrency(model.benchManualTotal || 0)} (at £12/doc)
- Competitor Software Vendor: ${formatCurrency(model.benchCompetitorTotal || 0)} (at £5/doc)
- **Cornerstone AI Total**: ${formatCurrency(model.capexOneTimePrice || 0)} (at ${formatCurrency((model.capexOneTimePrice || 0) / (model.N_docs || 1))}/doc)
- **Savings vs Manual**: ${formatCurrency(model.savingsVsManual || 0)} (${(((model.savingsVsManual || 0) / (model.benchManualTotal || 1)) * 100).toFixed(1)}% cheaper)
- **Savings vs Competitor**: ${formatCurrency(model.savingsVsCompetitor || 0)} (${(((model.savingsVsCompetitor || 0) / (model.benchCompetitorTotal || 1)) * 100).toFixed(1)}% cheaper)

## Cost Driver Analysis

### Ingestion CAPEX Component Breakdown (% of Ingestion Cost)
- Manual Review as % of Ingestion CAPEX Cost: ${(model.pctManualOfIngestion || 0).toFixed(1)}%
- OCR as % of Ingestion CAPEX Cost: ${(model.pctOCROfIngestion || 0).toFixed(1)}%
- LLM as % of Ingestion CAPEX Cost: ${(model.pctLLMOfIngestion || 0).toFixed(1)}%

### Overall Cost Breakdown (% of Total Quote Cost = CAPEX + Annual OPEX)
- Manual Review as % of Total Quote Cost: ${(model.pctManualOfTotal || 0).toFixed(1)}%
- Build CAPEX as % of Total Quote Cost: ${(model.pctBuildOfTotal || 0).toFixed(1)}%
- Annual OPEX as % of Total Quote Cost: ${(model.pctOPEXOfTotal || 0).toFixed(1)}%

Note: Total Quote Cost = ${formatCurrency(model.totalQuoteCost || 0)} (CAPEX ${formatCurrency(model.capexOneTimeCost || 0)} + Annual OPEX ${formatCurrency(model.opexAnnualCost || 0)})

## Summary

This pricing model for the **${scenario} scenario** covers ${formatNumber(inputs.nSites)} sites with an estimated ${formatNumber(model.N_docs || 0)} documents (${formatNumber(model.D || 0)} docs/site) and ${formatNumber(model.N_pages || 0)} pages.

### Total Quote (CAPEX + Annual OPEX Combined)
- **Total Cost (Internal - CAPEX + Annual OPEX)**: ${formatCurrency(model.totalQuoteCost || 0)}
- **Total Price (Client Quote - CAPEX + Annual OPEX)**: ${formatCurrency(model.totalQuotePrice || 0)}
- **Total Profit (Price - Cost)**: ${formatCurrency((model.totalQuotePrice || 0) - (model.totalQuoteCost || 0))}
- **Overall Gross Margin (Total including both CAPEX and OPEX)**: ${((model.grossMargin || 0) * 100).toFixed(2)}%

### Components Breakdown
- **One-time CAPEX Price**: ${formatCurrency(model.capexOneTimePrice || 0)} (Ingestion + Platform Build)
  - CAPEX-only Margin: ${((model.capexGrossMargin || 0) * 100).toFixed(2)}%
- **Annual OPEX Price**: ${formatCurrency(model.opexAnnualPrice || 0)} (${formatCurrency(model.opexTotalPrice || 0)}/month)
`.trim();
}
