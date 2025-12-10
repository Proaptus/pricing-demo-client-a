import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FileJson, Printer, LogOut } from 'lucide-react';

// Shared utilities
import formatGBP from './pricing/shared/formatGBP';
import CostPriceRow from './pricing/shared/CostPriceRow';
import ValidationAlert from './pricing/shared/ValidationAlert';
import PricingSection from './pricing/shared/PricingSection';

// Input components
import ScenarioSelector from './pricing/ScenarioSelector';
import KeyAssumptions from './pricing/KeyAssumptions';
import AdvancedAssumptions from './pricing/AdvancedAssumptions';
import ScanningConfiguration from './pricing/ScanningConfiguration';
import AssumptionsSummary from './pricing/AssumptionsSummary';

// Table components
import IngestionCapexTable from './pricing/IngestionCapexTable';
import BuildCapexTable from './pricing/BuildCapexTable';
import MonthlyOpexTable from './pricing/MonthlyOpexTable';

// Summary components
import ClientQuoteSummary from './pricing/ClientQuoteSummary';
import ScenarioComparison from './pricing/ScenarioComparison';

// Analysis components
import MarginAnalysis from './pricing/MarginAnalysis';
import CompetitiveBenchmarking from './pricing/CompetitiveBenchmarking';
import CostBreakdownWaterfall from './pricing/CostBreakdownWaterfall';
import CostDriverAnalysis from './pricing/CostDriverAnalysis';

// New scenario management components
import SaveScenarioModal from './pricing/SaveScenarioModal';
import ScenarioLibrary from './pricing/ScenarioLibrary';
import ProfessionalReport from './pricing/ProfessionalReport';
import ReportVariantSelector from './pricing/ReportVariantSelector';

// Q&A component
import PricingQA from './pricing/PricingQA';

// Validation Helper Functions

/**
 * Validates all input parameters and returns validation status with specific error messages
 * @param {Object} inputs - The inputs object containing all user-adjustable parameters
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateInputs(inputs) {
  const errors = [];
  const TOLERANCE = 0.01; // Allow ±1% tolerance for percentage sums

  // Check document mix totals to ~1.0 (100%)
  const docMixTotal = inputs.mixLease + inputs.mixDeed + inputs.mixLicence + inputs.mixPlan;
  if (Math.abs(docMixTotal - 1.0) > TOLERANCE) {
    errors.push('Document mix must total 100%');
  }

  // Check quality distribution totals to ~1.0 (100%)
  const qualityTotal = inputs.qGood + inputs.qMed + inputs.qPoor;
  if (Math.abs(qualityTotal - 1.0) > TOLERANCE) {
    errors.push('Quality distribution must total 100%');
  }

  // Check review rates are between 0 and 1 (0-100%)
  if (inputs.rGood < 0 || inputs.rGood > 1) {
    errors.push('Good quality review rate must be between 0 and 1');
  }
  if (inputs.rMed < 0 || inputs.rMed > 1) {
    errors.push('Medium quality review rate must be between 0 and 1');
  }
  if (inputs.rPoor < 0 || inputs.rPoor > 1) {
    errors.push('Poor quality review rate must be between 0 and 1');
  }

  // Check all numeric values are non-negative
  const numericFields = [
    { key: 'nSites', label: 'Total Sites' },
    { key: 'minDocs', label: 'Min Docs' },
    { key: 'maxDocs', label: 'Max Docs' },
    { key: 'pagesLease', label: 'Lease Pages' },
    { key: 'pagesDeed', label: 'Deed Pages' },
    { key: 'pagesLicence', label: 'Licence Pages' },
    { key: 'pagesPlan', label: 'Plan Pages' },
    { key: 'reviewMinutes', label: 'Review Minutes' },
    { key: 'conflictMinutes', label: 'Conflict Minutes' },
    { key: 'ocrCostPer1000', label: 'OCR Cost' },
    { key: 'tokensPerPage', label: 'Tokens per Page' },
    { key: 'llmCostPerMTokens', label: 'AI Extraction Cost' },
    { key: 'pipelinePasses', label: 'Extraction Passes' },
    { key: 'saDays', label: 'SA Days' },
    { key: 'mlDays', label: 'ML Days' },
    { key: 'beDays', label: 'BE Days' },
    { key: 'feDays', label: 'FE Days' },
    { key: 'devopsDays', label: 'DevOps Days' },
    { key: 'qaDays', label: 'QA Days' },
    { key: 'pmDays', label: 'PM Days' },
    { key: 'penTest', label: 'Pen-Test Cost' },
    { key: 'azureSearch', label: 'Azure Search' },
    { key: 'appHosting', label: 'App Hosting' },
    { key: 'monitoring', label: 'Monitoring' },
    { key: 'supportHours', label: 'Support Hours' },
    { key: 'supportRate', label: 'Support Rate' },
    { key: 'benchmarkManualPerDoc', label: 'Manual Benchmark' },
    { key: 'benchmarkCompetitorPerDoc', label: 'Competitor Benchmark' },
  ];

  numericFields.forEach(({ key, label }) => {
    if (inputs[key] < 0) {
      errors.push(`${label} must be non-negative`);
    }
  });

  // Specific minimums
  if (inputs.pipelinePasses < 1) {
    errors.push('Extraction Passes must be at least 1');
  }

  // Check min/max docs relationship
  if (inputs.minDocs > inputs.maxDocs) {
    errors.push('Min Docs cannot exceed Max Docs');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Returns warning messages for potentially problematic (but valid) input values
 * @param {Object} inputs - The inputs object containing all user-adjustable parameters
 * @returns {string[]} Array of warning messages
 */
function getValidationWarnings(inputs) {
  const warnings = [];

  // Warn if poor quality rate is very high
  if (inputs.qPoor > 0.4) {
    warnings.push('High poor quality rate - review costs may increase significantly');
  }

  // Warn if review time per document is excessive
  if (inputs.reviewMinutes > 40) {
    warnings.push('Review time is high - consider quality improvement');
  }

  // Check for extreme labor costs (>£2000/day)
  const laborRateChecks = [
    { key: 'supportRate', label: 'Support' },
  ];

  laborRateChecks.forEach(({ key, label }) => {
    if (inputs[key] > 2000) {
      warnings.push(`${label} rate is extremely high (>£2000/day)`);
    }
  });

  // Warn if conflict resolution time is very high
  if (inputs.conflictMinutes > 30) {
    warnings.push('Conflict resolution time is high - may impact scalability');
  }

  // Warn if good quality percentage is very low
  if (inputs.qGood < 0.2) {
    warnings.push('Low good quality rate - consider data quality improvements');
  }

  // Warn if average documents per site is very low
  const avgDocs = (inputs.minDocs + inputs.maxDocs) / 2;
  if (avgDocs < 2) {
    warnings.push('Very low average documents per site - verify volume assumptions');
  }

  // Warn if AI Extraction cost seems unusually high
  if (inputs.llmCostPerMTokens > 5) {
    warnings.push('AI Extraction cost is high - verify pricing model');
  }

  return warnings;
}


/**
 * Extract only the assumption fields from inputs (excludes UI state fields)
 * @param {Object} inputs - Full inputs object
 * @returns {Object} Assumption-only fields for saving
 */
function extractAssumptions(inputs) {
  return {
    nSites: inputs.nSites,
    minDocs: inputs.minDocs,
    maxDocs: inputs.maxDocs,
    mixLease: inputs.mixLease,
    mixDeed: inputs.mixDeed,
    mixLicence: inputs.mixLicence,
    mixPlan: inputs.mixPlan,
    pagesLease: inputs.pagesLease,
    pagesDeed: inputs.pagesDeed,
    pagesLicence: inputs.pagesLicence,
    pagesPlan: inputs.pagesPlan,
    qGood: inputs.qGood,
    qMed: inputs.qMed,
    qPoor: inputs.qPoor,
    rGood: inputs.rGood,
    rMed: inputs.rMed,
    rPoor: inputs.rPoor,
    reviewMinutes: inputs.reviewMinutes,
    conflictMinutes: inputs.conflictMinutes,
    ourManualReviewPct: inputs.ourManualReviewPct,
    ocrCostPer1000: inputs.ocrCostPer1000,
    tokensPerPage: inputs.tokensPerPage,
    pipelinePasses: inputs.pipelinePasses,
    llmCostPerMTokens: inputs.llmCostPerMTokens,
    saDays: inputs.saDays,
    mlDays: inputs.mlDays,
    beDays: inputs.beDays,
    feDays: inputs.feDays,
    devopsDays: inputs.devopsDays,
    qaDays: inputs.qaDays,
    pmDays: inputs.pmDays,
    penTest: inputs.penTest,
    azureSearch: inputs.azureSearch,
    appHosting: inputs.appHosting,
    monitoring: inputs.monitoring,
    mbPerPage: inputs.mbPerPage,
    costPerGBMonth: inputs.costPerGBMonth,
    queriesPer1000: inputs.queriesPer1000,
    costPerQuery: inputs.costPerQuery,
    supportHours: inputs.supportHours,
    supportRate: inputs.supportRate,
    benchmarkManualPerDoc: inputs.benchmarkManualPerDoc,
    benchmarkCompetitorPerDoc: inputs.benchmarkCompetitorPerDoc,
  };
}

/**
 * PRICING SCENARIO CONFIGURATIONS
 *
 * Three scenarios reflect different business strategies with DUAL MARGIN approach:
 * TARGET MARGINS: 40%, 50%, 60% (Conservative → Standard → Aggressive)
 *
 * 1. CONSERVATIVE: Internal employee costs with 40% target margin
 *    - Uses internal team rates (loaded salary + 40% overhead)
 *    - Labor margin: 52% (achieves 40% blended with cost mix)
 *    - Passthrough margin: 12% (defensible for Azure/OCR)
 *    - Actual 1,000-site deployment amortization
 *
 * 2. STANDARD: Hybrid contractor model with 50% target margin
 *    - Uses negotiated contractor rates (blended 40% market + 60% internal)
 *    - Labor margin: 66% (achieves 50% blended with cost mix)
 *    - Passthrough margin: 13% (cost-plus for services)
 *    - 5,000-site amortization reflects realistic growth
 *
 * 3. AGGRESSIVE: Value-based pricing with 60% target margin
 *    - Uses internal rates (same as Conservative)
 *    - Labor margin: 80% (achieves 60% blended with cost mix)
 *    - Passthrough margin: 15% (premium cloud cost markup)
 *    - Optimistic 10,000-site amortization
 *
 * MARGIN CALCULATION:
 * Uses dual-margin strategy: Price = Cost / (1 - margin)
 * - LABOR COSTS: Higher margin (where we add value through expertise)
 * - PASSTHROUGH COSTS: Lower margin (verifiable Azure/cloud costs)
 *
 * Blended gross margin = ~40%, ~50%, ~60% depending on cost mix and dual margins
 */
const SCENARIO_CONFIGS = {
  conservative: {
    name: 'Conservative',
    description: 'Internal team, 40% target margin',
    // Base day rates (constant across all scenarios)
    // Blended rates: 40% contractors at market + 60% internal staff (loaded cost)
    saRate: 488, mlRate: 418, beRate: 380, feRate: 360,
    devopsRate: 394, qaRate: 304, pmRate: 412, analystRate: 44,
    // Dual margins calculated to achieve 40% blended margin
    // Labor: 47% margin | Pass-through: 12% margin → Blended: ~40%
    laborMargin: 0.47, // 47% margin on labor (higher value-add)
    passthroughMargin: 0.12, // 12% margin on pass-through (verifiable costs)
    targetMargin: 0.40, // Target blended margin: 40%
  },
  standard: {
    name: 'Standard',
    description: 'Hybrid contractors, 50% target margin',
    // Base day rates (constant across all scenarios)
    // Blended rates: 40% contractors at market + 60% internal staff (loaded cost)
    saRate: 488, mlRate: 418, beRate: 380, feRate: 360,
    devopsRate: 394, qaRate: 304, pmRate: 412, analystRate: 44,
    // Dual margins calculated to achieve 50% blended margin
    // Labor: 58% margin | Pass-through: 13% margin → Blended: ~50%
    laborMargin: 0.58, // 58% margin on labor (balanced markup)
    passthroughMargin: 0.13, // 13% margin on pass-through (cost-plus)
    targetMargin: 0.50, // Target blended margin: 50%
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Value-based pricing, 60% target margin',
    // Base day rates (constant across all scenarios)
    // Blended rates: 40% contractors at market + 60% internal staff (loaded cost)
    saRate: 488, mlRate: 418, beRate: 380, feRate: 360,
    devopsRate: 394, qaRate: 304, pmRate: 412, analystRate: 44,
    // Dual margins calculated to achieve 60% blended margin
    // Labor: 68% margin | Pass-through: 15% margin → Blended: ~60%
    laborMargin: 0.68, // 68% margin on labor (premium value positioning)
    passthroughMargin: 0.15, // 15% margin on pass-through (premium cloud costs)
    targetMargin: 0.60, // Target blended margin: 60%
  },
};

const ASSUMPTION_PRESETS = {
  excellent: {
    name: 'Excellent (Controlled Scan)',
    description: 'AI-optimized scanning with guaranteed quality',
    qGood: 0.92,
    qMed: 0.07,
    qPoor: 0.01,
    rGood: 0.005,
    rMed: 0.03,
    rPoor: 0.10,
    reviewMinutes: 5,
    conflictMinutes: 1,
    minDocs: 5,
    maxDocs: 10,
    ourManualReviewPct: 75,
    tokensPerPage: 2100,
    pipelinePasses: 1.1,
  },
  high: {
    name: 'High Quality',
    description: 'Clean data, minimal review required',
    qGood: 0.65,
    qMed: 0.25,
    qPoor: 0.10,
    rGood: 0.03,
    rMed: 0.10,
    rPoor: 0.25,
    reviewMinutes: 15,
    minDocs: 4,
    maxDocs: 8,
    ourManualReviewPct: 10,
  },
  medium: {
    name: 'Medium Quality',
    description: 'Current baseline assumptions',
    qGood: 0.50,
    qMed: 0.35,
    qPoor: 0.15,
    rGood: 0.05,
    rMed: 0.15,
    rPoor: 0.35,
    reviewMinutes: 20,
    minDocs: 5,
    maxDocs: 10,
    ourManualReviewPct: 10,
  },
  low: {
    name: 'Low Quality',
    description: 'Challenging data, high review rates',
    qGood: 0.35,
    qMed: 0.40,
    qPoor: 0.25,
    rGood: 0.10,
    rMed: 0.25,
    rPoor: 0.45,
    reviewMinutes: 30,
    minDocs: 8,
    maxDocs: 15,
    ourManualReviewPct: 10,
  },
};

const defaultInputs = {
  nSites: 17000,
  minDocs: 5,
  maxDocs: 10,
  qualityPreset: 'excellent',
  docMixPreset: 'mixed',
  mixLease: 0.5, mixDeed: 0.1, mixLicence: 0.1, mixPlan: 0.3,
  pagesLease: 25, pagesDeed: 3, pagesLicence: 3, pagesPlan: 5,
  qGood: 0.92, qMed: 0.07, qPoor: 0.01,
  rGood: 0.005, rMed: 0.03, rPoor: 0.10,
  reviewMinutes: 5, conflictMinutes: 1,
  // WE ARE PROAPTUS (vendor), CORNERSTONE is client
  // Percentage of flagged manual review work CORNERSTONE handles (they know their data best)
  // Proaptus bills for (100 - ourManualReviewPct) = our spot checks, guidance, exceptions
  // Default 75%: Cornerstone handles majority (75%), Proaptus does spot checks (25%)
  // Flexible based on client engagement model
  ourManualReviewPct: 75,
  // Scanning Service Parameters (7 essential inputs)
  includeScanningService: true,
  scannerSpeed: 75,              // Pages per minute per scanner
  numberOfScanners: 2,            // Number of scanners to deploy
  workingHoursPerDay: 6,          // Productive scanning hours per day
  operatorHourlyRate: 15,         // £ per hour for operators
  scannerMonthlyLease: 1000,      // £ per scanner per month
  qaReviewPercentage: 10,         // % of pages to quality check
  prepMinutesLease: 2.0,          // Document prep time (minutes)
  prepMinutesDeed: 0.5,
  prepMinutesLicence: 0.5,
  prepMinutesPlan: 3.0,
  // Realistic project costs for one-off scanning operation
  facilityMonthlyCost: 1500,      // £ per month for facility/warehouse space (shared space)
  logisticsCost: 3500,            // £ one-time for collection/transport/return
  riskBufferPercentage: 5,        // % buffer for equipment failure, rework, contingencies
  // Azure Document Intelligence Read: $1.50/1k pages → £1.23/1k pages
  // Source: Microsoft Learn (Azure AI Document Intelligence pricing)
  ocrCostPer1000: 1.23,
  // AI Extraction: Multi-model processing with advanced vision models
  // Baseline cost: £0.50 per 1M tokens (reflects advanced vision models + multiple API calls)
  // Advanced vision detection, multi-pass extraction, and fallback models add up even with base models
  tokensPerPage: 2100,
  pipelinePasses: 1.1,
  llmCostPerMTokens: 5,
  saDays: 22, mlDays: 48, beDays: 54, feDays: 40,
  devopsDays: 20, qaDays: 24, pmDays: 33, penTest: 12000,
  // Azure Cognitive Search S1: ~$245/month → £200/month
  // Source: TrustRadius 2025 ($0.336/hour × 730 hours)
  azureSearch: 320, appHosting: 620, monitoring: 260,
  databaseServices: 145, securityServices: 33, penTestMonthly: 1000,
  // Azure Blob Storage (Hot tier, UK South): £0.0142/GB-month
  // Source: Synextra 2025
  mbPerPage: 0.3, costPerGBMonth: 0.0142,
  queriesPer1000: 2000, costPerQuery: 0.005,
  supportHours: 30.19, supportRate: 50, // Cost Rate £50 (Price £100)
  // Manual abstraction: Telecom QA-grade (£30/h × 22.4 min/doc + 10% supervision = £12)
  // Source: Factual QA cost analysis (not senior analyst £44/h)
  benchmarkManualPerDoc: 12,
  // AI SaaS competitors: Conventional vendor model (230d build + 10d ingestion = £600k ÷ 135k docs = £5)
  // Source: Reverse-engineered industry project delivery model
  benchmarkCompetitorPerDoc: 5,
};

/**
 * @typedef {Object} LineItem
 * @property {string} id - Unique identifier
 * @property {'ingestion'|'build'|'opex'} category - Cost category
 * @property {string} description - Line item description
 * @property {number} quantity - Quantity (hours, days, pages, etc.)
 * @property {string} unit - Unit of measurement
 * @property {number} unitRate - Cost per unit (£)
 * @property {number} cost - Total cost (quantity × unitRate)
 * @property {number} margin - Margin percentage (e.g., 0.33 = 33%)
 * @property {number} price - Total price (cost / (1 - margin))
 * @property {string} [notes] - Optional notes (e.g., client effort explanation)
 */

/**
 * Generate comprehensive line items array with all cost components
 * @param {Object} inputs - User input parameters
 * @param {Object} config - Scenario configuration
 * @param {Object} calculatedValues - Pre-calculated values from computeModel
 * @returns {LineItem[]} Array of all line items with costs, markups, and prices
 */
function generateLineItems(inputs, config, calculatedValues) {
  const {
    N_pages, C_OCR, C_LLM, C_manual, P_OCR, P_LLM,
    H_rev, H_conflict, GB, C_storage, Q, C_QA, C_support,
    T_tokensM, R_llmMTokens,
    C_scanning, scanningResult
  } = calculatedValues;

  const lineItems = [];

  // --- INGESTION CAPEX ---

  // Scanning Service (if enabled) - replaces OCR
  if (inputs.includeScanningService && scanningResult) {
    // Apply correct margins: 47% to labor, 12% to equipment/overhead
    const P_scanningLabor = scanningResult.scanningLaborCost / (1 - config.laborMargin);
    const P_scanningPassthrough = scanningResult.scanningPassthroughCost / (1 - config.passthroughMargin);
    const P_scanning = P_scanningLabor + P_scanningPassthrough;

    // Calculate blended margin for display
    const blendedMargin = (P_scanning - C_scanning) / P_scanning;

    // Calculate price per page for display
    const pricePerPage = P_scanning / scanningResult.totalPages;
    const costPerPage = C_scanning / scanningResult.totalPages;

    lineItems.push({
      id: 'ing-scanning',
      category: 'ingestion',
      description: 'Document Scanning Service - Professional & AI-Ready',
      quantity: scanningResult.monthsNeeded,
      unit: 'months',
      unitRate: (C_scanning / scanningResult.monthsNeeded).toFixed(0),
      cost: C_scanning,
      margin: blendedMargin,
      price: P_scanning,
      isPassthrough: false,  // Mixed: labor + passthrough
      notes: `Complete service for ${scanningResult.totalPages.toLocaleString()} pages: Document preparation (${Math.round(scanningResult.prepHours).toLocaleString()} hrs unfolding plans, removing bindings, organizing leases), high-volume scanning (${inputs.numberOfScanners} scanners, ${scanningResult.daysNeeded} days), OCR processing, AI classification, and metadata extraction. Includes equipment (£${scanningResult.equipmentCost.toLocaleString('en-GB', { maximumFractionDigits: 0 })}), specialist labor (£${scanningResult.operatorLaborCost.toLocaleString('en-GB', { maximumFractionDigits: 0 })}), quality assurance (${inputs.qaReviewPercentage}% verification), and project management. AI-ready output for document intelligence systems. Client price £${pricePerPage.toFixed(3)}/page (cost £${costPerPage.toFixed(3)}/page, ${(blendedMargin * 100).toFixed(0)}% margin).`
    });
  } else {
    // Azure OCR (Read) - only when scanning not enabled
    lineItems.push({
      id: 'ing-ocr',
      category: 'ingestion',
      description: 'Azure OCR (Read)',
      quantity: N_pages / 1000,
      unit: 'per 1000 pages',
      unitRate: inputs.ocrCostPer1000,
      cost: C_OCR,
      margin: config.passthroughMargin,
      price: P_OCR,
      isPassthrough: true,
    });
  }

  // AI Workflow Extraction (Token-based)
  lineItems.push({
    id: 'ing-llm',
    category: 'ingestion',
    description: 'AI Workflow Extraction',
    quantity: T_tokensM,
    unit: 'M tokens',
    unitRate: R_llmMTokens,
    cost: C_LLM,
    margin: config.passthroughMargin,
    price: P_LLM,
    isPassthrough: true,
  });

  // Manual Review Support
  // WE ARE PROAPTUS (the vendor), CORNERSTONE is the client
  // ourManualReviewPct = what % Cornerstone handles (they know their data best)
  // We (Proaptus) bill for (100 - ourManualReviewPct) = our spot checks, guidance, exceptions
  const totalReviewHours = H_rev + H_conflict;
  const proaptusReviewHours = totalReviewHours * ((100 - inputs.ourManualReviewPct) / 100);
  const cornerstoneReviewHours = totalReviewHours * (inputs.ourManualReviewPct / 100);
  const cornerstoneReviewCost = cornerstoneReviewHours * config.analystRate;

  const manualReviewNote = `Proaptus bills ${100 - inputs.ourManualReviewPct}% of ${totalReviewHours.toFixed(0)} flagged hours (${proaptusReviewHours.toFixed(1)} hours × £${config.analystRate} = £${C_manual.toFixed(2)}). Cornerstone handles ${inputs.ourManualReviewPct}% (${cornerstoneReviewHours.toFixed(0)} hours ≈ £${cornerstoneReviewCost.toFixed(2)} their internal effort - NOT billed to them). They know their data best; we provide exceptions, guidance, spot checks.`;

  lineItems.push({
    id: 'ing-manual',
    category: 'ingestion',
    description: 'Manual Review Support',
    quantity: proaptusReviewHours,
    unit: 'hours',
    unitRate: config.analystRate,
    cost: C_manual,
    margin: config.laborMargin,
    price: C_manual / (1 - config.laborMargin),
    notes: manualReviewNote + ` Effective Rate: £${(config.analystRate / (1 - config.laborMargin)).toFixed(2)}/hr`,
  });

  // --- BUILD CAPEX ---

  // Solution Architect
  lineItems.push({
    id: 'build-sa',
    category: 'build',
    description: 'Solution Architect',
    quantity: inputs.saDays,
    unit: 'days',
    unitRate: config.saRate,
    cost: inputs.saDays * config.saRate,
    margin: config.laborMargin,
    price: inputs.saDays * config.saRate / (1 - config.laborMargin),
    notes: `Effective Day Rate: £${(config.saRate / (1 - config.laborMargin)).toFixed(2)}`,
  });

  // ML Engineer
  lineItems.push({
    id: 'build-ml',
    category: 'build',
    description: 'ML Engineer',
    quantity: inputs.mlDays,
    unit: 'days',
    unitRate: config.mlRate,
    cost: inputs.mlDays * config.mlRate,
    margin: config.laborMargin,
    price: inputs.mlDays * config.mlRate / (1 - config.laborMargin),
    notes: `Effective Day Rate: £${(config.mlRate / (1 - config.laborMargin)).toFixed(2)}`,
  });

  // Backend Engineer
  lineItems.push({
    id: 'build-be',
    category: 'build',
    description: 'Backend Engineer',
    quantity: inputs.beDays,
    unit: 'days',
    unitRate: config.beRate,
    cost: inputs.beDays * config.beRate,
    margin: config.laborMargin,
    price: inputs.beDays * config.beRate / (1 - config.laborMargin),
    notes: `Effective Day Rate: £${(config.beRate / (1 - config.laborMargin)).toFixed(2)}`,
  });

  // Frontend Engineer
  lineItems.push({
    id: 'build-fe',
    category: 'build',
    description: 'Frontend Engineer',
    quantity: inputs.feDays,
    unit: 'days',
    unitRate: config.feRate,
    cost: inputs.feDays * config.feRate,
    margin: config.laborMargin,
    price: inputs.feDays * config.feRate / (1 - config.laborMargin),
    notes: `Effective Day Rate: £${(config.feRate / (1 - config.laborMargin)).toFixed(2)}`,
  });

  // DevOps Engineer
  lineItems.push({
    id: 'build-devops',
    category: 'build',
    description: 'DevOps Engineer',
    quantity: inputs.devopsDays,
    unit: 'days',
    unitRate: config.devopsRate,
    cost: inputs.devopsDays * config.devopsRate,
    margin: config.laborMargin,
    price: inputs.devopsDays * config.devopsRate / (1 - config.laborMargin),
    notes: `Effective Day Rate: £${(config.devopsRate / (1 - config.laborMargin)).toFixed(2)}`,
  });

  // QA Engineer
  lineItems.push({
    id: 'build-qa',
    category: 'build',
    description: 'QA Engineer',
    quantity: inputs.qaDays,
    unit: 'days',
    unitRate: config.qaRate,
    cost: inputs.qaDays * config.qaRate,
    margin: config.laborMargin,
    price: inputs.qaDays * config.qaRate / (1 - config.laborMargin),
    notes: `Effective Day Rate: £${(config.qaRate / (1 - config.laborMargin)).toFixed(2)}`,
  });

  // Project Manager
  lineItems.push({
    id: 'build-pm',
    category: 'build',
    description: 'Project Manager',
    quantity: inputs.pmDays,
    unit: 'days',
    unitRate: config.pmRate,
    cost: inputs.pmDays * config.pmRate,
    margin: config.laborMargin,
    price: inputs.pmDays * config.pmRate / (1 - config.laborMargin),
    notes: `Effective Day Rate: £${(config.pmRate / (1 - config.laborMargin)).toFixed(2)}`,
  });

  // Penetration Test
  lineItems.push({
    id: 'build-pentest',
    category: 'build',
    description: 'Security Penetration Test',
    quantity: 1,
    unit: 'each',
    unitRate: inputs.penTest,
    cost: inputs.penTest,
    margin: config.passthroughMargin,
    price: inputs.penTest / (1 - config.passthroughMargin),
    isPassthrough: true,
  });

  // --- MONTHLY OPEX ---

  // Azure Cognitive Search
  lineItems.push({
    id: 'opex-search',
    category: 'opex',
    description: 'Azure Cognitive Search',
    quantity: 1,
    unit: 'month',
    unitRate: inputs.azureSearch,
    cost: inputs.azureSearch,
    margin: 0,
    price: inputs.azureSearch,
    isPassthrough: true,
    notes: 'Payable directly to Azure (Client Direct Cost)',
  });

  // Application Hosting
  lineItems.push({
    id: 'opex-hosting',
    category: 'opex',
    description: 'Application Hosting',
    quantity: 1,
    unit: 'month',
    unitRate: inputs.appHosting,
    cost: inputs.appHosting,
    margin: 0,
    price: inputs.appHosting,
    isPassthrough: true,
    notes: 'Payable directly to Azure (Client Direct Cost)',
  });

  // Monitoring & Logging
  lineItems.push({
    id: 'opex-monitoring',
    category: 'opex',
    description: 'Monitoring & Logging',
    quantity: 1,
    unit: 'month',
    unitRate: inputs.monitoring,
    cost: inputs.monitoring,
    margin: 0,
    price: inputs.monitoring,
    isPassthrough: true,
    notes: 'Payable directly to Azure (Client Direct Cost)',
  });

  // Database Services
  lineItems.push({
    id: 'opex-db',
    category: 'opex',
    description: 'Database Services',
    quantity: 1,
    unit: 'month',
    unitRate: inputs.databaseServices,
    cost: inputs.databaseServices,
    margin: 0,
    price: inputs.databaseServices,
    isPassthrough: true,
    notes: 'Payable directly to Azure (Client Direct Cost)',
  });

  // Security Services
  lineItems.push({
    id: 'opex-security',
    category: 'opex',
    description: 'Security Services',
    quantity: 1,
    unit: 'month',
    unitRate: inputs.securityServices,
    cost: inputs.securityServices,
    margin: 0,
    price: inputs.securityServices,
    isPassthrough: true,
    notes: 'Payable directly to Azure (Client Direct Cost)',
  });

  // Penetration Testing (Monthly)
  lineItems.push({
    id: 'opex-pentest',
    category: 'opex',
    description: 'Penetration Testing',
    quantity: 1,
    unit: 'month',
    unitRate: inputs.penTestMonthly,
    cost: inputs.penTestMonthly,
    margin: config.passthroughMargin,
    price: inputs.penTestMonthly / (1 - config.passthroughMargin),
    isPassthrough: true,
  });

  // Document Storage
  lineItems.push({
    id: 'opex-storage',
    category: 'opex',
    description: 'Document Storage',
    quantity: GB,
    unit: 'GB',
    unitRate: inputs.costPerGBMonth,
    cost: C_storage,
    margin: 0,
    price: C_storage,
    isPassthrough: true,
    notes: 'Payable directly to Azure (Client Direct Cost)',
  });

  // Q&A API Usage
  lineItems.push({
    id: 'opex-qa',
    category: 'opex',
    description: 'Q&A API Usage',
    quantity: Q,
    unit: 'queries',
    unitRate: inputs.costPerQuery,
    cost: C_QA,
    margin: 0,
    price: C_QA,
    isPassthrough: true,
    notes: 'Payable directly to Azure/OpenAI (Client Direct Cost)',
  });

  // Support & Maintenance (internal staff - uses fixed 50% margin)
  lineItems.push({
    id: 'opex-support',
    category: 'opex',
    description: 'Support & Maintenance (Basic)',
    quantity: inputs.supportHours,
    unit: 'hours',
    unitRate: inputs.supportRate, // Cost Rate (£50)
    cost: C_support,
    margin: 0.5, // Fixed 50% margin
    price: C_support / 0.5, // Price Rate (£100)
    isPassthrough: false,
    isPassthrough: false,
    notes: 'Billed by Proaptus (Includes 50% Margin) - Effective Rate: £100.00/hr',
  });

  return lineItems;
}

/**
 * Calculate scanning service costs and timeline
 * @param {Object} inputs - User inputs
 * @param {Object} volumes - Calculated volumes (totalPages, nLeases, nDeeds, nLicences, nPlans)
 * @param {Object} config - Scenario configuration (for PM rate)
 * @returns {Object} Scanning cost breakdown and timeline
 */
function calculateScanningCost(inputs, volumes, config) {
  // STEP 1: Calculate daily scanning capacity
  const pagesPerMinute = inputs.scannerSpeed * inputs.numberOfScanners;
  const pagesPerHour = pagesPerMinute * 60;
  const pagesPerDay = pagesPerHour * inputs.workingHoursPerDay * 0.7; // 70% efficiency

  // STEP 2: Calculate project duration (DERIVED from parameters)
  const daysNeeded = Math.ceil(volumes.totalPages / pagesPerDay);
  const monthsNeeded = Math.ceil(daysNeeded / 20); // 20 working days per month

  // STEP 3: Calculate preparation hours by document type
  const prepHours =
    (volumes.nLeases * inputs.prepMinutesLease / 60) +
    (volumes.nDeeds * inputs.prepMinutesDeed / 60) +
    (volumes.nLicences * inputs.prepMinutesLicence / 60) +
    (volumes.nPlans * inputs.prepMinutesPlan / 60);

  // STEP 4: Calculate scanning operation hours
  const scanningHours = daysNeeded * inputs.workingHoursPerDay;

  // STEP 5: Calculate QA hours
  const pagesForQA = volumes.totalPages * (inputs.qaReviewPercentage / 100);
  const qaHours = pagesForQA / 1200; // QA reviews at 1200 pages/hour

  // STEP 6: Calculate management hours (realistic oversight for 3-month project)
  // Weekly oversight: 8 hrs/week for check-ins, QA reviews, issue resolution, coordination
  // Plus setup (16 hrs) and close-out (16 hrs)
  const weeksNeeded = Math.ceil(daysNeeded / 5); // 5 working days per week
  const managementHours = (weeksNeeded * 8) + 32; // Weekly oversight + setup/closeout

  // STEP 7: Calculate operator labor hours (prep + scanning + QA)
  const operatorLaborHours = prepHours + scanningHours + qaHours;

  // STEP 8: Calculate core costs
  // Operator labor at operator rates
  const operatorLaborCost = operatorLaborHours * inputs.operatorHourlyRate;

  // Management labor at PM rates (higher skilled resource)
  // Convert PM daily rate to hourly rate (assuming 8-hour day)
  const pmHourlyRate = config.pmRate / 8;
  const managementCost = managementHours * pmHourlyRate;

  // Total labor cost (operators + management)
  const laborCost = operatorLaborCost + managementCost;

  // Equipment cost - published third-party cost
  const equipmentCost = inputs.numberOfScanners * inputs.scannerMonthlyLease * monthsNeeded;

  // Overhead - internal operational cost (insurance, admin, utilities, etc.)
  const overheadCost = (laborCost + equipmentCost) * 0.25;

  // STEP 9: Add realistic project costs
  // Facility cost (warehouse/office space for 3-month operation)
  const facilityCost = inputs.facilityMonthlyCost * monthsNeeded;

  // Logistics cost (collection, transport, return/disposal)
  const logisticsCost = inputs.logisticsCost;

  // Subtotal before risk buffer
  const subtotalCost = laborCost + equipmentCost + overheadCost + facilityCost + logisticsCost;

  // Risk buffer (equipment failure, rework, contingencies)
  const riskBufferCost = subtotalCost * (inputs.riskBufferPercentage / 100);

  const totalScanningCost = subtotalCost + riskBufferCost;

  // Separate labor and passthrough costs for margin application
  // Labor margin (47%): Direct labor + Management + Overhead + Facility + Logistics + Risk buffer (operational costs)
  // Passthrough margin (12%): Equipment only (third-party published cost)
  const scanningLaborCost = laborCost + overheadCost + facilityCost + logisticsCost + riskBufferCost;
  const scanningPassthroughCost = equipmentCost;

  return {
    scanningCost: totalScanningCost,
    laborCost,
    equipmentCost,
    overheadCost,
    facilityCost,
    logisticsCost,
    riskBufferCost,
    operatorLaborCost,
    managementCost,
    managementHours,
    monthsNeeded,
    daysNeeded,
    prepHours,
    scanningHours,
    qaHours,
    totalPages: volumes.totalPages,
    laborHours: operatorLaborHours + managementHours,
    costPerPage: totalScanningCost / volumes.totalPages,
    dailyCapacity: Math.round(pagesPerDay),
    // Separate components for margin calculation
    scanningLaborCost,
    scanningPassthroughCost
  };
}


function computeModel(inputs, config) {
  const D = (inputs.minDocs + inputs.maxDocs) / 2;
  const P_doc = inputs.mixLease * inputs.pagesLease + inputs.mixDeed * inputs.pagesDeed +
    inputs.mixLicence * inputs.pagesLicence + inputs.mixPlan * inputs.pagesPlan;
  const N_docs = inputs.nSites * D;
  const N_pages = N_docs * P_doc;

  // Calculate documents by type for scanning
  const nLeases = N_docs * inputs.mixLease;
  const nDeeds = N_docs * inputs.mixDeed;
  const nLicences = N_docs * inputs.mixLicence;
  const nPlans = N_docs * inputs.mixPlan;

  // Scanning Service Integration
  let scanningResult = null;
  let C_scanning = 0;
  if (inputs.includeScanningService) {
    scanningResult = calculateScanningCost(inputs, {
      totalPages: N_pages,
      nLeases,
      nDeeds,
      nLicences,
      nPlans
    }, config);
    C_scanning = scanningResult.scanningCost;
  }

  // Ingestion CAPEX - COSTS
  // OCR: Always calculated (Azure service converts scanned images to text)
  // NOTE: Scanning service creates IMAGES, OCR converts IMAGES to TEXT - separate billable services!
  const C_OCR = (N_pages / 1000) * inputs.ocrCostPer1000;

  // AI Extraction cost: processing units per page × pipeline passes × £/unit (with guards)
  const tokensPerPageVal = Number.isFinite(inputs.tokensPerPage) && inputs.tokensPerPage > 0 ? inputs.tokensPerPage : 750;
  const pipelinePassesVal = Number.isFinite(inputs.pipelinePasses) && inputs.pipelinePasses > 0 ? inputs.pipelinePasses : 1;
  const llmRateMTokensVal = Number.isFinite(inputs.llmCostPerMTokens) && inputs.llmCostPerMTokens >= 0 ? inputs.llmCostPerMTokens : 5;
  const T_tokens = N_pages * tokensPerPageVal * pipelinePassesVal;
  const T_tokensM = T_tokens / 1_000_000;
  // LLM costs reduce 30% with scanning due to better quality
  const C_LLM = inputs.includeScanningService ?
    (T_tokensM * llmRateMTokensVal * 0.70) :
    (T_tokensM * llmRateMTokensVal);

  const r = inputs.qGood * inputs.rGood + inputs.qMed * inputs.rMed + inputs.qPoor * inputs.rPoor;
  const N_rev = N_docs * r;
  const H_rev = N_rev * (inputs.reviewMinutes / 60);
  const H_conflict = inputs.nSites * (inputs.conflictMinutes / 60);
  // FIXED: Removed hardcoded 0.10 multiplier - scanning service is billed separately
  // WE ARE PROAPTUS (vendor), CORNERSTONE is client
  // ourManualReviewPct = what % Cornerstone handles (75% - they know their data)
  // We (Proaptus) bill for (100 - ourManualReviewPct) = 25% (our spot checks, guidance, exceptions)
  const C_manual = (H_rev + H_conflict) * config.analystRate * ((100 - inputs.ourManualReviewPct) / 100);

  // Separate labor and passthrough components for scanning
  const ingestionLaborCost = C_manual + (scanningResult ? scanningResult.scanningLaborCost : 0);
  const ingestionPassthroughCost = C_OCR + C_LLM + (scanningResult ? scanningResult.scanningPassthroughCost : 0);
  const ingestionTotalCost = ingestionLaborCost + ingestionPassthroughCost;

  // Ingestion CAPEX - PRICES
  /**
   * DUAL MARGIN PRICING STRATEGY:
   *
   * We apply different margins to labor vs pass-through costs:
   * - LABOR (manual review): Higher margin - where we add value through expertise
   * - PASSTHROUGH (OCR, LLM): Lower margin - verifiable, defensible to clients
   *
   * Price formula: Price = Cost / (1 - margin)
   * This ensures: Margin = (Price - Cost) / Price
   */
  const P_OCR = C_OCR / (1 - config.passthroughMargin);
  const P_LLM = C_LLM / (1 - config.passthroughMargin);

  // Calculate prices for labor and passthrough components separately
  const ingestionLaborPrice = ingestionLaborCost / (1 - config.laborMargin);
  const ingestionPassthroughPrice = ingestionPassthroughCost / (1 - config.passthroughMargin);

  const ingestionTotalPrice = ingestionLaborPrice + ingestionPassthroughPrice;

  // Individual component prices for UI display
  const P_manual_eng = C_manual / (1 - config.laborMargin);
  const P_scanning = inputs.includeScanningService && scanningResult
    ? (scanningResult.scanningLaborCost / (1 - config.laborMargin)) +
    (scanningResult.scanningPassthroughCost / (1 - config.passthroughMargin))
    : 0;

  // Build CAPEX - COSTS
  const buildLaborCost =
    inputs.saDays * config.saRate + inputs.mlDays * config.mlRate +
    inputs.beDays * config.beRate + inputs.feDays * config.feRate +
    inputs.devopsDays * config.devopsRate + inputs.qaDays * config.qaRate +
    inputs.pmDays * config.pmRate;
  const buildPassthroughCost = inputs.penTest;
  const buildTotalCost = buildLaborCost + buildPassthroughCost;

  // Build CAPEX - PRICES
  /**
   * DUAL MARGIN PRICING (Build Phase):
   *
   * - Build LABOR (engineering): Apply laborMargin (higher - value-add)
   * - Build PASSTHROUGH (pen-test): Apply passthroughMargin (lower - external service)
   */
  const buildLaborPrice = buildLaborCost / (1 - config.laborMargin);
  const buildPassthroughPrice = buildPassthroughCost / (1 - config.passthroughMargin);
  const buildTotalPrice = buildLaborPrice + buildPassthroughPrice;

  // OPEX (Monthly) - COSTS
  const GB = (N_pages * inputs.mbPerPage) / 1024;
  const C_storage = GB * inputs.costPerGBMonth;
  const Q = (inputs.nSites / 1000) * inputs.queriesPer1000;
  const C_QA = Q * inputs.costPerQuery;
  const C_support = inputs.supportHours * inputs.supportRate;
  const opexPlatformCost = inputs.azureSearch + inputs.appHosting + inputs.monitoring + inputs.databaseServices + inputs.securityServices + inputs.penTestMonthly;
  const opexVariableCost = C_storage + C_QA;
  const opexSupportCost = C_support;
  const opexTotalCost = opexPlatformCost + opexVariableCost + opexSupportCost;

  // OPEX - PRICES (separate margins: platform/variable = passthrough, support = labor)
  // Platform & variable costs (Azure, storage, API) use passthrough margin
  // UPDATE: Client self-hosted means NO MARGIN on Azure/Third-party costs (Client Direct)
  // Only Pen Test (Monthly) and Support have margin (Proaptus Billed)

  // Client Direct Costs (No Margin)
  const opexClientDirectCost = inputs.azureSearch + inputs.appHosting + inputs.monitoring + inputs.databaseServices + inputs.securityServices + C_storage + C_QA;
  const opexClientDirectPrice = opexClientDirectCost; // No markup

  // Proaptus Billed Costs (With Margin)
  // Proaptus Billed Costs (With Margin)
  const opexProaptusCost = inputs.penTestMonthly + opexSupportCost;
  const opexPenTestPrice = inputs.penTestMonthly / (1 - config.passthroughMargin);
  // Support Price: Fixed at £100/hr (Cost £50/hr -> 50% Margin)
  // This overrides the scenario labor margin for this specific line item
  const opexSupportPrice = opexSupportCost / 0.5;
  const opexProaptusPrice = opexPenTestPrice + opexSupportPrice;

  const opexTotalPrice = opexClientDirectPrice + opexProaptusPrice;

  // Client Quote: CAPEX (one-time) and OPEX (annual)
  const capexOneTimeCost = ingestionTotalCost + buildTotalCost;
  const capexOneTimePrice = ingestionTotalPrice + buildTotalPrice;
  const opexAnnualCost = opexTotalCost * 12;
  const opexAnnualPrice = opexTotalPrice * 12;

  // Total quote (CAPEX + Annual OPEX)
  const totalQuoteCost = capexOneTimeCost + opexAnnualCost;
  const totalQuotePrice = capexOneTimePrice + opexAnnualPrice;

  // Gross Margin Calculation (guard against divide-by-zero)
  const grossMargin = totalQuotePrice > 0 ? (totalQuotePrice - totalQuoteCost) / totalQuotePrice : 0;
  const capexGrossMargin = capexOneTimePrice > 0 ? (capexOneTimePrice - capexOneTimeCost) / capexOneTimePrice : 0;

  // Benchmarks
  const benchManualTotal = N_docs * inputs.benchmarkManualPerDoc;
  const benchCompetitorTotal = N_docs * inputs.benchmarkCompetitorPerDoc;

  // Cost Driver Analysis - percentage breakdown of ingestion costs
  const pctManualOfIngestion = ingestionTotalCost > 0 ? (C_manual / ingestionTotalCost) * 100 : 0;
  const pctOCROfIngestion = ingestionTotalCost > 0 ? (C_OCR / ingestionTotalCost) * 100 : 0;
  const pctLLMOfIngestion = ingestionTotalCost > 0 ? (C_LLM / ingestionTotalCost) * 100 : 0;

  // Cost breakdown for what drives overall quote total (CAPEX + Annual OPEX)
  const pctManualOfTotal = totalQuoteCost > 0 ? (C_manual / totalQuoteCost) * 100 : 0;
  const pctBuildOfTotal = totalQuoteCost > 0 ? (buildTotalCost / totalQuoteCost) * 100 : 0;
  const pctOPEXOfTotal = totalQuoteCost > 0 ? (opexAnnualCost / totalQuoteCost) * 100 : 0;


  // Generate comprehensive line items array with category and markupType fields
  const lineItems = generateLineItems(inputs, config, {
    N_pages, C_OCR, C_LLM, C_manual, P_OCR, P_LLM,
    H_rev, H_conflict, GB, C_storage, Q, C_QA, C_support,
    T_tokensM, R_llmMTokens: llmRateMTokensVal,
    C_scanning, scanningResult
  });

  return {
    D, P_doc, N_docs, N_pages, H_rev, H_conflict,
    // Scanning (if enabled)
    C_scanning,
    P_scanning,
    scanningResult,
    // Ingestion costs
    C_OCR, C_LLM, C_manual, ingestionTotalCost,
    P_OCR, P_LLM, P_manual_eng, ingestionTotalPrice,
    ingestionLaborCost, ingestionPassthroughCost,
    ingestionLaborPrice, ingestionPassthroughPrice,
    // Build costs
    buildLaborCost, buildPassthroughCost, buildTotalCost,
    buildLaborPrice, buildPassthroughPrice, buildTotalPrice,
    // OPEX costs
    GB, C_storage, Q, C_QA, C_support, opexTotalCost, opexTotalPrice,
    opexClientDirectCost, opexClientDirectPrice,
    opexProaptusCost, opexProaptusPrice,
    capexOneTimeCost, capexOneTimePrice, opexAnnualCost, opexAnnualPrice,
    // Total Quote (CAPEX + Annual OPEX)
    totalQuoteCost, totalQuotePrice, grossMargin, capexGrossMargin,
    // Benchmarks
    benchManualTotal, benchCompetitorTotal,
    savingsVsManual: benchManualTotal - capexOneTimePrice,
    savingsVsCompetitor: benchCompetitorTotal - capexOneTimePrice,
    // Cost Drivers (for sensitivity analysis)
    pctManualOfIngestion,
    pctOCROfIngestion,
    pctLLMOfIngestion,
    pctManualOfTotal,
    pctBuildOfTotal,
    pctOPEXOfTotal,
    // Line Items Arrays - filtered from comprehensive lineItems array
    ingestionLineItems: lineItems.filter(item => item.category === 'ingestion'),
    buildLineItems: lineItems.filter(item => item.category === 'build'),
    opexLineItems: lineItems.filter(item => item.category === 'opex'),
    // Comprehensive line items array with category and markupType
    lineItems,
    // Config
    config,
  };
}

const CornerstonePricingCalculator = ({ onLogout }) => {
  const [inputs, setInputs] = useState(defaultInputs);
  const [scenario, setScenario] = useState('conservative');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [opexDisplay, setOpexDisplay] = useState('annual');
  const [isEditingAssumptions, setIsEditingAssumptions] = useState(false);

  // Scenario management state
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [reportVariant, setReportVariant] = useState('INTERNAL');
  const [isPrinting, setIsPrinting] = useState(false);

  // Print report ref
  const printReportRef = useRef();
  const assumptionSnapshotRef = useRef(null);

  // Setup react-to-print
  const getDocumentTitle = () => {
    const date = new Date().toISOString().split('T')[0];
    const scenarioName = scenario.charAt(0).toUpperCase() + scenario.slice(1);

    const reportTitles = {
      'INTERNAL': 'Internal_Analysis',
      'ROM': 'ROM_Quote',
      'DETAILED_QUOTE': 'Professional_Quote'
    };

    return `Cornerstone_AI_${reportTitles[reportVariant]}_${scenarioName}_${date}`;
  };

  const reactPrint = useReactToPrint({
    contentRef: printReportRef,
    documentTitle: getDocumentTitle(),
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
    `,
  });

  // Wrapper to handle loading state
  const handlePrintReport = async () => {
    setIsPrinting(true);
    try {
      await reactPrint();
    } finally {
      // Reset state after brief delay to ensure print dialog appears
      setTimeout(() => setIsPrinting(false), 500);
    }
  };

  // Load saved scenarios from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pricingScenarios');
      if (stored) {
        setSavedScenarios(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load saved scenarios:', error);
    }
  }, []);

  // Save scenarios to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('pricingScenarios', JSON.stringify(savedScenarios));
    } catch (error) {
      console.error('Failed to save scenarios to localStorage:', error);
    }
  }, [savedScenarios]);

  // MARKDOWN SYNC REMOVED - LLM now uses LIVE DATA directly
  // No more stale data, no more manual updates, no more bullshit

  // Validation - runs whenever inputs change
  const validation = useMemo(() => validateInputs(inputs), [inputs]);
  const warnings = useMemo(() => getValidationWarnings(inputs), [inputs]);

  const model = useMemo(() => computeModel(inputs, SCENARIO_CONFIGS[scenario]), [inputs, scenario]);

  const allScenarios = useMemo(() => ({
    conservative: computeModel(inputs, SCENARIO_CONFIGS.conservative),
    standard: computeModel(inputs, SCENARIO_CONFIGS.standard),
    aggressive: computeModel(inputs, SCENARIO_CONFIGS.aggressive),
  }), [inputs]);

  // Detect which assumption preset is currently active
  const getActivePreset = () => {
    for (const [key, preset] of Object.entries(ASSUMPTION_PRESETS)) {
      if (
        inputs.qGood === preset.qGood &&
        inputs.qMed === preset.qMed &&
        inputs.qPoor === preset.qPoor &&
        inputs.rGood === preset.rGood &&
        inputs.rMed === preset.rMed &&
        inputs.rPoor === preset.rPoor &&
        inputs.reviewMinutes === preset.reviewMinutes &&
        inputs.minDocs === preset.minDocs &&
        inputs.maxDocs === preset.maxDocs &&
        inputs.ourManualReviewPct === preset.ourManualReviewPct
      ) {
        return key;
      }
    }
    return null;
  };

  // Apply an assumption preset to inputs
  const applyAssumptionPreset = (presetKey) => {
    const preset = ASSUMPTION_PRESETS[presetKey];
    setInputs(prev => ({
      ...prev,
      qGood: preset.qGood,
      qMed: preset.qMed,
      qPoor: preset.qPoor,
      rGood: preset.rGood,
      rMed: preset.rMed,
      rPoor: preset.rPoor,
      reviewMinutes: preset.reviewMinutes,
      minDocs: preset.minDocs,
      maxDocs: preset.maxDocs,
      ourManualReviewPct: preset.ourManualReviewPct,
    }));
  };

  const startAssumptionEdit = () => {
    assumptionSnapshotRef.current = JSON.parse(JSON.stringify(inputs));
    setIsEditingAssumptions(true);
    setShowAdvanced(false);
  };

  const cancelAssumptionEdit = () => {
    if (assumptionSnapshotRef.current) {
      setInputs(assumptionSnapshotRef.current);
    }
    assumptionSnapshotRef.current = null;
    setIsEditingAssumptions(false);
    setShowAdvanced(false);
  };

  const saveAssumptionEdit = () => {
    assumptionSnapshotRef.current = null;
    setIsEditingAssumptions(false);
    setShowAdvanced(false);
  };

  const exportJSON = () => {
    const exportData = {
      scenario: scenario,
      inputs: inputs,
      model: model,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cornerstone_pricing_${scenario}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // SCENARIO MANAGEMENT HANDLERS

  const handleSaveScenario = (scenarioName, reportVariantUsed) => {
    const newScenario = {
      id: Date.now(), // Simple unique ID using timestamp
      name: scenarioName,
      timestamp: new Date().toISOString(),
      reportVariant: reportVariantUsed,
      assumptions: extractAssumptions(inputs),
    };
    setSavedScenarios([...savedScenarios, newScenario]);
    setShowSaveModal(false);
  };

  const handleLoadScenario = (scenarioId) => {
    const scenario = savedScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      // Merge loaded assumptions with current inputs (preserving other fields)
      setInputs(prev => ({
        ...prev,
        ...scenario.assumptions,
      }));
    }
  };

  const handleDeleteScenario = (scenarioId) => {
    setSavedScenarios(savedScenarios.filter(s => s.id !== scenarioId));
  };

  const handleExportScenario = (scenarioId) => {
    const scenario = savedScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      const exportData = {
        name: scenario.name,
        timestamp: scenario.timestamp,
        assumptions: scenario.assumptions,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scenario_${scenario.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-800 text-white py-6 px-6 border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Cornerstone AI Pricing Model</h1>
            <p className="text-slate-300">Three-Scenario Financial Analysis with Margin Transparency</p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200 text-sm font-medium"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Scenario Selector */}
        <ScenarioSelector
          scenario={scenario}
          setScenario={setScenario}
          SCENARIO_CONFIGS={SCENARIO_CONFIGS}
          showComparison={showComparison}
          setShowComparison={setShowComparison}
        />

        {/* Scenario Comparison */}
        {showComparison && (
          <ScenarioComparison
            allScenarios={allScenarios}
            showComparison={showComparison}
            setShowComparison={setShowComparison}
            formatGBP={formatGBP}
          />
        )}

        {/* Validation Badge */}
        <ValidationAlert validation={validation} warnings={warnings} />

        {/* Pricing Q&A Section */}
        <div className="mt-8">
          <PricingQA inputs={inputs} model={model} scenario={scenario} />
        </div>

        {/* Data Scenario Presets */}
        <PricingSection
          title="Scenario Presets"
          subtitle="Load predefined quality mixes and review assumptions to stress-test pricing."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(ASSUMPTION_PRESETS).map(([key, preset]) => {
              const isActive = getActivePreset() === key;
              return (
                <button
                  key={key}
                  onClick={() => applyAssumptionPreset(key)}
                  className={`p-4 text-left rounded-lg border transition-colors ${isActive
                    ? 'border-slate-900 bg-slate-900/5'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-100/40'
                    }`}
                >
                  <div className="font-semibold text-base text-slate-900 mb-1">{preset.name}</div>
                  <div className="text-sm text-slate-600">{preset.description}</div>
                  <div className="mt-3 text-xs text-slate-500 space-y-1">
                    <div>
                      Quality Mix:&nbsp;
                      {(preset.qGood * 100).toFixed(0)}% good /
                      {(preset.qMed * 100).toFixed(0)}% med /
                      {(preset.qPoor * 100).toFixed(0)}% poor
                    </div>
                    <div>
                      Review Effort:&nbsp;
                      {preset.reviewMinutes} mins · {preset.minDocs}-{preset.maxDocs} docs/site
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </PricingSection>

        {/* Assumptions */}
        {isEditingAssumptions ? (
          <KeyAssumptions
            inputs={inputs}
            setInputs={setInputs}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            onCancel={cancelAssumptionEdit}
            onSave={saveAssumptionEdit}
          >
            <AdvancedAssumptions
              inputs={inputs}
              setInputs={setInputs}
            />
          </KeyAssumptions>
        ) : (
          <AssumptionsSummary
            inputs={inputs}
            onEdit={startAssumptionEdit}
          />
        )}

        {/* Scanning Configuration */}
        <ScanningConfiguration
          inputs={inputs}
          setInputs={setInputs}
          model={model}
        />

        {/* Current Scenario Info */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700">
            <div>
              <span className="font-semibold text-slate-900">Labor Margin:</span>{' '}
              {(model.config.laborMargin * 100).toFixed(0)}%
            </div>
            <div>
              <span className="font-semibold text-slate-900">Pass-through Margin:</span>{' '}
              {(model.config.passthroughMargin * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-slate-500">
              Dual-margin model: targeted service margin on labor, verified cost pass-through on Azure.
            </div>
          </div>
        </div>

        {/* Ingestion CAPEX Table */}
        <IngestionCapexTable
          model={model}
          inputs={inputs}
          CostPriceRow={CostPriceRow}
        />

        {/* Build CAPEX Table */}
        <BuildCapexTable
          model={model}
          CostPriceRow={CostPriceRow}
        />

        {/* Monthly OPEX Table */}
        <MonthlyOpexTable
          model={model}
          CostPriceRow={CostPriceRow}
        />

        {/* Client Quote Summary (CAPEX & OPEX) */}
        <ClientQuoteSummary
          model={model}
          formatGBP={formatGBP}
          inputs={inputs}
          scenario={scenario}
        />

        {/* Cost Breakdown & Markup Structure */}
        <CostBreakdownWaterfall
          model={model}
          formatGBP={formatGBP}
          inputs={inputs}
        />

        {/* Margin Analysis (Internal Use Only) */}
        <MarginAnalysis
          model={model}
          formatGBP={formatGBP}
          inputs={inputs}
          scenario={scenario}
        />

        {/* Benchmarking */}
        <CompetitiveBenchmarking
          model={model}
          inputs={inputs}
          formatGBP={formatGBP}
        />

        {/* Cost Driver Analysis */}
        <CostDriverAnalysis
          model={model}
          formatGBP={formatGBP}
        />

        {/* Scenario Library */}
        {savedScenarios.length > 0 && (
          <ScenarioLibrary
            scenarios={savedScenarios}
            onLoadScenario={handleLoadScenario}
            onDeleteScenario={handleDeleteScenario}
            onExportScenario={handleExportScenario}
          />
        )}

        {/* Report Variant Selector */}
        <ReportVariantSelector
          reportVariant={reportVariant}
          setReportVariant={setReportVariant}
        />

        {/* Actions & Export */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Save, Print & Export</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Save Scenario */}
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors shadow-md"
            >
              <FileJson className="w-5 h-5" />
              Save Scenario
            </button>

            {/* Print Report */}
            <button
              onClick={handlePrintReport}
              disabled={isPrinting}
              className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded shadow-md transition-all ${isPrinting
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-not-allowed scale-105'
                : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
            >
              {isPrinting ? (
                <>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  Generating...
                </>
              ) : (
                <>
                  <Printer className="w-5 h-5" />
                  Print Report (PDF)
                </>
              )}
            </button>

            {/* Export Full Model */}
            <button
              onClick={exportJSON}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors shadow-md"
            >
              <FileJson className="w-5 h-5" />
              Export Model (JSON)
            </button>
          </div>

          {savedScenarios.length === 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> Click "Save Scenario" to save your current assumptions for later comparison. You can save multiple scenarios (Best Case, Worst Case, etc.) and load them instantly.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Scenario Modal */}
      <SaveScenarioModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveScenario}
        inputs={inputs}
        reportVariant={reportVariant}
      />

      {/* Print Report (hidden, shown only in print) */}
      <div ref={printReportRef}>
        {model && inputs ? (
          <ProfessionalReport
            model={model}
            inputs={inputs}
            scenario={scenario}
            reportVariant={reportVariant}
            SCENARIO_CONFIGS={SCENARIO_CONFIGS}
          />
        ) : (
          <div>Loading report...</div>
        )}
      </div>
    </div>
  );
};

export { computeModel, SCENARIO_CONFIGS, ASSUMPTION_PRESETS, defaultInputs };
export default CornerstonePricingCalculator;
