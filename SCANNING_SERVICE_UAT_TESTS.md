# Scanning Service UAT Tests
## Additional Smoke Tests for Document Scanning Service Feature

This document defines 6 additional UAT smoke tests (SMOKE-013 through SMOKE-018) for the Document Scanning Service feature added to the Cornerstone Pricing Calculator.

---

## Test Definitions

### SMOKE-013: Scanning Service Toggle Visible and Functional

**Purpose**: Verify the Document Scanning Service toggle is visible and clickable

**Test Steps**:
1. Navigate to Pricing Calculator homepage
2. Scroll to Document Scanning Service section
3. Verify toggle switch is visible with label "Disabled"
4. Capture screenshot

**Expected Results**:
- Document Scanning Service section header visible
- Toggle switch in "off" position with "Disabled" label
- Description text: "Enable controlled scanning to achieve 92% excellent quality and reduce conflicts by 95%"

**Pass Criteria**:
- ✅ PASS: Toggle visible, labeled correctly, in disabled state
- ❌ FAIL: Toggle missing, label incorrect, or not functional

---

### SMOKE-014: Scanning Configuration Section Displays When Enabled

**Purpose**: Verify clicking toggle enables scanning and displays configuration section

**Test Steps**:
1. Start with scanning service disabled
2. Click the toggle switch to enable scanning
3. Wait 2 seconds for configuration section to appear
4. Capture screenshot showing configuration section

**Expected Results**:
- Toggle switches to "Enabled" state with blue background
- Configuration section appears with three subsections:
  - Equipment Configuration (Scanner Speed, Number of Scanners, Scanner Lease)
  - Operation Configuration (Working Hours/Day, Operator Rate, QA Review %)
  - Document Prep Time (Lease, Deed, Licence, Plan prep times in minutes)
- Calculated results panel shows:
  - Project Duration (months)
  - Daily Capacity (pages/day)
  - Cost per Page (£)
  - Labor Hours (total hours)

**Pass Criteria**:
- ✅ PASS: Configuration section visible with all three subsections and calculated results
- ❌ FAIL: Configuration section missing, incomplete, or not rendering

---

### SMOKE-015: Quality Preset Auto-Switches to Excellent

**Purpose**: Verify enabling scanning automatically applies Excellent Quality preset

**Test Steps**:
1. Before enabling scanning, note current quality preset (e.g., "Medium Quality")
2. Click scanning toggle to enable
3. Wait 2 seconds
4. Scroll to Scenario Presets section
5. Capture screenshot showing quality preset has changed to "Excellent (Controlled Scan)"

**Expected Results**:
- Scenario Presets section shows "Excellent (Controlled Scan)" selected
- Quality distribution shows:
  - Good Quality: 92%
  - Medium Quality: 7%
  - Poor Quality: 1%
- Review rates show:
  - Good Quality Review Rate: 0.5%
  - Medium Quality Review Rate: 3%
  - Poor Quality Review Rate: 10%

**Pass Criteria**:
- ✅ PASS: Excellent quality preset automatically selected with 92% good quality
- ❌ FAIL: Quality preset doesn't change or wrong values displayed

---

### SMOKE-016: All Scanning Parameters Are Adjustable

**Purpose**: Verify all 7 scanning service input parameters are functional and update calculations

**Test Steps**:
1. Enable scanning service
2. Modify each parameter:
   - Scanner Speed: Change from 75 to 100 pages/min
   - Number of Scanners: Change from 2 to 3
   - Working Hours/Day: Change from 6 to 8 hours
   - Operator Rate: Change from £15 to £20/hour
   - Scanner Lease: Change from £1,000 to £1,500/month
   - QA Review %: Change from 10% to 15%
   - Prep times: Change Lease prep from 2.0 to 3.0 minutes
3. Verify calculated results update in real-time
4. Capture screenshot showing updated calculated results

**Expected Results**:
- All input fields accept new values
- Calculated results panel updates immediately showing:
  - New Project Duration (should decrease with faster scanner/more scanners)
  - New Daily Capacity (should increase)
  - New Cost per Page (should change based on rates)
  - New Labor Hours (should change)

**Pass Criteria**:
- ✅ PASS: All parameters adjustable, calculations update in real-time
- ❌ FAIL: Parameters not adjustable or calculations don't update

---

### SMOKE-017: Calculated Timeline and Costs Display Correctly

**Purpose**: Verify scanning service calculations are accurate and display correct values

**Test Steps**:
1. Enable scanning with default parameters:
   - Scanner Speed: 75 ppm
   - Number of Scanners: 2
   - Working Hours/Day: 6 hours
   - Operator Rate: £15/hour
   - Scanner Lease: £1,000/month
   - QA Review %: 10%
2. Verify calculated results show realistic values
3. Capture screenshot of calculated results panel

**Expected Results** (for default ~1,968,000 pages):
- Project Duration: ~3 months (50-60 working days)
- Daily Capacity: ~35,000-40,000 pages/day
- Cost per Page: ~£0.04-£0.06
- Total Scanning Cost: ~£95,000-£110,000
- Labor Hours: ~4,500-5,500 hours

**Pass Criteria**:
- ✅ PASS: Calculations within expected ranges, no NaN or undefined values
- ❌ FAIL: Calculations incorrect, NaN, or missing

---

### SMOKE-018: Scanning Cost Appears in Tables, OCR Becomes £0

**Purpose**: Verify scanning service integrates correctly with cost breakdown tables

**Test Steps**:
1. Start with scanning disabled
2. Note Ingestion CAPEX table shows OCR cost (e.g., £1,939)
3. Enable scanning service
4. Wait 2 seconds
5. Scroll to Ingestion CAPEX table
6. Capture screenshot showing:
   - "Document Scanning Service (includes OCR)" line item
   - OCR line item removed or shows £0
   - Manual Review cost significantly reduced (should drop ~90%)

**Expected Results**:
- Ingestion CAPEX table shows new line item: "Document Scanning Service (includes OCR)"
- Scanning line item shows:
  - Cost: ~£95,000-£110,000
  - Margin: 13% (passthrough margin)
  - Price: ~£107,000-£124,000
  - Notes: Equipment, labor, overhead breakdown
- OCR line item either removed or shows £0 cost
- Manual Review line item shows dramatically reduced cost (was ~£32,000, now ~£1,200-£2,000)
- LLM Extraction cost may increase slightly (due to more pages from better quality)

**Pass Criteria**:
- ✅ PASS: Scanning line item present, OCR removed/£0, Manual Review reduced significantly
- ❌ FAIL: Scanning cost missing, OCR still showing cost, or calculations incorrect

---

## Test Execution Order

These tests should be executed after completing SMOKE-012:

1. SMOKE-013: Verify toggle visible (baseline state)
2. SMOKE-014: Enable scanning, verify configuration section
3. SMOKE-015: Verify quality preset auto-switches
4. SMOKE-016: Test all parameter adjustments
5. SMOKE-017: Verify calculated timeline and costs
6. SMOKE-018: Verify cost table integration

**Total Additional Tests**: 6
**Expected Execution Time**: ~10-15 minutes
**Screenshots Required**: 6

---

## Integration with Existing UAT Framework

Add these tests to the UAT Automation Skill by:

1. Updating `SKILL.md` to include SMOKE-013 through SMOKE-018
2. Adding Phase 7: Scanning Service Feature (6 tests)
3. Updating total test count from 20 to 26 tests
4. Running complete UAT suite with all 26 tests

**Updated Test Count**:
- Original: 12 smoke tests + 8 spot tests = 20 tests
- With Scanning: 18 smoke tests + 8 spot tests = 26 tests
- New Pass Rate Threshold: 21+ of 26 tests (80%)

---

## Success Criteria

Scanning Service feature is **production-ready** when:

✅ All 6 scanning tests pass (SMOKE-013 through SMOKE-018)
✅ Toggle enables/disables scanning without errors
✅ Quality preset switches automatically to Excellent (92% good)
✅ All 7 parameters are adjustable with real-time calculation updates
✅ Calculated timeline shows 3 months for typical project
✅ Scanning cost replaces OCR in Ingestion CAPEX table
✅ Manual review cost drops ~90% when scanning enabled
✅ No console errors when toggling scanning on/off
✅ Cost calculations match expected ranges

---

**Last Updated**: 2025-11-14
**Feature**: Document Scanning Service
**Component**: CornerstonePricingCalculator.jsx
**Related Files**: ScanningConfiguration.jsx, calculateScanningCost.js
