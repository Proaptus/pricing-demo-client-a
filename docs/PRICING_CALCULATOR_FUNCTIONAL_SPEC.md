# Cornerstone Pricing Calculator - Functional Specification
## Business Functionality and Features

---

## Overview

The Cornerstone Pricing Calculator is a React-based web application that implements the pricing model described in `CORNERSTONE_PRICING_MODEL_SPECIFICATION.md`. This document describes HOW the calculator works, what it does, and how users interact with it.

---

## Calculator Purpose

The calculator serves as an **interactive pricing tool** that:
1. Allows users to adjust input parameters
2. Automatically recalculates costs and prices in real-time
3. Compares different pricing scenarios
4. Visualizes margins and benchmarks
5. Exports complete pricing models as JSON

---

## User Interface Components

### 1. Scenario Selector
**Location**: Top of interface
**Function**: Quick selection between three pre-configured pricing strategies
**Options**:
- Conservative (33% margin target)
- Standard (60% margin target)
- Aggressive (75% margin target)

### 2. Key Assumptions Section
**Purpose**: Primary inputs that most affect pricing
**Fields**:
```yaml
Total Sites: 17,000 (number input)
Min Docs/Site: 5 (range: 1-50)
Max Docs/Site: 10 (range: 1-50)
Review Minutes: 20 (time per document)
Conflict Minutes: 18 (time per site)
Our Manual Review %: 10% (portion we handle)
```

### 3. Advanced Assumptions (Expandable)
**Purpose**: Granular control over all model parameters
**Sections**:

#### Document Mix
```yaml
Leases: 50% (slider)
Deeds: 10% (slider)
Licences: 10% (slider)
Plans: 30% (slider)
Total: Must equal 100%
```

#### Quality Distribution
```yaml
Good Quality: 50% (slider)
Medium Quality: 35% (slider)
Poor Quality: 15% (slider)
Total: Must equal 100%
```

#### Review Rates
```yaml
Good Docs Review: 5% (percentage needing review)
Medium Docs Review: 15%
Poor Docs Review: 35%
```

#### Technology Costs
```yaml
OCR Cost per 1000 pages: £3.50
Tokens per Page: 3,000
LLM Cost per Million Tokens: £0.65
Pipeline Passes: 1.5
```

#### Team Configuration
```yaml
Solution Architect Days: 15
ML Engineer Days: 20
Backend Developer Days: 25
Frontend Developer Days: 20
DevOps Days: 10
QA Days: 15
PM Days: 20
```

### 4. Assumption Presets
**Purpose**: Load predefined quality/complexity scenarios
**Options**:
- High Quality (Clean data, minimal review)
- Medium Quality (Current baseline)
- Low Quality (Challenging data, high review)
- Controlled Scan (NEW - with scanning service)

### 5. Cost & Price Tables

#### Ingestion CAPEX Table
Shows breakdown of one-time document processing costs:
- OCR Processing
- AI/LLM Extraction
- Manual Review Support
- Scanning Services (if enabled)

#### Build CAPEX Table
Shows platform development costs:
- Development Team
- Infrastructure Setup
- Security & Testing
- Project Management

#### Monthly OPEX Table
Shows recurring operational costs:
- Support Services
- Platform Maintenance
- Infrastructure
- Quality Monitoring

### 6. Visual Analytics

#### Margin Analysis Dashboard
**Display Type**: Dark-themed dashboard cards
**Metrics Shown**:
- Total Cost
- Total Price
- Gross Profit
- Gross Margin %
- Price per Site

#### Cost Breakdown Waterfall
**Display Type**: Waterfall chart
**Purpose**: Visualize cost buildup from components to total

#### Competitive Benchmarking
**Display Type**: Bar chart comparison
**Comparisons**:
- Our Solution (with selected scenario)
- Manual Abstraction (£100/doc baseline)
- Typical Competitor (£75/doc)

#### Cost Driver Analysis
**Display Type**: Pie chart
**Purpose**: Show relative impact of cost components

### 7. Scenario Comparison
**Toggle**: "Show Scenario Comparison"
**Features**:
- Side-by-side comparison of all three scenarios
- Line chart showing margin progression
- Table with key metrics for each scenario

### 8. Export & Reporting

#### JSON Export
**Button**: "Export JSON"
**Contains**:
```json
{
  "scenario": "Standard",
  "inputs": { /* all current inputs */ },
  "model": { /* all calculated values */ },
  "timestamp": "2025-11-14T10:30:00Z"
}
```

#### Professional Report (Coming)
**Features**:
- PDF generation
- Executive summary
- Detailed breakdowns
- Charts and visualizations

### 9. Q&A Integration
**Component**: PricingQA
**Purpose**: AI-powered Q&A about the current model
**Features**:
- Natural language queries
- Context-aware responses based on current inputs
- Explanations of calculations
- What-if scenario analysis

---

## Calculation Logic

### Real-time Recalculation
The calculator uses React's `useMemo` hook to automatically recalculate whenever inputs change:

```javascript
const model = useMemo(() => {
  return computeModel(inputs, SCENARIO_CONFIGS[scenario]);
}, [inputs, scenario]);
```

### Validation System

#### Input Validation Rules
1. **Document Mix**: Must total 100% (±1% tolerance)
2. **Quality Distribution**: Must total 100% (±1% tolerance)
3. **Review Rates**: Must be between 0-100%
4. **Numeric Values**: Must be non-negative
5. **Page Counts**: Must be positive integers

#### Warning System
Displays warnings for:
- High poor quality rate (>40%)
- Excessive review time (>40 min/doc)
- Very low margin (<20%)
- High conflict time (>30 min/site)
- Low good quality (<20%)

### State Management

#### Component State
```javascript
const [inputs, setInputs] = useState(defaultInputs);
const [scenario, setScenario] = useState('standard');
const [showAdvanced, setShowAdvanced] = useState(false);
const [showComparison, setShowComparison] = useState(false);
```

#### Input Updates
All inputs use controlled components with onChange handlers:
```javascript
onChange={(e) => setInputs(prev => ({
  ...prev,
  fieldName: parseFloat(e.target.value)
}))}
```

---

## Data Flow

### Input → Calculation → Display Pipeline

```mermaid
graph LR
    A[User Input] --> B[Validation]
    B --> C[computeModel()]
    C --> D[Memoized Result]
    D --> E[UI Components]
    E --> F[Visual Display]

    G[Scenario Selection] --> C
    H[Preset Loading] --> A

    D --> I[Export JSON]
    D --> J[Q&A Context]
```

### Key Data Structures

#### Inputs Object
```javascript
{
  nSites: 17000,
  minDocs: 5,
  maxDocs: 10,
  qualityPreset: 'medium',
  mixLease: 0.5,
  mixDeed: 0.1,
  mixLicence: 0.1,
  mixPlan: 0.3,
  qGood: 0.50,
  qMed: 0.35,
  qPoor: 0.15,
  rGood: 0.05,
  rMed: 0.15,
  rPoor: 0.35,
  reviewMinutes: 20,
  conflictMinutes: 18,
  ourManualReviewPct: 10,
  // ... technology and team inputs
}
```

#### Model Output Object
```javascript
{
  // Volumes
  D: 7.5,              // Avg docs per site
  N_docs: 127500,      // Total documents
  N_pages: 1861500,    // Total pages

  // Costs (Internal)
  C_OCR: 2289,         // OCR cost
  C_LLM: 10853,        // LLM cost
  C_manual: 5694,      // Manual review cost
  C_scanning: 116478,  // Scanning service cost
  ingestionTotalCost: 135314,
  buildTotalCost: 98114,

  // Prices (Client Quote)
  P_OCR: 2602,         // OCR price
  P_LLM: 17103,        // LLM price
  P_manual_eng: 7578,  // Manual review price
  P_scanning: 215267,  // Scanning service price
  ingestionTotalPrice: 242549,
  buildTotalPrice: 174005,

  // Total Quote
  capexOneTimeCost: 233428,    // Internal cost
  capexOneTimePrice: 416555,   // Client price
  opexAnnualCost: 30408,       // Internal cost
  opexAnnualPrice: 50923,      // Client price

  // Margins
  grossMargin: 0.44,   // 44% for Conservative scenario
  capexGrossMargin: 0.44,

  // Benchmarks
  vsManual: savings in £,
  vsCompetitor: savings in £,

  // Line items for detailed tables
  lineItems: { /* detailed breakdown */ }
}
```

---

## Features & Capabilities

### 1. Dynamic Pricing Scenarios
- Switch between Conservative/Standard/Aggressive instantly
- Each scenario has different markups and target margins
- Amortization period varies by scenario

### 2. Quality Presets
- Load predefined quality distributions
- Instantly see impact of data quality on costs
- New "Controlled Scan" preset for scanning service

### 3. Real-time Validation
- Immediate feedback on invalid inputs
- Warning system for suboptimal configurations
- Prevents calculation with invalid data

### 4. Comprehensive Benchmarking
- Compare against manual processing costs
- Compare against typical competitor pricing
- Show savings percentage and absolute values

### 5. Export Capabilities
- Complete model export as JSON
- Includes all inputs and calculations
- Timestamped for audit trail
- Suitable for importing into other systems

### 6. Visual Analytics
- Multiple chart types (bar, line, waterfall, pie)
- Responsive design for all screen sizes
- Professional color scheme and formatting

### 7. Scenario Comparison
- Side-by-side view of all three scenarios
- Helps decision-making on pricing strategy
- Shows trade-offs between margin and competitiveness

---

## User Workflows

### Typical Usage Flow

1. **Start with Scenario Selection**
   - Choose Conservative/Standard/Aggressive based on strategy

2. **Adjust Key Assumptions**
   - Set site count (17,000 baseline)
   - Adjust document complexity if needed

3. **Load Quality Preset** (Optional)
   - Choose High/Medium/Low/Controlled Scan
   - Automatically updates quality and review parameters

4. **Fine-tune Advanced Settings** (Optional)
   - Expand advanced section
   - Adjust technology costs, team days, etc.

5. **Review Results**
   - Check margin analysis dashboard
   - Review cost breakdown tables
   - Compare against benchmarks

6. **Compare Scenarios** (Optional)
   - Toggle comparison view
   - Analyze all three scenarios together

7. **Export Model**
   - Click Export JSON
   - Save for further analysis or documentation

### Power User Features

- **Decimal Precision**: All inputs support decimal values
- **Percentage Inputs**: Can type exact percentages
- **Keyboard Navigation**: Tab through all inputs
- **Copy/Paste**: Values can be copied between sessions

---

## Integration Points

### With Q&A Agent
The calculator provides context through:
1. Current input values
2. Calculated model results
3. Selected scenario configuration
4. Validation state and warnings

### With Export Systems
JSON export can be:
1. Imported into Excel for further analysis
2. Used as input for proposal generation
3. Stored as audit trail
4. Shared with stakeholders

### With Backend Systems
Future integrations planned:
1. Save/load scenarios to database
2. Multi-user collaboration
3. Version control for pricing models
4. API endpoints for programmatic access

---

## Technical Implementation

### React Component Architecture
```
CornerstonePricingCalculator (Main)
├── ScenarioSelector
├── KeyAssumptions
├── AdvancedAssumptions
├── ValidationAlert
├── IngestionCapexTable
├── BuildCapexTable
├── MonthlyOpexTable
├── MarginAnalysis
├── CompetitiveBenchmarking
├── CostBreakdownWaterfall
├── CostDriverAnalysis
├── ScenarioComparison
├── PricingQA
└── Export Functions
```

### Performance Optimizations
1. **Memoization**: Expensive calculations cached
2. **Lazy Loading**: Advanced sections load on demand
3. **Debouncing**: Input changes debounced for performance
4. **Virtual Scrolling**: Large tables use virtualization

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Responsive Design
- Mobile: Single column layout
- Tablet: Two column layout
- Desktop: Full multi-column layout

---

## Future Enhancements

### Planned Features
1. **Multi-language Support**: Internationalization
2. **Dark/Light Theme Toggle**: User preference
3. **Scenario Library**: Save and share scenarios
4. **Collaboration**: Real-time multi-user editing
5. **Advanced Analytics**: Monte Carlo simulation
6. **API Access**: RESTful API for integrations
7. **Audit Trail**: Complete change history
8. **Role-based Access**: Different views for different users

### Integration Roadmap
1. **Phase 1**: Siterra integration
2. **Phase 2**: CRM integration
3. **Phase 3**: ERP integration
4. **Phase 4**: BI tool integration

---

## Support & Documentation

### For Q&A Agent
Key points to remember:
1. Calculator is React-based, runs in browser
2. All calculations are real-time
3. 17,000 sites is the baseline
4. Three scenarios available
5. Export provides complete model
6. Validation prevents errors
7. Benchmarking shows competitive position

### Common Issues & Solutions
| Issue | Solution |
|-------|----------|
| Totals don't add to 100% | Adjust sliders to sum correctly |
| Negative margins | Reduce costs or increase markups |
| Export not working | Check browser permissions |
| Charts not displaying | Update browser or clear cache |

---

## Current Baseline Calculations (Conservative Scenario)

> **Auto-generated from current default inputs**
> Last updated: 2025-11-16T16:27:27.455Z

### Default Inputs
```yaml
# Project Baseline
nSites: 17000
minDocs: 5
maxDocs: 10
avgDocsPerSite: 7.5

# Quality Configuration (Excellent Preset)
qualityPreset: excellent
qGood: 0.92
qMed: 0.07
qPoor: 0.01
reviewGood: 0.01
reviewMed: 0.03
reviewPoor: 0.10

# Document Mix (Mixed Preset)
docMixPreset: mixed
mixLease: 0.50
mixDeed: 0.10
mixLicence: 0.10
mixPlan: 0.30

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
qaReviewPercentage: 10

# OCR & LLM Configuration
ocrCostPer1000: 1.23
tokensPerPage: 2100
pipelinePasses: 1.1
llmCostPerMTokens: 5
```

### Calculated Volumes
```yaml
totalDocuments: 127500
totalPages: 1861500
avgPagesPerDoc: 14.6

# Document Type Breakdown
nLeases: 63750          # 50% of documents
nDeeds: 12750           # 10% of documents
nLicences: 12750        # 10% of documents
nPlans: 38250           # 30% of documents

# Page Count Breakdown
pagesLeases: 1593750    # 63,750 × 25 pages
pagesDeeds: 38250       # 12,750 × 3 pages
pagesLicences: 38250    # 12,750 × 3 pages
pagesPlans: 191250      # 38,250 × 5 pages
```

### Conservative Scenario Configuration
```yaml
scenario: conservative
laborMargin: 0.47       # 47% on labor
passthroughMargin: 0.12 # 12% on passthrough
targetMargin: 0.40      # 40% target overall
amortizationSites: 1000 # Spread build over 1,000 sites
```

### Calculated Costs (Internal)
```yaml
# Ingestion CAPEX (Internal Costs)
C_scanning: 116478      # £ (scanning service cost)
C_OCR: 2289             # £ (OCR processing)
C_LLM: 10853            # £ (LLM extraction)
C_manual: 5694          # £ (manual review)
ingestionTotalCost: 135314 # £

# Build CAPEX (Internal Costs)
buildLaborCost: 86778   # £ (team costs)
buildPassthroughCost: 11336 # £ (pentest)
buildTotalCost: 98114   # £

# Total CAPEX (Internal)
capexOneTimeCost: 233428 # £

# Monthly OPEX (Internal Costs)
opexTotalCost: 2534     # £/month
opexAnnualCost: 30408   # £/year
```

### Calculated Prices (Client Quote)
```yaml
# Ingestion CAPEX (Client Prices)
P_scanning: 215267      # £ (51.7% of total CAPEX)
P_OCR: 2602             # £
P_LLM: 17103            # £
P_manual_eng: 7578      # £
ingestionTotalPrice: 242549 # £

# Build CAPEX (Client Prices)
buildLaborPrice: 162642 # £ (SA + ML + BE + FE + DevOps + QA + PM)
buildPassthroughPrice: 11364 # £ (Pentest)
buildTotalPrice: 174005 # £

# Build CAPEX includes (functional breakdown):
# ✅ Platform development (SA + ML + BE + FE + DevOps + QA + PM)
# ✅ Standard questions configuration (BE + FE)
# ✅ Siterra integration (BE)
# ✅ Deployment preparation (DevOps)
# ✅ Security testing (Pentest - passthrough)
#
# Labor Breakdown:
# - Solution Architect: 20 days × £488/day = £9,760
# - ML Engineer: 40 days × £418/day = £16,720
# - Backend Developer: 50 days × £380/day = £19,000 (includes standard questions, Siterra integration)
# - Frontend Developer: 40 days × £360/day = £14,400 (includes standard questions UI)
# - DevOps: 20 days × £394/day = £7,880 (includes deployment, infrastructure)
# - QA: 20 days × £304/day = £6,080
# - PM: 30 days × £412/day = £12,360
# Total Labor Cost: £86,200 → Client Price: £162,642 (47% labor margin)

# Total CAPEX (Client Quote)
capexOneTimePrice: 416555 # £ ONE-TIME INVESTMENT

# Monthly OPEX (Client Prices)
opexTotalPrice: 4244    # £/month
opexAnnualPrice: 50923  # £/year

# Total First Year Investment
totalQuotePrice: 467477 # £ (CAPEX + OPEX Year 1)
```

### Calculated Margins
```yaml
# CAPEX Margins
capexGrossProfit: 183127 # £ (416,555 - 233,428)
capexGrossMargin: 0.44   # 44% ((Price - Cost) / Price)

# Overall Margins
overallGrossProfit: 183127 # £ (CAPEX profit)
overallGrossMargin: 0.44   # 44% blended
```

### Per-Site Economics
```yaml
# Per-Site Pricing
pricePerSite: 24.50     # £/site (416,555 ÷ 17,000)
costPerSite: 13.73      # £/site (233,428 ÷ 17,000)
profitPerSite: 10.77    # £/site

# Per-Document Pricing
pricePerDoc: 3.27       # £/doc (416,555 ÷ 127,500)
costPerDoc: 1.83        # £/doc (233,428 ÷ 127,500)
profitPerDoc: 1.44      # £/doc

# Per-Page Pricing
pricePerPage: 0.224     # £/page (416,555 ÷ 1,861,500)
costPerPage: 0.125      # £/page (233,428 ÷ 1,861,500)
profitPerPage: 0.099    # £/page
```

### Competitive Benchmarking
```yaml
# Manual Processing Benchmark
benchManualPerDoc: 12.00 # £/doc
manualTotal: 1530000    # £ (127,500 × 12)
savingsVsManual: 1113445 # £ (73% savings)

# Competitor Benchmark
benchCompetitorPerDoc: 5.00 # £/doc
competitorTotal: 637500  # £ (127,500 × 5)
savingsVsCompetitor: 220945 # £ (35% savings)
```

### Key Insights
- **Conservative pricing**: 44% blended margin (47% labor, 12% passthrough)
- **Scanning dominates**: £215,267 (51.7% of total CAPEX)
- **Competitive advantage**: 73% cheaper than manual, 35% cheaper than competitors
- **Per-document value**: £3.27/doc vs £12/doc manual processing
- **First year total**: £467,477 (CAPEX + Year 1 OPEX)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-16
**Purpose**: Technical specification for Q&A agent training
**Related**: CORNERSTONE_PRICING_MODEL_SPECIFICATION.md

---

*This document is part of the Cornerstone Pricing Model documentation suite.*