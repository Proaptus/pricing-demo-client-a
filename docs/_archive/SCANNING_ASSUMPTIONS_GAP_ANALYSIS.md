# Scanning Assumptions Gap Analysis
## What We Have vs What We Need in the Pricing Model

---

## Executive Summary

The current pricing model has **only 1 scanning assumption** (total cost: £175,000). We need to add **25+ operational parameters** to properly estimate scanning costs and validate our pricing.

**Bottom Line**: Without these parameters, we cannot justify our £175,000 scanning price or optimize operations.

---

## Current State: What the Pricing Model Has ❌

```yaml
Scanning Assumptions in Current Model:
  - Scanning Cost: £175,000 (single line item)

Volume Assumptions (these exist):
  - Total Sites: 17,000
  - Document mix percentages
  - Pages per document type
  - Total Pages: 1,275,000

That's it. No operational detail.
```

---

## Gap Analysis: What's Missing 🚨

### 1. Equipment Parameters (MISSING)
```yaml
NEED TO ADD:
  scanner_speed_ppm: 75           # Pages per minute capability
  scanners_needed: 2               # Number of high-speed scanners
  flatbed_scanners: 1              # For 30% of docs (plans)
  scanner_efficiency: 70%          # Real-world vs theoretical
  lease_cost_monthly: £1,000       # Per scanner
  equipment_setup_cost: £2,000     # One-time
```

### 2. Labor Model (MISSING)
```yaml
NEED TO ADD:
  prep_time_by_doc_type:
    lease: 2 minutes              # Removing staples, organizing
    deed: 0.5 minutes             # Usually loose sheets
    licence: 0.5 minutes          # Usually loose sheets
    plan: 3 minutes               # Oversized, special handling

  operators_needed: 2              # Full-time scanners
  operator_hourly_rate: £15        # Market rate
  qa_specialist_rate: £18          # Quality control
  productive_hours_per_day: 6      # Actual scanning time
```

### 3. Process Efficiency (MISSING)
```yaml
NEED TO ADD:
  batch_processing_overhead: 20%   # Setup/transition time
  document_condition_factor:
    perfect: 60%                   # Scan normally
    minor_issues: 30%              # +20% time
    major_issues: 10%              # +100% time

  rescan_rate: 3%                  # Pages needing redo
  qa_review_percentage: 10%        # Sampling rate
  daily_throughput_target: 21,250  # Pages per day
```

### 4. Facility Requirements (MISSING)
```yaml
NEED TO ADD:
  facility_space_sqft: 300         # Minimum needed
  facility_monthly_cost: £2,000    # Rent
  insurance_monthly: £500          # Document custody
  utilities_monthly: £300          # Power, internet
  security_requirements: YES       # Locked, monitored
```

### 5. Timeline Planning (MISSING)
```yaml
NEED TO ADD:
  setup_days: 5                    # Initial configuration
  production_days: 60              # Actual scanning
  buffer_days: 10                  # Contingency
  project_duration_months: 3       # Total timeline
```

---

## Financial Impact of Missing Assumptions

### Current "Black Box" Costing
```
Scanning: £175,000 ÷ 1,275,000 pages = £0.137 per page
No justification or breakdown
```

### Proper Bottom-Up Costing (With All Assumptions)
```
Equipment (3 months):      £9,000   (3 scanners @ £1,000/month)
Labor (1,528 hours):       £27,500  (2 FTE + QA)
Facility (3 months):       £9,000   (Space + insurance)
Software & Consumables:    £6,250   (Licenses + supplies)
Setup & Training:          £6,800   (One-time)
Management (15%):          £8,800   (Project oversight)
Subtotal:                  £67,350
Contingency (20%):         £13,470
Total Cost:                £80,820

Markup (116%):             £94,180  (For £175,000 price)
Gross Margin:              53.8%
```

**Finding**: We're actually charging reasonable markup, but can't prove it without the detailed model!

---

## Recommended Model Updates

### Priority 1: Must-Have Inputs (Immediate)
```javascript
// Add these to the calculator TODAY
includeScanningService: boolean    // Toggle on/off
scannerSpeed: 75                   // Pages per minute
operatorsNeeded: 2                 // FTE count
projectDurationMonths: 3           // Timeline
qaReviewPercentage: 10              // Quality sampling
```

### Priority 2: Detailed Operations (This Week)
```javascript
// Document-specific parameters
prepTimeByDocType: {
  lease: 2.0,
  deed: 0.5,
  licence: 0.5,
  plan: 3.0
}

// Equipment decisions
scanningEquipment: {
  highSpeedADF: 2,
  flatbedLarge: 1,
  leaseVsBuy: 'lease',
  monthlyLeaseCost: 1000
}

// Efficiency factors
processEfficiency: {
  scannerUtilization: 0.70,
  operatorUtilization: 0.85,
  batchOverhead: 0.20,
  rescanRate: 0.03
}
```

### Priority 3: Advanced Modeling (Next Sprint)
```javascript
// Risk adjustments
documentCondition: {
  distribution: [0.60, 0.30, 0.10],
  timeMultipliers: [1.0, 1.2, 2.0]
}

// Capacity planning
capacityModel: {
  dailyTarget: 21250,
  peakCapacity: 30000,
  minimumAcceptable: 15000,
  overtimeThreshold: 25000
}
```

---

## Implementation Checklist

### For Pricing Calculator
- [ ] Add "Scanning Configuration" section
- [ ] Create equipment input fields
- [ ] Add labor calculator
- [ ] Build timeline estimator
- [ ] Show cost breakdown (not just total)
- [ ] Add lease vs buy comparison
- [ ] Create efficiency dashboard

### For Documentation
- [ ] Update pricing model specification
- [ ] Create operational runbook
- [ ] Document assumptions and sources
- [ ] Build sensitivity analysis
- [ ] Create client-facing summary

### For Review Meeting
- [ ] Present gap analysis
- [ ] Show bottom-up cost build
- [ ] Explain margin structure
- [ ] Discuss risk factors
- [ ] Get approval on assumptions

---

## Key Questions for Stakeholders

1. **Equipment Strategy**
   - Lease for £3,000/month or buy for £45,000?
   - How many backup scanners needed?

2. **Quality Standards**
   - Is 10% QA sampling sufficient?
   - What's acceptable rescan rate?

3. **Timeline Flexibility**
   - Can we extend to 4 months if needed?
   - Premium for 2-month rush delivery?

4. **Facility Decision**
   - Use existing space or rent dedicated?
   - Client site vs our location?

5. **Risk Tolerance**
   - How much contingency to include?
   - Fixed price vs time-and-materials?

---

## Conclusion

**Current State**: Pricing model says "Scanning = £175,000" with no justification

**Required State**: 25+ parameters that prove our scanning cost is £80,820, justifying £175,000 price with healthy margins

**Next Step**: Add these parameters to the pricing model immediately so we can:
1. Validate our pricing
2. Optimize operations
3. Answer client questions
4. Manage project profitably

---

**Prepared For**: Review Meeting
**Action Required**: Approve new model parameters
**Timeline**: Need updates before sending to client

---

*This gap analysis shows we need significant model enhancements to properly price and deliver scanning services.*