import { describe, it, expect } from 'vitest';
import { buildDocumentationContext } from '../documentationLoader';
import { formatPricingDataForLLM } from '../formatModelForLLM';
import { buildSystemPrompt } from '../qaSystemPrompt';

/**
 * Token Size Calculation Tests
 * Estimates the token count for API calls to help understand cost and context usage
 *
 * Note: Using rough approximation of 1 token ≈ 4 characters for English text
 * Actual token count varies by tokenizer, but this gives a good estimate
 */
describe('Token Size Calculation', () => {
  const sampleInputs = {
    nSites: 17000,
    minDocs: 100,
    maxDocs: 500,
    scanningEnabled: true,
    mixLease: 0.5,
    mixDeed: 0.1,
    mixLicence: 0.1,
    mixPlan: 0.3,
    pagesLease: 25,
    pagesDeed: 3,
    pagesLicence: 3,
    pagesPlan: 5,
    qGood: 0.5,
    qMed: 0.35,
    qPoor: 0.15,
    rGood: 0.05,
    rMed: 0.15,
    rPoor: 0.25,
    reviewMinutes: 10,
    conflictMinutes: 30,
    ocrCostPer1000: 7,
    tokensPerPage: 300,
    llmCostPerMTokens: 5,
    pipelinePasses: 2,
    saDays: 10,
    mlDays: 15,
    beDays: 20,
    feDays: 15,
    devopsDays: 10,
    qaDays: 10,
    pmDays: 8,
    penTest: 7000,
    azureSearch: 500,
    appHosting: 300,
    monitoring: 200,
    supportHours: 10,
    supportRate: 150,
    ourManualReviewPct: 15,
  };

  const sampleModel = {
    N_docs: 127500,
    N_pages: 1275000,
    D: 7.5,
    P_doc: 10,
    C_OCR: 8925,
    C_LLM: 3825,
    C_manual: 19125,
    ingestionTotalCost: 31875,
    buildLaborCost: 80000,
    buildPassthroughCost: 7000,
    buildTotalCost: 87000,
    capexOneTimeCost: 118875,
    opexTotalCost: 2500,
    opexAnnualCost: 30000,
    P_OCR: 10028,
    P_LLM: 4298,
    P_manual_eng: 21489,
    ingestionTotalPrice: 35815,
    buildLaborPrice: 124000,
    buildPassthroughPrice: 7700,
    buildTotalPrice: 131700,
    capexOneTimePrice: 167515,
    opexTotalPrice: 2875,
    opexAnnualPrice: 34500,
    capexGrossMargin: 0.29,
    grossMargin: 0.25,
    benchManualTotal: 12750000,
    benchCompetitorTotal: 6375000,
    savingsVsManual: 12582485,
    savingsVsCompetitor: 6207485,
    totalQuoteCost: 148875,
    totalQuotePrice: 202015,
    config: {
      laborMargin: 0.55,
      passthroughMargin: 0.1,
      targetMargin: 0.6,
    },
  };

  const scenario = 'Standard';

  /**
   * Estimate token count from character count
   * Using rough approximation: 1 token ≈ 4 characters
   */
  function estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  it('should calculate size of documentation context', async () => {
    const documentation = await buildDocumentationContext();

    const charCount = documentation.length;
    const estimatedTokens = estimateTokens(documentation);

    console.log('\n📚 DOCUMENTATION CONTEXT SIZE:');
    console.log(`   Characters: ${charCount.toLocaleString()}`);
    console.log(`   Estimated Tokens: ${estimatedTokens.toLocaleString()}`);

    expect(charCount).toBeGreaterThan(0);
    expect(estimatedTokens).toBeGreaterThan(0);
  });

  it('should calculate size of pricing data', () => {
    const pricingData = formatPricingDataForLLM(sampleInputs, sampleModel, scenario);

    const charCount = pricingData.length;
    const estimatedTokens = estimateTokens(pricingData);

    console.log('\n💰 PRICING DATA SIZE:');
    console.log(`   Characters: ${charCount.toLocaleString()}`);
    console.log(`   Estimated Tokens: ${estimatedTokens.toLocaleString()}`);

    expect(charCount).toBeGreaterThan(0);
    expect(estimatedTokens).toBeGreaterThan(0);
  });

  it('should calculate total system prompt size (SSOT pattern)', async () => {
    const documentation = await buildDocumentationContext();
    const systemPrompt = buildSystemPrompt(documentation);

    const charCount = systemPrompt.length;
    const estimatedTokens = estimateTokens(systemPrompt);

    console.log('\n🤖 COMPLETE SYSTEM PROMPT SIZE (API CALL CONTEXT):');
    console.log(`   Characters: ${charCount.toLocaleString()}`);
    console.log(`   Estimated Tokens: ${estimatedTokens.toLocaleString()}`);
    console.log(`   Estimated Cost (Claude Sonnet 4.5 @ $3/MTok): $${(estimatedTokens / 1_000_000 * 3).toFixed(4)}`);
    console.log(`   Estimated Cost (GPT-4 @ $10/MTok): $${(estimatedTokens / 1_000_000 * 10).toFixed(4)}`);

    expect(charCount).toBeGreaterThan(0);
    expect(estimatedTokens).toBeGreaterThan(0);
  });

  it('should calculate system prompt size without documentation (minimal)', () => {
    const systemPrompt = buildSystemPrompt(''); // No documentation

    const charCount = systemPrompt.length;
    const estimatedTokens = estimateTokens(systemPrompt);

    console.log('\n📊 MINIMAL SYSTEM PROMPT SIZE (No Documentation):');
    console.log(`   Characters: ${charCount.toLocaleString()}`);
    console.log(`   Estimated Tokens: ${estimatedTokens.toLocaleString()}`);
    console.log(`   Estimated Cost (Claude Sonnet 4.5 @ $3/MTok): $${(estimatedTokens / 1_000_000 * 3).toFixed(4)}`);

    expect(charCount).toBeGreaterThan(0);
    expect(estimatedTokens).toBeGreaterThan(0);
  });

  it('should calculate overhead from documentation addition', async () => {
    // Without documentation (minimal prompt)
    const minimalPrompt = buildSystemPrompt('');
    const minimalTokens = estimateTokens(minimalPrompt);

    // With documentation (full context)
    const documentation = await buildDocumentationContext();
    const fullPrompt = buildSystemPrompt(documentation);
    const fullTokens = estimateTokens(fullPrompt);

    const additionalTokens = fullTokens - minimalTokens;
    const percentIncrease = ((additionalTokens / minimalTokens) * 100).toFixed(1);

    console.log('\n📈 DOCUMENTATION OVERHEAD:');
    console.log(`   Additional Tokens: ${additionalTokens.toLocaleString()}`);
    console.log(`   Percent Increase: ${percentIncrease}%`);
    console.log(`   Additional Cost per Call (Claude Sonnet 4.5): $${(additionalTokens / 1_000_000 * 3).toFixed(4)}`);

    expect(additionalTokens).toBeGreaterThan(0);
  });

  it('should provide token budget recommendations', async () => {
    const documentation = await buildDocumentationContext();
    const systemPrompt = buildSystemPrompt(documentation);

    const systemTokens = estimateTokens(systemPrompt);
    const userQuestionTokens = 50; // Assume average user question is ~50 tokens
    const responseTokens = 500; // Assume average response is ~500 tokens

    const totalPerCall = systemTokens + userQuestionTokens + responseTokens;

    console.log('\n💡 RECOMMENDED TOKEN BUDGETS:');
    console.log(`   System Prompt: ${systemTokens.toLocaleString()} tokens`);
    console.log(`   User Question (avg): ${userQuestionTokens} tokens`);
    console.log(`   LLM Response (avg): ${responseTokens} tokens`);
    console.log(`   Total per Call: ${totalPerCall.toLocaleString()} tokens`);
    console.log(`   Cost per Call (Claude Sonnet 4.5): $${((systemTokens * 3 + (userQuestionTokens + responseTokens) * 15) / 1_000_000).toFixed(4)}`);
    console.log(`   Max Context (200K): ${Math.floor(200000 / totalPerCall)} calls`);
    console.log(`   Max Context (128K): ${Math.floor(128000 / totalPerCall)} calls`);

    expect(totalPerCall).toBeGreaterThan(0);
  });
});
