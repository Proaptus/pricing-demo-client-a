# TDD Handover Specification: Baseline SSOT Optimization

**Task ID**: `baseline-ssot-optimization`
**Created**: 2025-11-16
**Branch**: `cornerstone-questions-121125`
**Mode**: TDD EXECUTION

---

## Executive Summary

Optimize Q&A LLM data context by establishing the docs folder as Single Source of Truth (SSOT) for baseline values, with proper data tagging to prevent confusion between authoritative baseline and historical client communications/discussions.

**Problem**: Currently sending two potentially conflicting data sources to LLM (live app data + static docs). When adding more client comms, LLM may confuse discussion options (e.g., "18,000 or 20,000 sites discussed") with actual baseline (17,000 sites).

**Solution**: Auto-save baseline values to `docs/baseline/current.json`, tag data with context markers ([BASELINE], [DISCUSSION], [ARCHIVED]), update documentation loader to include baseline, create simple conflict scanner.

---

## Implementation Steps

### Step 1: Baseline Export Service (TDD RED → GREEN)
**Files**: `src/services/baselineExporter.js`, `src/services/__tests__/baselineExporter.test.js`

1. Write failing tests:
   - Export defaultInputs to JSON
   - Export SCENARIO_CONFIGS to JSON
   - Export ASSUMPTION_PRESETS to JSON
   - Include metadata (timestamp, version)
   - Create docs/baseline/ directory if needed
   - Write valid JSON to docs/baseline/current.json

2. Implement service:
   - Import constants from CornerstonePricingCalculator.jsx
   - Create export function
   - Use fs/promises for file I/O
   - Create directory recursively
   - Write JSON with formatting

**Commands**:
```bash
npm test src/services/__tests__/baselineExporter.test.js
```

**Expected**: FAIL → implement → PASS

---

### Step 2: Documentation Loader Update (TDD RED → GREEN)
**Files**: `src/services/documentationLoader.js`, `src/services/__tests__/documentationLoader.test.js`

1. Write failing tests:
   - Load baseline JSON from docs/baseline/current.json
   - Format baseline with [BASELINE - SSOT] tags
   - Merge baseline with existing documentation
   - Handle missing baseline file gracefully
   - Parse baseline JSON correctly

2. Implement loader updates:
   - Modify `buildDocumentationContext()`
   - Load baseline JSON with try/catch
   - Format with clear section headers
   - Add [BASELINE - SSOT] tags
   - Merge with existing docs string

**Commands**:
```bash
npm test src/services/__tests__/documentationLoader.test.js
```

**Expected**: FAIL → implement → PASS

---

### Step 3: Conflict Scanner (TDD RED → GREEN)
**Files**: `src/services/conflictScanner.js`, `src/services/__tests__/conflictScanner.test.js`

1. Write failing tests:
   - Extract numbers from markdown text
   - Detect if numbers are within tagged sections
   - Flag untagged numbers that differ from baseline
   - Generate conflict report
   - Ignore numbers in code blocks
   - Recognize tag types

2. Implement scanner:
   - Load baseline for comparison
   - Scan docs folder (*.md, skip _archive)
   - Use regex to find numbers
   - Check if within HTML comment tags
   - Generate report: file, line, value, context

**Commands**:
```bash
npm test src/services/__tests__/conflictScanner.test.js
```

**Expected**: FAIL → implement → PASS

---

### Step 4: Manual Documentation Tagging
**Files**: `docs/CLIENT_REQUIREMENTS.md`, `docs/PRICING_MODEL_REFERENCE.md`

Add context tags manually:

```markdown
<!-- BASELINE - SSOT -->
Sites: 17,000 (current baseline)
Documents: 5-10 per site

<!-- CLIENT COMMS - DISCUSSION ONLY -->
Historical discussions explored 18,000 or 20,000 site options

<!-- ARCHIVED -->
Previous baseline was 15,000 sites (deprecated 2024-11)
```

**No automated test** - manual work

---

### Step 5: Integration Test
**File**: `src/components/pricing/__tests__/PricingQA.test.jsx`

Add test:
- "should include baseline data in Q&A system prompt"
- Mock baseline JSON
- Render PricingQA
- Submit question
- Verify system prompt includes [BASELINE - SSOT] tagged data

**Commands**:
```bash
npm test src/components/pricing/__tests__/PricingQA.test.jsx
```

---

### Step 6: Full Verification
**Commands**:
```bash
npm test
```

Verify all acceptance criteria met.

---

## Acceptance Criteria

### AC1: Baseline Data Export
```gherkin
Feature: Baseline Data Export
  As a developer
  I want baseline values automatically exported to docs
  So that docs folder is the authoritative source

Scenario: Export baseline to JSON
  Given the app has defaultInputs, SCENARIO_CONFIGS, ASSUMPTION_PRESETS
  When the baseline export service runs
  Then docs/baseline/current.json is created
  And JSON contains all baseline values
  And JSON includes metadata (timestamp, version)
```

### AC2: Documentation Loader Includes Baseline
```gherkin
Feature: Documentation Loader Includes Baseline
  As a developer
  I want documentation context to include baseline from docs
  So that Q&A always has authoritative baseline values

Scenario: Load baseline successfully
  Given docs/baseline/current.json exists
  When buildDocumentationContext() is called
  Then baseline data is included
  And baseline is tagged with [BASELINE - SSOT]
  And baseline is merged with existing docs

Scenario: Handle missing baseline
  Given docs/baseline/current.json does NOT exist
  When buildDocumentationContext() is called
  Then it returns existing documentation
  And logs a warning
  And does NOT throw error
```

### AC3: Conflict Scanner
```gherkin
Feature: Conflict Scanner Detects Untagged Values
  As a developer
  I want to scan docs for values that conflict with baseline
  So that LLM context is clear

Scenario: Flag untagged conflicts
  Given docs contain "18000 sites" without tags
  And baseline has nSites: 17000
  When conflict scanner runs
  Then it flags "18000" as potential conflict
  And generates report with file, line, value

Scenario: Ignore properly tagged values
  Given docs contain "<!-- CLIENT COMMS -->18000 sites discussed"
  When conflict scanner runs
  Then it does NOT flag "18000"
```

### AC4: Q&A Integration
```gherkin
Feature: Q&A Receives Baseline in System Prompt
  As a user
  I want Q&A to have authoritative baseline values
  So that answers are accurate

Scenario: Baseline in system prompt
  Given baseline is loaded
  When user submits Q&A question
  Then system prompt includes baseline
  And baseline is marked [BASELINE - SSOT]
```

---

## Test Coverage

**Target**: ≥80% line coverage, ≥70% branch coverage

**Files**:
- `src/services/baselineExporter.js`
- `src/services/documentationLoader.js`
- `src/services/conflictScanner.js`

---

## Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| docs/baseline/ doesn't exist | Create directory with `fs.mkdir({ recursive: true })` |
| Baseline JSON corrupted | Try/catch with validation, graceful fallback |
| Scanner slow on large docs | Limit to .md files, skip _archive folder |
| Breaking Q&A | Graceful fallback - Q&A works without baseline |

---

## Rollback Strategy

All changes are **additive** (new services, new files). Existing Q&A functionality unchanged.

**To rollback**:
1. Delete new files (baselineExporter.js, conflictScanner.js)
2. Revert documentationLoader.js changes
3. Remove baseline loading call

---

## Definition of Done

- [ ] All 4 acceptance criteria met
- [ ] All unit tests passing (baselineExporter, documentationLoader, conflictScanner)
- [ ] Integration test passing (Q&A includes baseline)
- [ ] Code coverage ≥80% for new services
- [ ] docs/baseline/current.json created with valid structure
- [ ] Documentation tags added to CLIENT_REQUIREMENTS.md
- [ ] Conflict scanner generates valid report
- [ ] Q&A system prompt includes [BASELINE - SSOT] tagged data
- [ ] Full test suite passes (`npm test`)

---

## First Command to Execute

```bash
cd cornerstone && touch src/services/__tests__/baselineExporter.test.js
```

Then write failing tests for baseline export service.

---

**Ready for TDD implementation** ✓
