// Extracted baseline constants
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
  supportHours: 30.19, supportRate: 50,
  // Manual abstraction: Telecom QA-grade (£30/h × 22.4 min/doc + 10% supervision = £12)
  // Source: Factual QA cost analysis (not senior analyst £44/h)
  benchmarkManualPerDoc: 12,
  // AI SaaS competitors: Conventional vendor model (230d build + 10d ingestion = £600k ÷ 135k docs = £5)
  // Source: Reverse-engineered industry project delivery model
  benchmarkCompetitorPerDoc: 5,
};

export { defaultInputs, SCENARIO_CONFIGS, ASSUMPTION_PRESETS };
