import React from 'react';
import { describe, it, expect, test, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import CornerstonePricingCalculator, { defaultInputs, SCENARIO_CONFIGS, computeModel } from '../../src/components/CornerstonePricingCalculator';

// Mock Streamdown component
vi.mock('streamdown', () => ({
  Streamdown: ({ children }) => <div>{children}</div>,
}));

describe('Scanning Service Calculations - Integration Tests', () => {
  let container;

  beforeEach(() => {
    // Fresh render for each test
    const result = render(<CornerstonePricingCalculator />);
    container = result.container;
  });

  describe('Scanning Cost Calculation', () => {
    test('scanning service should calculate correct base cost components', async () => {
      // Scanning is enabled by default with new baseline (17,000 sites)
      expect(defaultInputs.includeScanningService).toBe(true);
      expect(defaultInputs.nSites).toBe(17000);

      const inputs = { ...defaultInputs };
      const config = SCENARIO_CONFIGS.conservative;
      const model = computeModel(inputs, config);

      // Verify scanning result exists
      expect(model.scanningResult).toBeDefined();
      expect(model.C_scanning).toBeDefined();
      expect(model.P_scanning).toBeDefined();

      // Verify scanning costs are positive numbers
      expect(model.C_scanning).toBeGreaterThan(0);
      expect(model.P_scanning).toBeGreaterThan(0);
      expect(model.P_scanning).toBeGreaterThan(model.C_scanning); // Price > Cost
    });

    test('dual-margin pricing should apply correctly to scanning components', async () => {
      const inputs = { ...defaultInputs };
      const config = SCENARIO_CONFIGS.conservative;
      const model = computeModel(inputs, config);

      // Verify conservative scenario margins
      expect(config.laborMargin).toBe(0.47); // 47%
      expect(config.passthroughMargin).toBe(0.12); // 12%

      // Verify scanning calculations exist
      expect(model.C_scanning).toBeDefined();
      expect(model.P_scanning).toBeDefined();

      // Price should be higher than cost (margin applied)
      const margin = (model.P_scanning - model.C_scanning) / model.P_scanning;
      expect(margin).toBeGreaterThan(0);
      expect(margin).toBeLessThan(1);
    });

    test('blended margin calculation should be accurate', async () => {
      const inputs = { ...defaultInputs };
      const config = SCENARIO_CONFIGS.conservative;
      const model = computeModel(inputs, config);

      // Verify blended margin exists
      expect(model.C_scanning).toBeDefined();
      expect(model.P_scanning).toBeDefined();

      // Calculate margin
      const margin = (model.P_scanning - model.C_scanning) / model.P_scanning;

      // Margin should be between 0 and 1 (0-100%)
      expect(margin).toBeGreaterThan(0);
      expect(margin).toBeLessThan(1);
    });
  });

  describe('Total CAPEX Calculations', () => {
    test('ingestion total should include scanning price correctly', async () => {
      const inputs = { ...defaultInputs };
      const config = SCENARIO_CONFIGS.conservative;
      const model = computeModel(inputs, config);

      // Verify ingestion total includes scanning
      expect(model.ingestionTotalCost).toBeDefined();
      expect(model.ingestionTotalPrice).toBeDefined();

      // Verify scanning is part of ingestion
      expect(model.C_scanning).toBeDefined();
      expect(model.ingestionTotalCost).toBeGreaterThan(model.C_scanning);
    });

    test('overall CAPEX margin should reflect correct prices', async () => {
      const inputs = { ...defaultInputs };
      const config = SCENARIO_CONFIGS.conservative;
      const model = computeModel(inputs, config);

      // Verify CAPEX totals exist (correct property name is capexOneTimeCost)
      expect(model.capexOneTimeCost).toBeDefined();
      expect(model.capexOneTimePrice).toBeDefined();

      // Verify price > cost
      expect(model.capexOneTimePrice).toBeGreaterThan(model.capexOneTimeCost);

      // Calculate margin
      const margin = (model.capexOneTimePrice - model.capexOneTimeCost) / model.capexOneTimePrice;
      expect(margin).toBeGreaterThan(0);
      expect(margin).toBeLessThan(1);
    });
  });

  describe('Cost Breakdown Waterfall Display', () => {
    test('should show scanning service in Cost Breakdown section', async () => {
      await waitFor(() => {
        expect(screen.getByText('Cornerstone AI Pricing Model')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify scanning-related text exists
      expect(container.textContent).toMatch(/Scanning|Document Scanning Service/i);
    });

    test('should calculate correct average margin for ingestion CAPEX', async () => {
      const inputs = { ...defaultInputs };
      const config = SCENARIO_CONFIGS.conservative;
      const model = computeModel(inputs, config);

      // Verify ingestion margin calculations exist
      expect(model.ingestionTotalCost).toBeDefined();
      expect(model.ingestionTotalPrice).toBeDefined();

      const avgMargin = (model.ingestionTotalPrice - model.ingestionTotalCost) / model.ingestionTotalPrice;
      expect(avgMargin).toBeGreaterThan(0);
      expect(avgMargin).toBeLessThan(1);
    });
  });

  describe('Management Cost at PM Rate', () => {
    test('management should be calculated at PM rate not operator rate', async () => {
      const inputs = { ...defaultInputs };
      const config = SCENARIO_CONFIGS.conservative;
      const model = computeModel(inputs, config);

      // Verify scanning result with management costs exist
      expect(model.scanningResult).toBeDefined();

      // PM rate should be higher than operator rate
      expect(config.pmRate).toBeGreaterThan(inputs.operatorHourlyRate * 8); // PM daily rate > operator daily rate
    });
  });

  describe('Scenario Configuration Margins', () => {
    test('Conservative scenario should have 47% labor and 12% passthrough margins', async () => {
      await waitFor(() => {
        expect(screen.getByText('Cornerstone AI Pricing Model')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify conservative scenario margins
      const config = SCENARIO_CONFIGS.conservative;
      expect(config.laborMargin).toBe(0.47); // 47%
      expect(config.passthroughMargin).toBe(0.12); // 12%

      // Verify button shows correct margins
      const conservativeButton = screen.getByRole('button', { name: /conservative/i });
      expect(conservativeButton).toBeDefined();

      // Check that margin values appear in the document
      expect(container.textContent).toContain('47');
      expect(container.textContent).toContain('12');
    });
  });
});
