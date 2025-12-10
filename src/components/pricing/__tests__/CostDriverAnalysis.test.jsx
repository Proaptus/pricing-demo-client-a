import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CostDriverAnalysis from '../CostDriverAnalysis.jsx';

describe('CostDriverAnalysis', () => {
  const formatGBP = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  describe('Ingestion CAPEX Breakdown', () => {
    it('should display Document Scanning Service when includeScanningService is true', () => {
      // Real-world scenario from user bug report
      const model = {
        capexOneTimePrice: 416555,
        opexAnnualPrice: 22800,
        ingestionTotalPrice: 242549,
        buildTotalPrice: 174006,
        P_manual_eng: 7578,
        P_OCR: 2602,
        P_LLM: 17103,
        P_scanning: 215267, // This is 88.7% of ingestion CAPEX!
        buildLaborPrice: 162642,
        buildPassthroughPrice: 11364,
        opexTotalPrice: 1900,
      };

      render(<CostDriverAnalysis model={model} formatGBP={formatGBP} />);

      // Should display the Document Scanning Service (appears in multiple places, so use getAllByText)
      const scanningElements = screen.getAllByText(/Document Scanning/i);
      expect(scanningElements.length).toBeGreaterThan(0);

      // Should display the correct price (appears in multiple places)
      const priceElements = screen.getAllByText('£215,267');
      expect(priceElements.length).toBeGreaterThan(0);

      // Verify the percentage is calculated correctly (215267 / 416555 * 100 = 51.7%)
      const percentageElements = screen.getAllByText(/51\.7%/);
      expect(percentageElements.length).toBeGreaterThan(0);
    });

    it('should include all four ingestion components when scanning is enabled', () => {
      const model = {
        capexOneTimePrice: 400000,
        opexAnnualPrice: 20000,
        ingestionTotalPrice: 250000,
        buildTotalPrice: 150000,
        P_manual_eng: 10000,
        P_OCR: 5000,
        P_LLM: 15000,
        P_scanning: 220000,
        buildLaborPrice: 140000,
        buildPassthroughPrice: 10000,
        opexTotalPrice: 1667,
      };

      render(<CostDriverAnalysis model={model} formatGBP={formatGBP} />);

      // All four components should be visible
      expect(screen.getByText(/Manual Review Support/i)).toBeInTheDocument();
      expect(screen.getByText(/OCR Processing/i)).toBeInTheDocument();
      expect(screen.getByText(/LLM Extraction/i)).toBeInTheDocument();
      // Document Scanning appears in multiple places, so check it exists
      const scanningElements = screen.getAllByText(/Document Scanning/i);
      expect(scanningElements.length).toBeGreaterThan(0);
    });

    it('should NOT display Document Scanning when P_scanning is 0 or undefined', () => {
      const model = {
        capexOneTimePrice: 100000,
        opexAnnualPrice: 20000,
        ingestionTotalPrice: 50000,
        buildTotalPrice: 50000,
        P_manual_eng: 20000,
        P_OCR: 15000,
        P_LLM: 15000,
        P_scanning: 0, // Scanning disabled
        buildLaborPrice: 45000,
        buildPassthroughPrice: 5000,
        opexTotalPrice: 1667,
      };

      render(<CostDriverAnalysis model={model} formatGBP={formatGBP} />);

      // Should NOT show scanning when it's 0
      expect(screen.queryByText(/Document Scanning/i)).not.toBeInTheDocument();
    });
  });

  describe('Top 3 CAPEX Drivers', () => {
    it('should include Document Scanning Service as #1 driver when it is the largest cost', () => {
      // User's actual bug report data
      const model = {
        capexOneTimePrice: 416555,
        opexAnnualPrice: 22800,
        ingestionTotalPrice: 242549,
        buildTotalPrice: 174006,
        P_manual_eng: 7578,
        P_OCR: 2602,
        P_LLM: 17103,
        P_scanning: 215267, // 51.7% - Should be #1 driver!
        buildLaborPrice: 162642, // 39.0% - Should be #2
        buildPassthroughPrice: 11364, // 2.7% - Should be #3
        opexTotalPrice: 1900,
      };

      render(<CostDriverAnalysis model={model} formatGBP={formatGBP} />);

      // Get the Top 3 section
      const top3Section = screen.getByText(/Top 3 CAPEX Drivers/i).parentElement;

      // Verify Document Scanning is #1
      expect(top3Section.textContent).toMatch(/1\.\s*Document Scanning.*£215,267.*51\.7%/);

      // Verify Build Labor is #2
      expect(top3Section.textContent).toMatch(/2\.\s*(?:Build Labor|Development Labor).*£162,642.*39\.0%/);

      // Verify AI Extraction is #3 (4.1% > Build Passthrough 2.7%)
      expect(top3Section.textContent).toMatch(/3\.\s*(?:AI Extraction|LLM).*£17,103.*4\.1%/);
    });

    it('should NOT include scanning in top drivers when P_scanning is 0', () => {
      const model = {
        capexOneTimePrice: 100000,
        opexAnnualPrice: 20000,
        ingestionTotalPrice: 50000,
        buildTotalPrice: 50000,
        P_manual_eng: 20000, // 20%
        P_OCR: 15000, // 15%
        P_LLM: 15000, // 15%
        P_scanning: 0, // Not enabled
        buildLaborPrice: 45000, // 45% - Should be #1
        buildPassthroughPrice: 5000, // 5%
        opexTotalPrice: 1667,
      };

      render(<CostDriverAnalysis model={model} formatGBP={formatGBP} />);

      const top3Section = screen.getByText(/Top 3 CAPEX Drivers/i).parentElement;

      // Should NOT mention scanning
      expect(top3Section.textContent).not.toMatch(/Document Scanning/i);

      // Should show other top drivers
      expect(top3Section.textContent).toMatch(/1\./);
      expect(top3Section.textContent).toMatch(/2\./);
      expect(top3Section.textContent).toMatch(/3\./);
    });
  });

  describe('Ingestion CAPEX sum validation', () => {
    it('should have ingestion sub-components sum approximately equal to total ingestion price', () => {
      const model = {
        capexOneTimePrice: 416555,
        opexAnnualPrice: 22800,
        ingestionTotalPrice: 242549,
        buildTotalPrice: 174006,
        P_manual_eng: 7578,
        P_OCR: 2602,
        P_LLM: 17103,
        P_scanning: 215267,
        buildLaborPrice: 162642,
        buildPassthroughPrice: 11364,
        opexTotalPrice: 1900,
      };

      // Sum of ingestion components
      const sumIngestion = model.P_manual_eng + model.P_OCR + model.P_LLM + model.P_scanning;

      // Should approximately equal total ingestion price (within £10 for rounding)
      expect(Math.abs(sumIngestion - model.ingestionTotalPrice)).toBeLessThan(10);
    });
  });
});
