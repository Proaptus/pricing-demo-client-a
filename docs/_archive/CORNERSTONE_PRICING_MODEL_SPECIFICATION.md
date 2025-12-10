# Cornerstone Pricing Model - Complete Specification
## Single Source of Truth (SSOT) Documentation

---

## Document Metadata

```yaml
document_type: specification
version: 2.0
date_created: 2024-10-24
last_updated: 2025-11-14
status: active
client: Cornerstone Telecommunications Infrastructure Limited
project: AI Document Intelligence Platform
baseline_requirement: 17,000 sites
```

---

## Table of Contents

1. [Client Overview](#1-client-overview)
2. [Project History & Evolution](#2-project-history--evolution)
3. [Requirements Specification](#3-requirements-specification)
4. [Pricing Model Architecture](#4-pricing-model-architecture)
5. [Financial Model Components](#5-financial-model-components)
6. [Calculation Engine Specification](#6-calculation-engine-specification)
7. [Scenario Configurations](#7-scenario-configurations)
8. [Data Quality Tiers](#8-data-quality-tiers)
9. [Cost Structure Breakdown](#9-cost-structure-breakdown)
10. [Technical Implementation](#10-technical-implementation)
11. [Q&A Agent Context](#11-qa-agent-context)
12. [Change Log](#12-change-log)

---

## 1. Client Overview

### Organization
- **Name**: Cornerstone Telecommunications Infrastructure Limited
- **Industry**: Telecommunications Infrastructure
- **Primary Contact**: Iain Harris, Head of Special Projects
- **Location**: UK (Hive 02, 1530 Arlington Business Park, Theale, Reading, RG7 4SA)

### Business Context
- **Portfolio Size**: ~18,000 telecommunication sites across UK
- **Document Volume**: 5-10 documents per site average
- **Document Types**: Leases (50%), Deeds (10%), Licences (10%), Plans (30%)
- **Current Challenge**: Manual document processing is expensive and slow
- **Strategic Goal**: Digitize and automate document intelligence across entire estate

---

## 2. Project History & Evolution

### Initial Engagement (October 2024)
- **Date**: October 16, 2024
- **Request**: Ball-park pricing for AI document reading service
- **Initial Scope**: Document extraction and processing for site documentation

### First Proposal (October 24, 2024)
- **Delivered**: ROM (Rough Order of Magnitude) estimate
- **CAPEX**: £240k-£330k (one-time)
- **OPEX**: £3k-£5k (monthly)
- **Key Assumption**: Documents already scanned by Cornerstone
- **Benchmarking**: 80% cheaper than manual, 50% cheaper than typical vendors

### Client Questions (November 2025)
1. Hosting location (assumed CTIL infrastructure)
2. Scanning costs (not included in original)
3. Scanning management (not originally scoped)
4. Standard questions setup inclusion
5. Siterra access requirements
6. Ongoing maintenance costs for new sites

### Strategic Pivot (November 14, 2025)
- **New Direction**: Cornerstone wants Proaptus to handle ALL scanning
- **Rationale**: Better quality control, single vendor accountability
- **Impact**: Transforms project from AI-only to end-to-end solution

---

## 3. Requirements Specification

### Core Requirements

#### Volume Requirements
- **Total Sites**: 17,000 (firm baseline, not negotiable)
- **Documents per Site**: 5-10 (average 7.5)
- **Total Documents**: ~127,500 documents
- **Pages per Document Type**:
  - Leases: 25 pages average
  - Deeds: 3 pages average
  - Licences: 3 pages average
  - Plans: 5 pages average
- **Total Pages**: ~1,275,000 pages

#### Functional Requirements
1. **Document Scanning**: High-quality scanning of all physical documents
2. **OCR Processing**: Optical Character Recognition with text extraction
3. **AI Extraction**: Intelligent data extraction from documents
4. **Data Structuring**: Convert unstructured data to structured format
5. **Quality Assurance**: Validation and conflict resolution
6. **Integration**: Export to Siterra or other systems
7. **Scalability**: Handle unlimited additional documents
8. **Maintenance**: Ongoing support for new sites/updates

#### Performance Requirements
- **Accuracy Target**: 95%+ extraction accuracy
- **Processing Speed**: Complete 17,000 sites within 6 months
- **Availability**: 99.5% platform uptime
- **Response Time**: <2 seconds for document retrieval

#### Security Requirements
- **Data Protection**: GDPR compliant
- **Access Control**: Role-based permissions
- **Audit Trail**: Complete activity logging
- **Encryption**: At-rest and in-transit

---

## 4. Pricing Model Architecture

### Model Type
**Activity-Based Costing (ABC) Model** with scenario-based pricing strategies

### Core Components

#### Input Parameters
1. **Volume Inputs**
   - Total sites (17,000)
   - Documents per site range (5-10)
   - Document type distribution
   - Page counts by type

2. **Quality Inputs**
   - Document quality distribution (Good/Medium/Poor)
   - Review rates by quality tier
   - Conflict resolution estimates

3. **Cost Inputs**
   - Labor rates (by role)
   - Technology costs (OCR, LLM, storage)
   - Infrastructure costs

4. **Scenario Parameters**
   - Markup percentages
   - Amortization periods
   - Target margins

### Calculation Flow
```
Inputs → Volume Calculations → Cost Calculations → Markup Application →
Amortization → Price Generation → Margin Analysis → Benchmarking
```

---

## 5. Financial Model Components

### CAPEX Components

#### Without Scanning (Original Model)
| Component | Cost | Description |
|-----------|------|-------------|
| ML Model Development | £110,000 | AI model training and optimization |
| Integration & Testing | £65,000 | System integration and QA |
| Conflict Resolution | £95,000 | Manual review and conflict handling |
| Security & Compliance | £15,000 | Pen testing and compliance |
| Project Management | £35,000 | Coordination and reporting |
| **Total CAPEX** | **£320,000** | One-time setup costs |

#### With Scanning (Revised Model)
| Component | Cost | Description |
|-----------|------|-------------|
| Document Scanning | £175,000 | Physical document digitization |
| OCR & Preprocessing | £25,000 | Text extraction and optimization |
| ML Model Development | £110,000 | AI model training |
| Integration & Testing | £65,000 | System integration |
| Conflict Resolution | £7,500 | Reduced due to quality control |
| Security & Compliance | £15,000 | Pen testing and compliance |
| Project Management | £45,000 | Increased coordination |
| **Total CAPEX** | **£442,500** | One-time setup costs |

### OPEX Components

| Component | Monthly Cost | Annual Cost | Description |
|-----------|-------------|------------|-------------|
| Platform Maintenance | £1,500 | £18,000 | System upkeep |
| Quality Monitoring | £500 | £6,000 | Ongoing QA |
| Support & Updates | £1,000 | £12,000 | Customer support |
| Infrastructure | £500 | £6,000 | Cloud/hosting |
| **Total OPEX** | **£3,500** | **£42,000** | Recurring costs |

---

## 6. Calculation Engine Specification

### Core Algorithm

```javascript
function computeModel(inputs, scenarioConfig) {
  // Step 1: Volume Calculations
  const avgDocsPerSite = (inputs.minDocs + inputs.maxDocs) / 2;
  const totalDocs = inputs.nSites * avgDocsPerSite;

  // Step 2: Page Calculations
  const pagesPerDoc =
    (inputs.mixLease * inputs.pagesLease) +
    (inputs.mixDeed * inputs.pagesDeed) +
    (inputs.mixLicence * inputs.pagesLicence) +
    (inputs.mixPlan * inputs.pagesPlan);
  const totalPages = totalDocs * pagesPerDoc;

  // Step 3: Quality-Based Review Calculations
  const reviewRate =
    (inputs.qGood * inputs.rGood) +
    (inputs.qMed * inputs.rMed) +
    (inputs.qPoor * inputs.rPoor);
  const docsRequiringReview = totalDocs * reviewRate;
  const reviewHours = docsRequiringReview * (inputs.reviewMinutes / 60);

  // Step 4: Cost Calculations
  const ocrCost = (totalPages / 1000) * inputs.ocrCostPer1000;
  const llmCost = calculateLLMCost(totalPages, inputs);
  const manualReviewCost = reviewHours * config.analystRate;

  // Step 5: Apply Markups
  const laborMarkup = config.laborMarkup;
  const passthroughMarkup = config.passthroughMarkup;

  // Step 6: Calculate Prices
  const ingestionPrice =
    (manualReviewCost * (1 + laborMarkup)) +
    ((ocrCost + llmCost) * (1 + passthroughMarkup));

  // Step 7: Amortization
  const amortizedBuildCost = buildCost / config.amortizationSites;
  const pricePerSite = (ingestionPrice / inputs.nSites) + amortizedBuildCost;

  // Step 8: Margin Calculation
  const grossMargin = (price - cost) / price;

  return {
    volumes, costs, prices, margins, benchmarks
  };
}
```

### Key Calculations

#### Document Volume
```
Total Documents = Sites × Average(MinDocs, MaxDocs)
Example: 17,000 × 7.5 = 127,500 documents
```

#### Page Count
```
Total Pages = Total Documents × Weighted Average Pages
Example: 127,500 × 10 pages = 1,275,000 pages
```

#### Review Requirements
```
Review Rate = Σ(Quality% × ReviewRate%)
Documents to Review = Total Documents × Review Rate
Review Hours = Documents to Review × (Minutes per Doc / 60)
```

#### Cost Structure
```
Ingestion Cost = OCR Cost + LLM Cost + Manual Review Cost
Build Cost = Development + Testing + Security + PM
Total Cost = Ingestion + Build
Price = Cost × (1 + Markup)
```

---

## 7. Scenario Configurations

### Conservative Scenario
```javascript
{
  name: 'Conservative',
  laborMarkup: 0.50,        // 50% on labor
  passthroughMarkup: 0.10,  // 10% on technology
  amortizationSites: 1000,  // Spread over 1,000 sites
  targetMargin: 0.33,       // 33% gross margin
  teamType: 'internal'      // In-house team
}
```

### Standard Scenario
```javascript
{
  name: 'Standard',
  laborMarkup: 0.55,        // 55% on labor
  passthroughMarkup: 0.15,  // 15% on technology
  amortizationSites: 5000,  // Spread over 5,000 sites
  targetMargin: 0.60,       // 60% gross margin
  teamType: 'hybrid'        // Mix of internal/contractor
}
```

### Aggressive Scenario
```javascript
{
  name: 'Aggressive',
  laborMarkup: 1.00,        // 100% on labor
  passthroughMarkup: 0.20,  // 20% on technology
  amortizationSites: 10000, // Spread over 10,000 sites
  targetMargin: 0.75,       // 75% gross margin
  teamType: 'internal'      // In-house team
}
```

---

## 8. Data Quality Tiers

### Original Quality Tiers (Pre-Scanning)

#### High Quality
- **Good**: 65% | **Medium**: 25% | **Poor**: 10%
- **Review Rates**: Good 3% | Medium 10% | Poor 25%
- **Review Time**: 15 minutes per document
- **Documents/Site**: 4-8

#### Medium Quality (Baseline)
- **Good**: 50% | **Medium**: 35% | **Poor**: 15%
- **Review Rates**: Good 5% | Medium 15% | Poor 35%
- **Review Time**: 20 minutes per document
- **Documents/Site**: 5-10

#### Low Quality
- **Good**: 35% | **Medium**: 40% | **Poor**: 25%
- **Review Rates**: Good 10% | Medium 25% | Poor 45%
- **Review Time**: 30 minutes per document
- **Documents/Site**: 8-15

### New Quality Tier (With Controlled Scanning)

#### Controlled Scan Quality
- **Good**: 85% | **Medium**: 12% | **Poor**: 3%
- **Review Rates**: Good 1% | Medium 5% | Poor 15%
- **Review Time**: 8 minutes per document
- **Conflict Time**: 2 minutes per site (down from 18)
- **Documents/Site**: 5-10 (consistent)

### Impact Analysis
| Metric | Without Scanning | With Scanning | Improvement |
|--------|-----------------|---------------|-------------|
| Good Quality Docs | 50% | 85% | +70% |
| Review Rate | 15% | 3% | -80% |
| Conflicts/Site | 18 min | 2 min | -89% |
| Manual Hours | 5,100 | 1,020 | -80% |
| Accuracy | 85% | 95% | +12% |

---

## 9. Cost Structure Breakdown

### Ingestion CAPEX (Per 17,000 Sites)

#### Scanning Costs (NEW)
```
Base Rate: £0.15 per page
Pages: 1,275,000
Base Cost: £191,250
Volume Discount: -£38,250 (20%)
QA Premium: +£22,000
Total Scanning: £175,000
```

#### OCR Costs
```
Rate: £3.50 per 1,000 pages
Pages: 1,275,000
Total OCR: £4,462
```

#### LLM Processing Costs
```
Tokens per Page: 3,000
Total Tokens: 3.825 billion
Rate: £0.65 per million tokens
Total LLM: £2,486
```

#### Manual Review Costs
```
Without Scanning:
- Review Hours: 5,100
- Our Portion (10%): 510 hours
- Cost: £38,250

With Scanning:
- Review Hours: 1,020
- Our Portion (25%): 255 hours
- Cost: £19,125
```

### Build CAPEX

#### Development Team
```
Solution Architect: 15 days @ £800/day = £12,000
ML Engineer: 20 days @ £700/day = £14,000
Backend Dev: 25 days @ £600/day = £15,000
Frontend Dev: 20 days @ £550/day = £11,000
DevOps: 10 days @ £650/day = £6,500
QA Engineer: 15 days @ £500/day = £7,500
Project Manager: 20 days @ £600/day = £12,000
Total: £78,000
```

#### Infrastructure & Tools
```
Pen Testing: £8,000
Azure Search: £2,000/month × 6 = £12,000
Development Tools: £5,000
Total: £25,000
```

### Monthly OPEX

#### Operational Costs
```
Support (0.5 FTE): £2,000
Monitoring: £500
Infrastructure: £500
Updates: £500
Total Monthly: £3,500
```

---

## 10. Technical Implementation

### Technology Stack
- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Recharts 2
- **Backend**: Node.js, Express
- **AI/ML**: OpenAI GPT-4, Azure Cognitive Services
- **Infrastructure**: Azure Cloud, Docker containers
- **Database**: PostgreSQL for structured data
- **Storage**: Azure Blob Storage for documents

### Architecture Components

#### Document Processing Pipeline
1. **Scanning Module**: Physical to digital conversion
2. **OCR Engine**: Text extraction with confidence scoring
3. **AI Extraction**: Entity recognition and data structuring
4. **Validation Layer**: Business rules and quality checks
5. **Export Module**: Integration with client systems

#### User Interface
- **Dashboard**: Real-time processing metrics
- **Document Viewer**: Original + extracted data side-by-side
- **Quality Console**: Review and correction interface
- **Reports Module**: Analytics and export capabilities

### Performance Specifications
- **Throughput**: 1,000 documents/day minimum
- **Accuracy**: 95%+ for high-quality documents
- **Latency**: <2 seconds for retrieval
- **Scalability**: Horizontal scaling to 10x volume

---

## 11. Q&A Agent Context

### Key Information for Q&A Agent

#### Project Fundamentals
- **Client**: Cornerstone Telecommunications
- **Requirement**: Process 17,000 sites (non-negotiable baseline)
- **Timeline**: 6 months for initial deployment
- **Budget Range**: £450k CAPEX, £3.5k/month OPEX

#### Value Propositions
1. **Cost Savings**: 80% cheaper than manual processing
2. **Time Savings**: 40% faster than traditional methods
3. **Quality Improvement**: 95% accuracy vs 75% manual
4. **Risk Reduction**: Single vendor accountability

#### Common Questions & Answers

**Q: Why is scanning included now?**
A: Client requested it for better quality control and single vendor simplicity. It actually reduces total cost when considering the elimination of conflict resolution work.

**Q: What's the ROI?**
A: Break-even at month 36, with 5-year NPV of £165,000 in savings.

**Q: Can you handle more than 17,000 sites?**
A: Yes, the platform is designed to scale. Additional sites can be added at marginal cost.

**Q: What if document quality is poor?**
A: With controlled scanning, we ensure 85% high quality. For existing poor scans, we have remediation processes.

**Q: How does pricing compare to competitors?**
A: 50% cheaper than typical commercial vendors, 80% cheaper than manual abstraction.

#### Critical Success Factors
1. **Scanning Quality**: Must achieve 300 DPI, proper OCR
2. **Processing Accuracy**: 95%+ extraction accuracy required
3. **Timeline Adherence**: 6-month deployment is firm
4. **Integration Success**: Must work with Siterra

#### Risk Mitigations
- **Pilot Program**: 1,000 sites first to prove concept
- **Quality Gates**: Validation at each pipeline stage
- **Parallel Processing**: Multiple teams for faster delivery
- **Contingency Planning**: 20% buffer in timeline and budget

---

## 12. Change Log

### Version 2.0 (2025-11-14)
- Added controlled scanning capability
- Updated cost structure with scanning costs
- Reduced conflict resolution from £95k to £7.5k
- Added "Controlled Scan" quality tier
- Updated OPEX to £3.5k/month
- Documented 17,000 sites as firm baseline

### Version 1.0 (2024-10-24)
- Initial pricing model
- Assumed pre-scanned documents
- CAPEX £320k, OPEX £5k/month
- Three scenarios (Conservative, Standard, Aggressive)
- Benchmarking against manual and competitors

---

## Appendices

### A. Detailed Cost Calculations
[See Section 9 for comprehensive breakdown]

### B. Technical Specifications
[See Section 10 for architecture details]

### C. Risk Register
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Scanning delays | Low | Medium | Parallel teams |
| Quality issues | Very Low | High | QA at scan point |
| Scope creep | Medium | Medium | Change control |
| Integration issues | Low | High | Early testing |

### D. Competitive Analysis
| Vendor | Service | Price | Quality | Risk |
|--------|---------|-------|---------|------|
| Proaptus | End-to-end | £450k | 95% | Low |
| Vendor A | AI only | £380k | 85% | High |
| Vendor B | Scan+AI | £520k | 90% | Med |
| Manual | Labor | £750k | 75% | Low |

### E. References
- Original RFQ: October 16, 2024
- ROM Proposal: October 24, 2024
- Client Questions: November 2025
- Scanning Decision: November 14, 2025

---

**Document Status**: ACTIVE - This is the single source of truth for the Cornerstone pricing model
**Last Review**: 2025-11-14
**Next Review**: Monthly updates as project progresses
**Owner**: Proaptus Pricing Team
**Distribution**: Internal + Q&A Agent Training

---

*This document contains confidential and proprietary information.*