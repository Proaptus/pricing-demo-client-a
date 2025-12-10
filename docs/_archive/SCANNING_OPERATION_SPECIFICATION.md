# Cornerstone Scanning Operation Specification
## Detailed Assumptions and Cost Model for Review

---

## Executive Summary

This document defines the scanning operation parameters needed to accurately price the document digitization service for 17,000 sites (approximately 1,275,000 pages). Current pricing model assumptions are insufficient for operational planning.

**Key Finding**: We need to add 15+ new operational parameters to the pricing model to properly estimate scanning costs.

---

## 1. Current Model Assumptions (What We Have)

### Volume Assumptions ✓
```yaml
Total Sites: 17,000
Documents per Site: 5-10 (average 7.5)
Total Documents: 127,500

Document Type Mix:
- Leases: 50% (63,750 documents)
- Deeds: 10% (12,750 documents)
- Licences: 10% (12,750 documents)
- Plans: 30% (38,250 documents)

Pages per Document Type:
- Lease: 25 pages
- Deed: 3 pages
- Licence: 3 pages
- Plan: 5 pages

Total Pages: 1,275,000
```

### Cost Assumption (Oversimplified) ❌
```yaml
Scanning Cost: £175,000 (single line item)
Rate per Page: £0.137 (implied)
```

**Problem**: This is a black box - no operational detail for planning or validation.

---

## 2. Missing Assumptions (What We Need to Add)

### A. Equipment Specifications
```yaml
Scanner Performance:
  high_speed_scanner_ppm: 75-100  # Pages per minute for ADF scanner
  flatbed_scanner_ppm: 2          # Pages per minute for large format
  scanner_daily_capacity: 27,000  # At 75ppm × 6 productive hours
  scanner_efficiency: 70%         # Actual vs theoretical throughput

Equipment Requirements:
  primary_scanners_needed: 2      # High-speed ADF scanners
  backup_scanners_needed: 1       # Redundancy
  flatbed_scanners_needed: 1      # For oversized plans (30% of docs)

Equipment Costs:
  scanner_purchase_price: £20,000  # Per high-speed scanner
  scanner_lease_monthly: £1,000    # Alternative to purchase
  flatbed_purchase_price: £5,000   # Large format scanner
  maintenance_monthly: £200         # Per scanner

Lease vs Buy Decision:
  project_duration_months: 3        # Determines lease vs buy
  breakeven_months: 20              # When buying becomes cheaper
  recommendation: LEASE              # For 3-month project
```

### B. Labor Requirements
```yaml
Document Preparation:
  prep_time_lease: 120 seconds      # Bound documents, remove staples
  prep_time_deed: 30 seconds        # Usually loose sheets
  prep_time_licence: 30 seconds     # Usually loose sheets
  prep_time_plan: 180 seconds       # Oversized, needs special handling

  total_prep_hours: 1,062           # For all documents

Scanning Operations:
  operators_needed: 2                # Full-time operators
  shifts_per_day: 1                  # Single shift operation
  productive_hours_per_shift: 6      # Excluding breaks/setup

Quality Assurance:
  qa_review_percentage: 10%          # Pages to review
  qa_review_speed: 20 pages/min      # Review rate
  qa_hours_needed: 106               # Total QA time

Labor Rates:
  scanner_operator_hourly: £15       # Skilled operator
  qa_specialist_hourly: £18          # Quality control
  supervisor_hourly: £25              # Project oversight

Total Labor Hours: 1,528
Total Labor Cost: £27,500
```

### C. Facility & Infrastructure
```yaml
Space Requirements:
  minimum_square_feet: 300
  document_staging_area: 100 sq ft
  scanning_stations: 150 sq ft
  secure_storage: 50 sq ft

Infrastructure:
  internet_speed_mbps: 100          # For cloud uploads
  backup_power_ups: YES              # Prevent work loss
  climate_control: YES               # Document preservation
  security_system: YES               # Document protection

Monthly Costs:
  facility_rent: £2,000
  utilities: £300
  insurance: £500                   # Documents in custody
  security: £200

Total Facility Cost (3 months): £9,000
```

### D. Process Efficiency Factors
```yaml
Batch Processing:
  average_batch_size: 50 documents   # Per site batch
  batch_setup_time: 5 minutes
  batch_logging_time: 5 minutes
  batch_transition_time: 10 minutes

Document Condition Factors:
  perfect_condition_pct: 60%         # Scan without issues
  minor_issues_pct: 30%             # Slightly torn/faded
  major_issues_pct: 10%             # Require special handling

  time_multiplier_minor: 1.2         # 20% more time
  time_multiplier_major: 2.0         # Double the time

Rework Estimates:
  rescan_rate: 3%                    # Pages needing rescan
  document_rejection_rate: 1%        # Cannot be scanned

Daily Productivity:
  theoretical_pages_per_day: 36,000  # At max speed
  actual_pages_per_day: 21,250       # With all factors
  efficiency_ratio: 59%               # Actual/theoretical
```

### E. Consumables & Software
```yaml
Consumables:
  cleaning_supplies_monthly: £100
  scanning_pads: £200                # Replace monthly
  storage_media: £300                # Backup drives
  packaging_materials: £150          # Document protection

Software Licenses:
  scanning_software: £500/month      # Professional OCR
  document_management: £300/month    # Indexing system
  cloud_storage: £200/month          # Secure backup

Total Consumables (3 months): £3,250
Total Software (3 months): £3,000
```

### F. Timeline & Capacity Planning
```yaml
Project Timeline:
  setup_and_training_days: 5
  production_days: 60                # Working days
  buffer_days: 10                    # Contingency
  total_project_days: 75              # ~3 months

Daily Targets:
  documents_per_day: 2,125           # To meet deadline
  pages_per_day: 21,250
  sites_completed_per_day: 283

Capacity Utilization:
  scanner_1_utilization: 80%
  scanner_2_utilization: 60%
  flatbed_utilization: 30%           # For plans only
  operator_utilization: 85%          # Including prep/QA
```

---

## 3. Complete Cost Breakdown

### Fixed Costs (One-Time)
```yaml
Setup Costs:
  Equipment Setup: £2,000
  Software Configuration: £1,500
  Staff Training (3 days): £1,800
  Process Documentation: £1,000
  Initial Consumables: £500

Total Fixed Costs: £6,800
```

### Variable Costs (Monthly)
```yaml
Monthly Operating Costs:
  Equipment Lease: £3,000            # 2 ADF + 1 flatbed
  Labor: £9,167                      # 2 operators + QA
  Facility: £3,000                   # Rent + utilities
  Software: £1,000                   # All licenses
  Consumables: £750
  Insurance: £500
  Supervision: £2,000                # 0.5 FTE supervisor

Total Monthly: £19,417
Three-Month Total: £58,250
```

### Per-Unit Costs
```yaml
Cost per Page:
  Direct Scanning: £0.046
  Preparation: £0.021
  Quality Assurance: £0.008
  Infrastructure: £0.014
  Management: £0.011

  Total Cost per Page: £0.10

Cost per Document:
  Average (10 pages): £1.00
  Lease (25 pages): £2.50
  Deed (3 pages): £0.30
  Licence (3 pages): £0.30
  Plan (5 pages + flatbed): £1.50

Cost per Site:
  Average (7.5 docs): £7.50
```

---

## 4. Risk Factors & Contingencies

### Operational Risks
```yaml
Volume Variations:
  if_10%_more_documents: +£6,500 cost
  if_20%_more_pages_per_doc: +£11,700 cost

Quality Issues:
  if_20%_poor_condition: +£8,500 cost (more prep time)
  if_5%_rescan_rate: +£3,200 cost

Timeline Risks:
  if_2_week_delay: +£9,700 cost (extended lease/labor)
  if_rush_delivery: +£15,000 cost (overtime/extra staff)

Contingency Reserve: 20% (£35,000)
```

---

## 5. Pricing Model Updates Required

### New Input Parameters to Add
```javascript
// Equipment Parameters
scannerSpeed: 75,              // Pages per minute
scannersNeeded: 2,              // Number of high-speed scanners
flatbedScannersNeeded: 1,       // For oversized documents
scannerLeaseCost: 1000,         // Monthly lease per scanner
scannerEfficiency: 0.70,        // Actual vs theoretical throughput

// Labor Parameters
prepTimeLeaseMin: 2,            // Minutes to prep lease docs
prepTimeDeedMin: 0.5,           // Minutes to prep deeds
prepTimeLicenceMin: 0.5,        // Minutes to prep licences
prepTimePlanMin: 3,             // Minutes to prep plans
scannerOperatorRate: 15,        // Hourly rate
qaSpecialistRate: 18,           // Hourly rate
operatorsNeeded: 2,             // FTE count

// Process Parameters
dailyProductiveHours: 6,        // Actual scanning hours
batchSetupMin: 5,               // Minutes per batch
qaReviewPercentage: 10,         // % of pages to QA
reworkRate: 3,                  // % needing rescan

// Facility Parameters
facilityMonthlyCost: 3000,      // Rent + utilities
insuranceMonthlyCost: 500,      // Document custody insurance

// Timeline Parameters
projectDurationMonths: 3,        // Total project timeline
setupDays: 5,                    // Initial setup time
bufferPercentage: 15,           // Schedule contingency
```

### Calculation Updates
```javascript
function calculateScanningCost(inputs) {
  // Document preparation time
  const prepHours =
    (inputs.nLeases * inputs.prepTimeLeaseMin / 60) +
    (inputs.nDeeds * inputs.prepTimeDeedMin / 60) +
    (inputs.nLicences * inputs.prepTimeLicenceMin / 60) +
    (inputs.nPlans * inputs.prepTimePlanMin / 60);

  // Scanning capacity planning
  const dailyCapacity =
    inputs.scannerSpeed * 60 *
    inputs.dailyProductiveHours *
    inputs.scannerEfficiency *
    inputs.scannersNeeded;

  const daysNeeded = inputs.totalPages / dailyCapacity;
  const monthsNeeded = Math.ceil(daysNeeded / 20); // Working days

  // Equipment costs
  const equipmentCost =
    (inputs.scannersNeeded + inputs.flatbedScannersNeeded) *
    inputs.scannerLeaseCost *
    monthsNeeded;

  // Labor costs
  const scanningHours = daysNeeded * inputs.dailyProductiveHours;
  const qaHours = inputs.totalPages * (inputs.qaReviewPercentage/100) / 1200;
  const totalLaborHours = prepHours + scanningHours + qaHours;
  const laborCost = totalLaborHours * inputs.scannerOperatorRate;

  // Facility costs
  const facilityCost = inputs.facilityMonthlyCost * monthsNeeded;

  // Add contingency
  const subtotal = equipmentCost + laborCost + facilityCost;
  const contingency = subtotal * 0.20;

  return {
    equipmentCost,
    laborCost,
    facilityCost,
    contingency,
    totalCost: subtotal + contingency,
    costPerPage: (subtotal + contingency) / inputs.totalPages,
    monthsNeeded,
    daysNeeded
  };
}
```

---

## 6. Recommended Pricing Structure

### Option A: Fixed Price
```yaml
Base Scanning Service: £153,000
  - Includes all equipment, labor, facility
  - Fixed price for 17,000 sites
  - 10% buffer included

Quality Assurance Premium: £19,125
  - Enhanced QA (15% vs 10%)
  - Guaranteed accuracy levels

Setup & Management: £8,500
  - Project setup
  - Training
  - Management oversight

Total Fixed Price: £180,625
```

### Option B: Unit Pricing
```yaml
Per Page Pricing:
  Standard Pages (ADF): £0.12
  Oversized (Flatbed): £0.50

Per Document Pricing:
  Lease: £3.00
  Deed: £0.36
  Licence: £0.36
  Plan: £2.50

Per Site Pricing:
  Complete Site Package: £10.62
  (all documents for one site)
```

### Option C: Managed Service
```yaml
Monthly Service Fee: £60,000
  - Complete scanning operation
  - All equipment and labor included
  - Quality guarantees
  - 3-month minimum commitment
```

---

## 7. Comparison with Market Rates

| Provider Type | Rate per Page | 17,000 Sites Cost | Notes |
|--------------|---------------|-------------------|-------|
| **Our Proposal** | £0.12 | £153,000 | Full service with QA |
| Bureau Service | £0.15-0.25 | £191,250-318,750 | No AI optimization |
| DIY In-house | £0.08-0.10 | £102,000-127,500 | No expertise/equipment |
| Offshore | £0.05-0.08 | £63,750-102,000 | Quality/security risks |

**Value Proposition**: We're 20% below bureau services while providing AI-optimized output.

---

## 8. Critical Success Factors

### Must-Have Capabilities
1. **Dual Scanner Types**: Both ADF and flatbed for document variety
2. **Skilled Operators**: Trained in document handling and quality
3. **Secure Facility**: Climate-controlled with proper security
4. **Robust QA Process**: Multi-stage quality checks
5. **Backup Systems**: Equipment redundancy and data backup

### Performance Metrics
```yaml
Quality Targets:
  First-Pass Success Rate: >97%
  OCR Accuracy: >98%
  Document Rejection Rate: <1%
  On-Time Delivery: 100%

Efficiency Targets:
  Daily Throughput: 21,250 pages minimum
  Operator Utilization: >85%
  Scanner Utilization: >70%
  Rework Rate: <3%
```

---

## 9. Implementation Timeline

### Phase 1: Setup (Week 1)
- Day 1-2: Equipment delivery and setup
- Day 3: Software installation and configuration
- Day 4-5: Staff training and process testing

### Phase 2: Pilot (Week 2)
- Process 500 sites (3% of total)
- Validate quality and throughput
- Refine processes

### Phase 3: Production (Weeks 3-14)
- 1,500 sites per week average
- Daily quality reports
- Weekly progress reviews

### Phase 4: Completion (Week 15)
- Final QA checks
- Document delivery
- Project closeout

---

## 10. Recommendations for Pricing Model

### Immediate Updates Needed

1. **Replace Single Cost Line**
   - Current: "Scanning Cost: £175,000"
   - New: Detailed breakdown with 20+ parameters

2. **Add Operational Inputs**
   - Scanner specifications
   - Labor requirements
   - Timeline parameters
   - Quality metrics

3. **Create Scenario Options**
   - Economy: Basic scanning, 5% QA
   - Standard: Full service, 10% QA
   - Premium: Enhanced QA, 15% review

4. **Include Risk Adjustments**
   - Document condition factor
   - Volume uncertainty adjustment
   - Timeline flexibility pricing

### Calculator UI Updates
```javascript
// New Section: Scanning Operations
<ScanningConfiguration>
  <Equipment>
    - Scanner Type [Dropdown: ADF/Flatbed/Both]
    - Scanner Speed [Input: pages/min]
    - Number of Scanners [Input: count]
    - Lease vs Buy [Toggle]
  </Equipment>

  <Labor>
    - Operators Needed [Input: FTE]
    - Hourly Rate [Input: £/hour]
    - Productive Hours/Day [Input: hours]
  </Labor>

  <Timeline>
    - Target Completion [Input: months]
    - Daily Throughput [Calculated]
    - Required Capacity [Calculated]
  </Timeline>

  <Quality>
    - QA Percentage [Slider: 5-20%]
    - Rescan Allowance [Input: %]
    - Accuracy Target [Input: %]
  </Quality>
</ScanningConfiguration>
```

---

## 11. Summary & Next Steps

### Key Findings
1. **Current model is oversimplified** - needs 20+ new parameters
2. **True operational cost is £65,050** before markup
3. **Proposed price of £175,000** gives healthy 62% gross margin
4. **Timeline of 3 months** is aggressive but achievable

### Critical Decisions Needed
1. **Lease vs Buy**: Recommend LEASE for 3-month project
2. **QA Level**: Recommend 10% standard, 15% available as premium
3. **Facility**: Outsource vs establish our own
4. **Staffing**: Direct hire vs contract labor

### For Review & Approval
- [ ] Equipment specifications and costs
- [ ] Labor model and rates
- [ ] Timeline and capacity planning
- [ ] Quality targets and metrics
- [ ] Pricing structure options
- [ ] Risk contingencies

---

**Document Status**: READY FOR REVIEW
**Prepared By**: Pricing Analysis Team
**Date**: November 14, 2025
**Next Review**: Upon stakeholder feedback

---

*This specification provides the detailed operational model needed to accurately price and deliver the scanning service for Cornerstone's 17,000 sites.*