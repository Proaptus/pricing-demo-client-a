# TDD Handover Specification: Q&A Documentation Sync

**Task ID**: `qa-documentation-sync-161125`
**Type**: Feature Implementation
**Priority**: HIGH (Q&A currently gives wrong answers due to stale data)

## Problem

The Q&A system loads static markdown documentation with hardcoded values, causing the LLM to provide incorrect answers about current pricing calculations. Users ask "What is the current total cost?" and receive outdated information because the documentation doesn't reflect runtime computed values from `computeModel()`.

**Current State (BROKEN)**:
- `documentationLoader.js` loads static markdown files
- `PRICING_MODEL_REFERENCE.md` contains hardcoded example values
- LLM receives NO current computed values from `computeModel()`
- Q&A gives wrong answers based on stale data

**Desired State**:
- Runtime values automatically synced to documentation
- `PRICING_MODEL_REFERENCE.md` updated with current calculations
- LLM receives up-to-date baseline inputs + computed outputs
- Q&A answers accurately reflect current application state

## Approach

Build a documentation sync system with 3 core services:

1. **Baseline Exporter** (`services/baselineExporter.js`): Export baseline constants + runtime state to JSON
2. **Runtime State Exporter** (`services/runtimeStateExporter.js`): Format current values as markdown section
3. **Documentation Sync** (`services/documentationSync.js`): Coordinate sync operations, triggered on state changes

The sync runs on app initialization and debounced state changes, writing to:
- `docs/baseline/current.json` (machine-readable baseline)
- `docs/PRICING_MODEL_REFERENCE.md` Section B (human-readable runtime values)

## TDD Strategy

Follow **RED-GREEN-REFACTOR** for each component:

### Phase 1: Baseline Exporter (4 tests)
- ❌ Write failing tests for JSON structure, metadata, data completeness
- ✅ Implement `exportBaseline(inputs, model, scenario)`
- 🔄 Refactor for clean JSON generation

### Phase 2: Runtime State Exporter (3 tests)
- ❌ Write failing tests for markdown formatting, value inclusion
- ✅ Implement `exportRuntimeState(inputs, model)`
- 🔄 Refactor for readable markdown

### Phase 3: Documentation Sync (4 tests)
- ❌ Write failing tests for coordination, file writes, error handling
- ✅ Implement `syncDocumentation(inputs, model, scenario)`
- 🔄 Refactor for robustness

### Phase 4: Documentation Loader Integration (2 tests)
- ❌ Update tests for baseline loading
- ✅ Verify `loadBaseline()` and `buildDocumentationContext()` work with new format
- 🔄 Ensure backward compatibility

### Phase 5: UI Integration (2 tests)
- ❌ Write tests for useEffect triggers
- ✅ Add sync hooks to `CornerstonePricingCalculator.jsx`
- 🔄 Verify debouncing and silent operation

## Implementation Steps

**Step 1**: Create Baseline Exporter Service
```bash
# Create test file
touch cornerstone/src/services/__tests__/baselineExporter.test.js

# Write failing tests, then implement
# Tests: JSON structure, metadata, data completeness, file write
```

**Step 2**: Create Runtime State Exporter Service
```bash
# Create test file
touch cornerstone/src/services/__tests__/runtimeStateExporter.test.js

# Write failing tests, then implement
# Tests: Markdown formatting, value inclusion, section structure
```

**Step 3**: Create Documentation Sync Coordinator
```bash
# Create test file
touch cornerstone/src/services/__tests__/documentationSync.test.js

# Write failing tests, then implement
# Tests: Coordination logic, file writes, error handling, debouncing
```

**Step 4**: Update Documentation Loader
```bash
# Update existing tests
# Verify baseline loading works with new JSON format
# Verify buildDocumentationContext() includes baseline section
```

**Step 5**: UI Integration
```bash
# Add useEffect to CornerstonePricingCalculator.jsx
# Trigger sync on mount (app initialization)
# Trigger sync on inputs/scenario change (debounced 500ms)
```

**Step 6**: UAT Testing
```bash
# Start app: ./start-cornerstone.sh
# Verify docs/baseline/current.json created
# Test Q&A with current values
# Change inputs, verify docs update
```

## Acceptance Criteria (Gherkin)

**AC1**: Baseline Export
```gherkin
Feature: Export baseline constants and runtime state
  Scenario: Export baseline on app initialization
    Given defaultInputs, SCENARIO_CONFIGS, and ASSUMPTION_PRESETS exist
    When exportBaseline() is called with current state
    Then docs/baseline/current.json is created with:
      - metadata (timestamp, version, source)
      - defaultInputs (baseline constants)
      - scenarioConfigs (all pricing scenarios)
      - assumptionPresets (quality presets)
      - runtimeState (current inputs + computeModel output)
```

**AC2**: Runtime State Export
```gherkin
Feature: Export current runtime values as markdown
  Scenario: Format runtime values for documentation
    Given current inputs and computed model
    When exportRuntimeState() is called
    Then markdown Section B is generated with:
      - Current input values (nSites, minDocs, etc.)
      - All computed values from computeModel()
      - Volume calculations, cost breakdowns, pricing, margins
```

**AC3**: Documentation Loader Integration
```gherkin
Feature: Load synced baseline in Q&A context
  Scenario: Q&A includes current runtime values
    Given docs/baseline/current.json exists with synced data
    When buildDocumentationContext() is called
    Then LLM context includes [BASELINE - SSOT] section with current values
```

**AC4**: UI Integration
```gherkin
Feature: Trigger sync on state changes
  Scenario: User changes inputs
    Given CornerstonePricingCalculator is mounted
    When user changes inputs (e.g., nSites from 17000 to 20000)
    Then documentation sync is triggered (debounced)
    And docs/baseline/current.json is updated
```

See `TDD_HANDOVER_SPEC_QA_SYNC.json` for full Gherkin scenarios.

## Key Technical Details

**File I/O Pattern** (from existing `documentationLoader.js`):
- Check for Node.js environment: `typeof process !== 'undefined' && typeof process.cwd === 'function'`
- Use dynamic import: `const { promises: fs } = await import('fs')`
- Path handling: `path.join(process.cwd(), 'docs', 'baseline', 'current.json')`

**React Patterns** (from Context7 - React 18):
- `useEffect` for sync triggers (on mount, on state change)
- `useCallback` for debounced sync function
- `useMemo` for memoizing subscription config if needed
- Follow exhaustive-deps rules

**Debouncing**:
- 500ms delay for state change syncs
- Use custom debounce or lodash.debounce
- Only trigger on actual value changes (not every render)

**JSON Structure**:
```json
{
  "metadata": {
    "exportedAt": "2025-11-16T10:30:00Z",
    "version": "1.0.0",
    "source": "CornerstonePricingCalculator"
  },
  "defaultInputs": { ... },
  "scenarioConfigs": { ... },
  "assumptionPresets": { ... },
  "runtimeState": {
    "inputs": { ... },
    "scenario": "standard",
    "computedModel": { ... }
  }
}
```

## Impact

**User Benefit**: Q&A provides accurate answers based on current pricing state
**Technical Debt**: None (new services, follows existing patterns)
**Performance**: Debounced syncs don't impact UI, file writes are async

## Risks & Mitigations

1. **File I/O in browser** (HIGH): Use Node.js environment check (existing pattern)
2. **Performance impact** (MEDIUM): Debounce 500ms, only trigger on changes
3. **Large files** (LOW): JSON is compact, markdown sections are reasonable size
4. **Sync failures** (LOW): Graceful error handling, log but don't break app

## Rollback Plan

Remove useEffect hooks from `CornerstonePricingCalculator.jsx`. Delete new service files. Revert `documentationLoader.js` if modified. All changes are additive, no existing functionality modified.

## Done Definition

✅ All unit tests pass (baselineExporter, runtimeStateExporter, documentationSync)
✅ All integration tests pass (full sync flow)
✅ `docs/baseline/current.json` contains current runtime state
✅ Q&A LLM receives and uses current values in answers
✅ Sync runs silently without impacting UI performance
✅ Pattern follows existing `documentationLoader` conventions
✅ UAT tests verify end-to-end functionality

## First Command

```bash
cd cornerstone && npm test -- src/services/__tests__/baselineExporter.test.js --watch
```

Start with the baseline exporter test, implement the service, and verify it passes before moving to the next phase.

---

**Full Specification**: See `TDD_HANDOVER_SPEC_QA_SYNC.json` for complete test cases, edge cases, and detailed steps.
