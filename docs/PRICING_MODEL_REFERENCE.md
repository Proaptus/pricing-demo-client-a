# Cornerstone Pricing Model Reference

> Mathematical formulas and pricing strategy for the Cornerstone pricing model

## Client Baseline

```yaml
client: Cornerstone Telecommunications Infrastructure Limited
contact: Iain Harris (iain.harris@cornerstone.network)
sites: 17000
documents_per_site: 5-10 (average 7.5)
total_documents: ~127500
total_pages: ~1275000 (calculated dynamically)
```

## Core Calculations

### Volume Calculations
```javascript
D = (minDocs + maxDocs) / 2                     // avg docs/site
P_doc = Σ(mix_type × pages_type)                // avg pages/doc
N_docs = nSites × D                             // total documents
N_pages = N_docs × P_doc                        // total pages
```

### Critical Multipliers

#### 1. Scanning Impact on LLM Costs
```
C_LLM = if scanning enabled:
          T_tokensM × llmCostPerMTokens × 0.70      (30% REDUCTION)
        else:
          T_tokensM × llmCostPerMTokens
```
**Effect**: Scanning reduces LLM costs by 30%

#### 2. Scanning Impact on Manual Review
```
manualReviewMultiplier = if scanning enabled: 0.10  (90% REDUCTION)
                         else: 1.0
```
**Effect**: Scanning reduces manual review to 10% (90% reduction)

#### 3. Manual Review Billing Logic
```
C_manual = (H_rev + H_conflict) × analystRate × clientBillingPct × scanningMultiplier

Where:
- clientBillingPct = 25% (client pays for our spot checks/guidance/exceptions)
- proaptusInternalPct = 75% (Proaptus handles internally - NOT billed)
- scanningMultiplier = 0.10 if scanning enabled, 1.0 otherwise
```
**Billing Split**:
- Proaptus internal handling: 75% (NOT billed - we know the data best)
- Client billed: 25% (our spot checks, guidance, exceptions)

### Dual-Margin Pricing Strategy

#### Philosophy
- **Labor costs**: Higher margin (value-add through expertise)
- **Passthrough costs**: Lower margin (verifiable third-party)

#### Formula
```javascript
Price = Cost / (1 - margin)
// Ensures: Margin = (Price - Cost) / Price
```

#### Margin Rates (Scenario-Dependent)
```yaml
conservative:
  labor_margin: 0.47      # 47%
  passthrough_margin: 0.12 # 12%
  target_overall: 0.33     # 33%

standard:
  labor_margin: 0.55      # 55%
  passthrough_margin: 0.15 # 15%
  target_overall: 0.60     # 60%

aggressive:
  labor_margin: 1.00      # 100%
  passthrough_margin: 0.20 # 20%
  target_overall: 0.75     # 75%
```

### Cost Structure

#### Ingestion CAPEX (One-Time)
```yaml
components:
  scanning:
    type: labor + passthrough
    formula: calculateScanningCost()
    applies_when: includeScanningService == true

  ocr:
    type: passthrough
    formula: (N_pages / 1000) × ocrCostPer1000
    margin: passthroughMargin

  llm:
    type: passthrough
    formula: (N_pages × tokensPerPage × passes / 1M) × llmCostPerMTokens
    multiplier: includeScanningService ? 0.70 : 1.0
    margin: passthroughMargin

  manual_review:
    type: labor
    formula: (H_rev + H_conflict) × analystRate × billingPct × scanMultiplier
    margin: laborMargin
    billing_pct: (100 - ourManualReviewPct) / 100
    scan_multiplier: includeScanningService ? 0.10 : 1.0
```

#### Build CAPEX (One-Time)
```yaml
labor_components:
  - sa_days × saRate          # Solution Architecture
  - ml_days × mlRate          # ML/AI Engineering
  - be_days × beRate          # Backend Development
  - fe_days × feRate          # Frontend Development
  - devops_days × devopsRate  # DevOps/Deployment
  - qa_days × qaRate          # Quality Assurance/Testing
  - pm_days × pmRate          # Project Management
  margin: laborMargin

passthrough_components:
  - penTest                   # Security Penetration Testing
  margin: passthroughMargin

functional_scope_included_in_labor:
  - Standard questions configuration (BE + FE labor)
  - Siterra integration (BE labor)
  - Deployment preparation (DevOps labor)
  - Platform infrastructure setup (DevOps labor)
  - Security testing coordination (PM labor)

NOTE: Build CAPEX INCLUDES all client requirements (standard questions, integrations, deployment).
These are delivered as part of the development team labor, not charged separately.
```

#### Monthly OPEX (Recurring)
```yaml
platform_costs:      # passthrough margin
  - azureSearch
  - appHosting
  - monitoring

variable_costs:      # passthrough margin
  - storage: (N_pages × mbPerPage / 1024) × costPerGBMonth
  - queries: (nSites / 1000 × queriesPer1000) × costPerQuery

support_costs:       # labor margin
  - supportHours × supportRate
```

### Total Quote Calculation

```javascript
// One-Time CAPEX
capexOneTimeCost = ingestionTotalCost + buildTotalCost
capexOneTimePrice = ingestionTotalPrice + buildTotalPrice

// Annual OPEX
opexAnnualCost = opexTotalCost × 12
opexAnnualPrice = opexTotalPrice × 12

// Total Quote
totalQuoteCost = capexOneTimeCost + opexAnnualCost
totalQuotePrice = capexOneTimePrice + opexAnnualPrice

// Margins
capexGrossMargin = (capexOneTimePrice - capexOneTimeCost) / capexOneTimePrice
overallGrossMargin = (totalQuotePrice - totalQuoteCost) / totalQuotePrice
```

## Competitive Benchmarks

```javascript
benchManualTotal = N_docs × benchmarkManualPerDoc        // Default: £100/doc
benchCompetitorTotal = N_docs × benchmarkCompetitorPerDoc // Default: £75/doc

savingsVsManual = benchManualTotal - capexOneTimePrice
savingsVsCompetitor = benchCompetitorTotal - capexOneTimePrice
```

## Critical Distinctions

### 1. OCR vs Scanning
- **Scanning**: Physical documents → digital images (if includeScanningService == true)
- **OCR**: Digital images → text (ALWAYS runs, even with scanning)
- Both are SEPARATE billable services

### 2. Manual Review Percentage
**INCORRECT Understanding**: "3-5% of documents need review"
**CORRECT Understanding**:
- Review hours calculated from: quality distribution × review rates
- ourManualReviewPct (75%): What Proaptus handles internally
- Client pays for: (100 - 75) = 25% (our oversight/exceptions)
- Scanning multiplier: 0.10 (reduces review TIME by 90%)

### 3. Quality Distribution
- **NOT** automatically changed by scanning toggle
- User selects quality preset manually
- Common presets:
  - No scanning: 50% good, 35% med, 15% poor
  - Controlled scan: 92% good, 6% med, 2% poor
  - Perfect scan: 99% good, 1% med, 0% poor

### 4. Dynamic vs Fixed Values

**DYNAMIC (calculated)**:
- All costs and prices
- Total documents and pages
- Review hours
- Margins

**FIXED (user inputs or config)**:
- Baseline: 17,000 sites
- Document mix: 50/10/10/30 (lease/deed/licence/plan)
- Rates (per day, per page, per token)
- Scenario margins

## Cost Driver Analysis

```javascript
// Ingestion CAPEX breakdown
pctManualOfIngestion = (C_manual / ingestionTotalCost) × 100
pctOCROfIngestion = (C_OCR / ingestionTotalCost) × 100
pctLLMOfIngestion = (C_LLM / ingestionTotalCost) × 100

// Overall quote breakdown (CAPEX + Annual OPEX)
pctManualOfTotal = (C_manual / totalQuoteCost) × 100
pctBuildOfTotal = (buildTotalCost / totalQuoteCost) × 100
pctOPEXOfTotal = (opexAnnualCost / totalQuoteCost) × 100
```

## Validation Rules

```yaml
document_mix: mixLease + mixDeed + mixLicence + mixPlan ≈ 1.0 (±1%)
quality_distribution: qGood + qMed + qPoor ≈ 1.0 (±1%)
review_rates: 0 ≤ rGood, rMed, rPoor ≤ 1
pipeline_passes: ≥ 1
min_max_docs: minDocs ≤ maxDocs
```

## Example Calculation (17,000 sites, Standard scenario)

```yaml
inputs:
  nSites: 17000
  minDocs: 100
  maxDocs: 500
  includeScanningService: true
  ourManualReviewPct: 75

calculated:
  D: 300 docs/site
  N_docs: 5100000 documents
  N_pages: ~51000000 pages (varies by doc mix)

capex:
  ingestion_cost: includes (scanning + OCR + LLM×0.70 + manual×0.10)
  build_cost: labor + pentest
  total_cost: ingestion + build

pricing:
  labor_margin: 0.55 (55%)
  passthrough_margin: 0.15 (15%)
  capex_price: cost / (1 - blended_margin)
  target_margin: 0.60 (60%)
```

## Current Runtime Values

> **Auto-generated from live calculator state**
> Last updated: 2025-11-16T16:27:27.454Z

### Current Inputs

```yaml
# Client Baseline
nSites: 17000
minDocs: 5
maxDocs: 10

# Quality Preset
qualityPreset: excellent
qGood: 0.92
qMed: 0.07
qPoor: 0.01

# Document Mix
docMixPreset: mixed
mixLease: 0.5
mixDeed: 0.1
mixLicence: 0.1
mixPlan: 0.3

# Pages Per Document Type
pagesLease: 25
pagesDeed: 3
pagesLicence: 3
pagesPlan: 5

# Review Configuration
reviewMinutes: 5
conflictMinutes: 1
ourManualReviewPct: 75

# Scanning Service
includeScanningService: true
scannerSpeed: 75
numberOfScanners: 2
workingHoursPerDay: 6
operatorHourlyRate: 15
scannerMonthlyLease: 1000

# OCR & LLM Costs
ocrCostPer1000: 1.23
tokensPerPage: 2100
pipelinePasses: 1.1
llmCostPerMTokens: 5
```

### Current Scenario

```yaml
scenario: conservative
laborMargin: 0.47
passthroughMargin: 0.12
targetMargin: 0.4
```

### Computed Values

```yaml
# Volume
totalDocuments: 127500
totalPages: 1861500

# Pricing
ingestionCAPEX: 242549.47
buildCAPEX: 174005.15
totalCAPEX: 416554.62
annualOPEX: 50922.98

# Scanning Service
scanningPrice: 215266.58

# Margin
margin: 0.44

# Metadata
updated_at: 2025-11-16T16:27:27.455Z
```

---

**For implementation details**: See `PRICING_CALCULATOR_FUNCTIONAL_SPEC.md`
**For scanning calculations**: See `SCANNING_CALCULATION_SPECIFICATION.md`
