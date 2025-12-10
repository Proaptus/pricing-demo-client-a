# CLAUDE.md - Cornerstone Pricing Model

This file provides guidance to Claude Code (claude.ai/code) when working with the **Cornerstone** pricing model.

**Note**: This is the **reference model** for the multi-model platform. When creating new models, copy this folder structure and adapt the calculations.

## Project Overview

**Cornerstone Pricing Model** - A professional React-based web application for financial modeling and pricing analysis. The app provides three pricing scenarios (Conservative, Standard, Aggressive) with real-time calculations, cost breakdowns, margin analysis, and competitive benchmarking.

**Tech Stack:**
- React 18 + JSX
- Vite 5 (build tool & dev server)
- Tailwind CSS 3 (styling)
- Recharts 2 (data visualization)
- Lucide React (icons)

**Port:** 5556 (configured in vite.config.js)

## Project Structure

```
cornerstone/                                    # This model (self-contained)
├── src/
│   ├── components/
│   │   └── CornerstonePricingCalculator.jsx  # Main pricing model component
│   ├── App.jsx                                 # Root React component
│   ├── main.jsx                                # Vite entry point
│   └── index.css                               # Tailwind + global styles
├── index.html                                  # HTML template
├── package.json                                # Dependencies & scripts
├── vite.config.js                              # Vite configuration
├── tailwind.config.js                          # Tailwind CSS configuration
├── postcss.config.js                           # PostCSS configuration
├── netlify.toml                                # Netlify deployment config
└── CLAUDE.md                                   # This file (AI context)
```

## Core Architecture

### CornerstonePricingCalculator Component

The main pricing model component (`src/components/CornerstonePricingCalculator.jsx`) is a sophisticated financial modeling tool with:

**State Management:**
- `inputs` - User-adjustable parameters (sites, documents, costs, team days, etc.)
- `scenario` - Selected pricing scenario (conservative/standard/aggressive)
- `showAdvanced` - Toggle for advanced input sections
- `showComparison` - Toggle for scenario comparison view

**Calculation Engine:**
- `computeModel(inputs, config)` - Core function computing all financial metrics
- Calculates: Ingestion CAPEX, Build CAPEX, Monthly OPEX, pricing per site, gross margins
- Returns comprehensive model object with all intermediate calculations for transparency

**Scenario Configurations:**
- **Conservative**: Internal team, 50% labor markup, 10% passthrough, 1,000 site amortization, 33% target margin
- **Standard**: Hybrid contractors, 55% labor markup, 15% passthrough, 5,000 site amortization, 60% target margin
- **Aggressive**: Internal team, 100% labor markup, 20% passthrough, 10,000 site amortization, 75% target margin

**Data Flow:**
1. User adjusts inputs or selects scenario
2. `computeModel()` recalculates all metrics (memoized with useMemo)
3. UI renders cost/price tables, margin analysis, benchmarking, comparison charts
4. Export button downloads full model as JSON

### Key UI Sections

- **Scenario Selector**: Three buttons for pricing strategies
- **Key Assumptions**: Primary inputs (sites, docs, review time)
- **Advanced Assumptions**: Expandable section for granular parameters
- **Ingestion/Build/OPEX Tables**: Cost-to-price breakdowns with markup columns
- **Margin Analysis**: Dark dashboard showing total cost, price, profit, margin %
- **Competitive Benchmarking**: Comparison vs manual labor and competitor pricing
- **Scenario Comparison**: Optional chart and table comparing all three scenarios

## Common Development Commands

```bash
# Start development server (runs on http://localhost:5556)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# Install dependencies
npm install
```

## Development Guidelines

### Styling

- **Tailwind CSS**: All styling uses Tailwind utility classes. Global styles in `src/index.css`
- **Color Palette**: Slate grays (50, 100, 700, 900) + blue accents (primary colors)
- **Layout**: Responsive grid system with md: breakpoints for tablet/desktop
- **Tables**: Professional styling with hover effects, row groups, bold totals

### Component Patterns

- **Functional Components**: All components are functional with React hooks
- **Memoization**: Use `useMemo()` for expensive calculations (already used for `computeModel()`)
- **State Updates**: Use functional setState pattern for complex state: `setInputs(prev => ({ ...prev, newKey: value }))`
- **Formatting Utilities**: `formatGBP()` function formats currency with proper locale (en-GB)

### Adding New Features

**New Input Field:**
1. Add property to `defaultInputs` object
2. Add input element in appropriate section (Key Assumptions or Advanced)
3. Update `computeModel()` to use the new input if it affects calculations
4. Memoized model will automatically recalculate

**New Calculation:**
1. Add calculation logic to `computeModel()` function
2. Add result property to returned model object
3. Create UI element (table row, stat card, etc.) to display the result
4. Use `formatGBP()` for currency values

**New Scenario:**
1. Add entry to `SCENARIO_CONFIGS` object with labor rates, markups, amortization, target margin
2. Scenario automatically available in selector buttons

### Data Export

The Export JSON button serializes:
- Selected scenario name
- Current input values
- Complete model output (all calculations)
- Timestamp

Exported files are named: `cornerstone_pricing_{scenario}_{date}.json`

## Important Implementation Details

### Model Calculation Steps

1. **Input Aggregation**: Combine document mix and page counts
2. **Volume Calculations**: Derive total documents, pages, review hours
3. **Cost Calculations**: Compute labor + passthrough costs for each phase
4. **Markup Application**: Apply scenario-specific markups to costs → prices
5. **Amortization**: Spread build costs across site count
6. **Blending**: Combine ingestion + amortized build into per-site pricing
7. **Margin Calculation**: (Price - Cost) / Price = Gross Margin %
8. **Benchmarking**: Compare vs manual labor (£100/doc) and competitor (£75/doc)

### Responsive Design

- Mobile-first approach with Tailwind
- Primary inputs use 3-column grid on desktop, stack on mobile
- Advanced sections use 2-4 column grids depending on section
- Tables are scrollable on small screens
- Charts maintain aspect ratio with ResponsiveContainer

### Performance Considerations

- `useMemo()` prevents recalculating model on every render
- Scenario comparison pre-computes all three scenarios
- No unnecessary re-renders of child components (component structure is flat)
- Calculations are deterministic (same inputs = same outputs)

## Deployment

This model deploys to its own Netlify site:
- Base directory: `cornerstone`
- Build command: `npm run build`
- Publish directory: `dist`
- Configuration: `netlify.toml`

## Creating New Models from Cornerstone

To create a new pricing model:
1. Copy the entire `cornerstone/` folder → `new-model/`
2. Adapt calculations in `src/components/` per new model spec
3. Update `package.json` name
4. Update `vite.config.js` port (5557, 5558, etc.)
5. Update `netlify.toml` base directory
6. Create new Netlify site linked to new model folder

**Cornerstone remains the reference pattern** - when in doubt, refer to this structure.
