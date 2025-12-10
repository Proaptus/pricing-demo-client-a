---
id: CLIENT-REQ-2025-11
doc_type: reference
title: "Client Requirements - Cornerstone CTIL"
status: accepted
last_verified_at: 2025-11-15
owner: "@proaptus-sales"
supersedes: ["CLIENT_COMMUNICATION_HISTORY"]
search:
  boost: 2
  keywords: ["client", "cornerstone", "requirements", "baseline"]
---

# Client Requirements - Cornerstone CTIL

## Client Profile

```yaml
organization: Cornerstone Telecommunications Infrastructure Limited
contact:
  name: Iain Harris
  role: Head of Special Projects
  email: iain.harris@cornerstone.network
  phone: "07919 555580"
location: "Hive 02, 1530 Arlington Business Park, Theale, Reading, RG7 4SA"
industry: Telecommunications Infrastructure
```

## Project Timeline

```yaml
2024-10-16: Initial inquiry
2024-10-24: First ROM proposal delivered
2025-11-14: Client requests scanning service inclusion
2025-11-15: Current status - preparing revised proposal
```

## Baseline Requirements

```yaml
sites: 17000                    # Firm requirement
documents_per_site: 5-10        # Average 7.5
total_documents: ~127500
document_types:
  lease: 50%        # 25 pages avg
  deed: 10%         # 3 pages avg
  licence: 10%      # 3 pages avg
  plan: 30%         # 5 pages avg
```

## Scope Evolution

### Original Scope (October 2024)
```yaml
scanning: false                 # Client provides scanned docs
deliverable: AI extraction + processing
capex: £240k-£330k
opex: £3k-£5k monthly
```

### Current Scope (November 2025)
```yaml
scanning: true                  # Proaptus manages complete scanning
deliverable: End-to-end solution (scan → extract → process)
rationale:
  - Quality control (single vendor accountability)
  - Better input quality → better AI results
  - Client labor savings (£81k-£90k)
```

## Key Decisions

### 1. Scanning Service Inclusion
**Date**: 2025-11-14
**Decision**: Include comprehensive scanning service
**Impact**:
- LLM costs reduce by 30% (better image quality)
- Manual review reduces by 90% (fewer conflicts)
- Client saves £81k-£90k in internal labor
- Quality improves: 50% good → 85%+ good (with quality preset)

### 2. Hosting Location
**Confirmed**: CTIL infrastructure (client-hosted)

### 3. Standard Questions Setup
**Included**: ✅ Yes, covered in Build CAPEX
**Delivered by**: Backend Developer + Frontend Developer labor
**No Additional Charge**: Included in quoted Build CAPEX (£174,005)

### 4. Siterra Integration
**Included**: ✅ Yes, covered in Build CAPEX
**Delivered by**: Backend Developer labor (RESTful APIs)
**No Additional Charge**: Included in quoted Build CAPEX (£174,005)

### 5. Ongoing Maintenance
**Model**: Monthly OPEX (calculated dynamically)
**Includes**: Infrastructure, support hours, monitoring

## Success Criteria

```yaml
quality:
  target: 95%+ extraction accuracy
  verification: Test-based validation

timeline:
  processing_capacity: 1000 documents/day
  full_deployment: 6 months for 17000 sites

scalability:
  design: Unlimited growth capability
  architecture: Cloud-native, auto-scaling
```

## Competitive Position

```yaml
vs_manual_processing:
  cost_reduction: 80%
  method: £100/doc manual vs £20/doc automated (example)

vs_competitors:
  cost_reduction: 50%
  method: £75/doc competitor vs £20/doc Cornerstone (example)

unique_advantage:
  - Only vendor offering complete end-to-end solution
  - Scanning through delivery (single accountability)
  - Quality guarantee via controlled scanning
```

## Technical Stack

```yaml
frontend: React 18, Vite 5, Tailwind CSS
ai_ml: OpenAI GPT-4, Azure Cognitive Services
infrastructure: Azure Cloud
integration: RESTful APIs, Siterra compatible
```

## Current Baseline Quote (Conservative Scenario)

> **Auto-generated from current default inputs**
> Last updated: 2025-11-16T16:27:27.455Z

### Project Baseline
```yaml
# Client Requirements
sites: 17000
avgDocsPerSite: 7.5
totalDocuments: 127500
totalPages: 1861500

# Scanning Service Configuration
includeScanningService: true
scannerSpeed: 75          # pages/min/scanner
numberOfScanners: 2
workingHoursPerDay: 6
operatorHourlyRate: 15    # £/hour
scannerMonthlyLease: 1000 # £/month/scanner
```

### Financial Summary (Conservative Margins)
```yaml
# One-Time CAPEX (Client Quote)
ingestionCAPEX: 242549    # £ (includes scanning)
buildCAPEX: 174005        # £ (platform development)
totalCAPEX: 416555        # £ ONE-TIME INVESTMENT

# Annual OPEX (Client Quote)
monthlyOPEX: 4244         # £/month
annualOPEX: 50923         # £/year

# Total First Year Investment
totalFirstYear: 467477    # £ (CAPEX + OPEX Year 1)

# Margins (Conservative Scenario)
laborMargin: 0.47         # 47% on labor
passthroughMargin: 0.12   # 12% on passthrough
overallBlendedMargin: 0.44 # 44% blended
```

### Major Cost Components (Client Prices)
```yaml
# Ingestion CAPEX Breakdown
documentScanning: 215267  # £ (51.7% of total CAPEX)
llmProcessing: 17103      # £ (AI extraction)
manualReview: 7578        # £ (25% client-billed portion)
ocrProcessing: 2602       # £ (text extraction)
ingestionTotal: 242549    # £

# Build CAPEX Breakdown
developmentLabor: 162642  # £ (team costs)
buildPassthrough: 11364   # £ (pentest, tools)
buildTotal: 174005        # £

# Monthly OPEX (Recurring)
platformCosts: 900        # £/month (Azure, monitoring)
storageCosts: 2216        # £/month (data storage)
queryCosts: 1021          # £/month (API usage)
monthlyTotal: 4244        # £/month
```

### Scanning Service Details
```yaml
# Timeline
projectDuration: 3        # months (50 working days)
dailyCapacity: 37800      # pages/day
totalLaborHours: 4705     # hours (prep + scan + QA)

# Cost Economics
internalCost: 116478      # £ (our cost)
clientPrice: 215267       # £ (quoted price)
scanningMargin: 0.46      # 46% blended margin
costPerPage: 0.063        # £/page (cost)
pricePerPage: 0.116       # £/page (price)
```

### Cost Reduction from Scanning
```yaml
# Efficiency Gains (vs no scanning)
llmCostReduction: 30%     # Better image quality
manualReviewReduction: 90% # Fewer conflicts
totalEfficiencySavings: 42642 # £ (LLM + manual savings)

# Client Labor Savings
estimatedClientLaborSavings: 81000-90000 # £ (DIY scanning avoided)
```

### Competitive Position
```yaml
# Per-Document Economics
ourPricePerDoc: ~3.27     # £/doc (416555 ÷ 127500)
manualBenchmark: 12.00    # £/doc (manual processing)
competitorBenchmark: 5.00 # £/doc (typical competitor)

# Savings vs Alternatives
savingsVsManual: 73%      # ((12 - 3.27) / 12)
savingsVsCompetitor: 35%  # ((5 - 3.27) / 5)
```

---

**For detailed pricing**: See `PRICING_MODEL_REFERENCE.md`
**For calculations**: See `SCANNING_CALCULATION_SPECIFICATION.md`
**Historical emails**: Archived in `_archive/CLIENT_COMMUNICATION_HISTORY.md`
