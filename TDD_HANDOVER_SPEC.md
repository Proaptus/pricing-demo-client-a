# TDD Handover Specification: Cornerstone Q&A Feature

**Task ID**: `cornerstone-qa-feature-121125`
**Type**: Feature Implementation
**Commit**: `555934ad3d752c889bfdbcad91556d7ac5d9d810`

## Problem

Cornerstone pricing calculator needs an LLM-powered Q&A feature to answer questions about pricing bids. Users receive questions about bids and need quick, accurate responses grounded in the current pricing data and assumptions.

## Approach

Build a test-driven Q&A system with 4 core services + 1 UI component:

1. **OpenRouter API Service** (`services/openrouter.js`): Handle API communication with OpenRouter
2. **Data Formatter** (`services/formatModelForLLM.js`): Convert pricing model to LLM-friendly context
3. **System Prompt** (`services/qaSystemPrompt.js`): Engineer prompts to guide LLM responses
4. **UI Component** (`components/pricing/PricingQA.jsx`): Question input + response display
5. **Integration**: Add Q&A section to main calculator

**Models**:
- **Development**: `x-ai/grok-4-fast` (faster, cheaper for testing)
- **Production**: `anthropic/claude-haiku-4.5` (high quality, cost-effective)
- Switched via `VITE_ENV` environment variable

**Environment**: API key already configured in `cornerstone/.env`

## TDD Strategy

Follow **RED-GREEN-REFACTOR** for each component:

### Phase 1: API Service (6 tests)
- ❌ Write failing tests for fetch, headers, model selection, errors
- ✅ Implement `queryOpenRouter(systemPrompt, userMessage, model)`
- 🔄 Refactor for error handling

### Phase 2: Data Formatter (5 tests)
- ❌ Write failing tests for data inclusion, formatting
- ✅ Implement `formatPricingDataForLLM(inputs, model, scenario)`
- 🔄 Refactor for readability

### Phase 3: System Prompt (3 tests)
- ❌ Write failing tests for role definition, data inclusion
- ✅ Implement `buildSystemPrompt(pricingData)`
- 🔄 Refactor prompt structure

### Phase 4: UI Component (7 tests)
- ❌ Write failing tests for rendering, state, API calls, errors
- ✅ Implement `PricingQA` component
- 🔄 Refactor for Tailwind styling consistency

### Phase 5: Integration (1 test)
- ❌ Write failing integration test
- ✅ Add PricingQA to CornerstonePricingCalculator
- 🔄 Verify data flow

## Implementation Steps

**Step 1**: Setup Vitest + React Testing Library
```bash
cd cornerstone
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom
```

**Step 2-5**: For each service/component:
1. Create `__tests__/[name].test.js` with failing tests
2. Create implementation file with minimal code
3. Iterate until all tests pass
4. Refactor while keeping tests green

**Step 6**: Integration
- Write integration test in `__tests__/integration/qa-feature.test.jsx`
- Modify `CornerstonePricingCalculator.jsx` to import and render `<PricingQA />`
- Pass `inputs` and `model` as props

**Step 7**: Manual verification
- Start dev server: `npm run dev`
- Test real API calls with actual questions
- Verify error handling (disconnect network, retry)

## Acceptance Criteria (Gherkin)

**AC1**: API service makes successful requests with correct headers
**AC2**: API service handles errors gracefully
**AC3**: Data formatter includes all assumptions, costs, margins, scenario details
**AC4**: System prompt defines role, includes context, provides guidelines
**AC5**: UI displays question input, submit button, response area
**AC6**: UI shows loading state, calls API, displays response
**AC7**: UI displays errors and allows retry

See `TDD_HANDOVER_SPEC.json` for full Gherkin scenarios.

## Key Technical Details

**OpenRouter API**:
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Headers: `Authorization: Bearer ${API_KEY}`, `Content-Type: application/json`, `HTTP-Referer: http://localhost:5556`
- Request body: `{ model, messages: [{ role: 'system', content }, { role: 'user', content }] }`

**Environment Variables** (Vite):
- Access via `import.meta.env.VITE_OPENROUTER_API_KEY`
- Model selection: `import.meta.env.VITE_ENV === 'dev' ? 'x-ai/grok-4-fast' : 'anthropic/claude-haiku-4.5'`

**React Patterns** (from Context7):
- `useState` for question, response, loading, error states
- `useEffect` not needed (API call triggered by user action)
- Functional components with hooks

**Tailwind Styling** (match existing patterns):
- Use slate colors (50, 100, 700, 900)
- Blue accents for primary actions
- Responsive with md: breakpoints
- Copy patterns from AdvancedAssumptions.jsx for collapsible sections

## Impact

**User Benefit**: Answer bid questions instantly without manually analyzing pricing data
**Technical Debt**: None (all new code, no modifications to pricing logic)
**Performance**: API calls are async, won't block UI

## Risks & Mitigations

1. **API Key Exposure** (HIGH): .env already in .gitignore, verify not committed
2. **Rate Limits** (MEDIUM): Use debouncing if needed, monitor usage
3. **Costs** (MEDIUM): Using cost-effective models, user aware of API costs
4. **CORS** (LOW): OpenRouter supports CORS, include HTTP-Referer

## Rollback Plan

Remove `PricingQA` import from `CornerstonePricingCalculator.jsx`. All new code is in separate files, no changes to existing pricing logic.

## Done Definition

✅ All 20+ unit tests pass
✅ Integration test passes
✅ Manual test with real API successful
✅ Error handling verified
✅ Loading states work
✅ Environment switching works (dev/prod models)
✅ Code follows Cornerstone patterns
✅ .env file not committed to git

## First Command

```bash
cd cornerstone && npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom
```

---

**Full Specification**: See `TDD_HANDOVER_SPEC.json` for complete test cases, edge cases, and detailed steps.
