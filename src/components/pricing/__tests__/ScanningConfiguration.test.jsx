import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScanningConfiguration from '../ScanningConfiguration';

describe('ScanningConfiguration - Equipment Configuration Expandable', () => {
  const mockInputs = {
    includeScanningService: true,
    scannerSpeed: 100,
    numberOfScanners: 2,
    scannerMonthlyLease: 800,
    workingHoursPerDay: 8,
    operatorHourlyRate: 15,
    qaReviewPercentage: 10,
    prepMinutesLease: 2,
    prepMinutesDeed: 3,
    prepMinutesLicence: 2.5,
    prepMinutesPlan: 4,
  };

  const mockModel = {
    C_OCR: 2805, // OCR cost for all pages
    config: {
      laborMargin: 0.47,
      passthroughMargin: 0.12,
    },
    scanningResult: {
      monthsNeeded: 3,
      daysNeeded: 63,
      dailyCapacity: 30000,
      costPerPage: 0.052,
      scanningCost: 125000,
      laborHours: 5000,
      totalPages: 1861500,
      operatorLaborCost: 70577,
      prepHours: 4250,
      scanningHours: 375,
      qaHours: 155,
      equipmentCost: 6000,
      managementCost: 4125,
      managementHours: 38,
      scanningLaborCost: 74702, // laborCost + overheadCost
      scanningPassthroughCost: 6000, // equipmentCost
    },
  };

  const mockSetInputs = () => {};

  it('should hide equipment configuration inputs by default', () => {
    render(
      <ScanningConfiguration
        inputs={mockInputs}
        setInputs={mockSetInputs}
        model={mockModel}
      />
    );

    // Button should show "Show equipment configuration"
    expect(screen.getByText('Show equipment configuration')).toBeInTheDocument();

    // Equipment inputs should NOT be visible (scanner speed value 100 should not be in document)
    expect(screen.queryByDisplayValue('100')).not.toBeInTheDocument();
  });

  it('should show equipment configuration inputs when toggle is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ScanningConfiguration
        inputs={mockInputs}
        setInputs={mockSetInputs}
        model={mockModel}
      />
    );

    // Click the toggle button
    const toggleButton = screen.getByText('Show equipment configuration');
    await user.click(toggleButton);

    // Button text should change
    expect(screen.getByText('Hide equipment configuration')).toBeInTheDocument();

    // Equipment configuration labels should now be visible
    expect(screen.getByText(/Scanner Speed \(pages\/min\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Number of Scanners/i)).toBeInTheDocument();
    expect(screen.getByText(/Scanner Lease \(£\/month\)/i)).toBeInTheDocument();
  });

  it('should hide equipment configuration when toggle is clicked again', async () => {
    const user = userEvent.setup();

    render(
      <ScanningConfiguration
        inputs={mockInputs}
        setInputs={mockSetInputs}
        model={mockModel}
      />
    );

    // Show equipment config
    const showButton = screen.getByText('Show equipment configuration');
    await user.click(showButton);

    // Hide equipment config
    const hideButton = screen.getByText('Hide equipment configuration');
    await user.click(hideButton);

    // Button should show "Show equipment configuration" again
    expect(screen.getByText('Show equipment configuration')).toBeInTheDocument();

    // Equipment inputs should be hidden again
    expect(screen.queryByDisplayValue('100')).not.toBeInTheDocument();
  });

  it('should not show equipment config section when scanning is disabled', () => {
    const disabledInputs = { ...mockInputs, includeScanningService: false };

    render(
      <ScanningConfiguration
        inputs={disabledInputs}
        setInputs={mockSetInputs}
        model={mockModel}
      />
    );

    // Toggle button should not be present when scanning is disabled
    expect(screen.queryByText('Show equipment configuration')).not.toBeInTheDocument();
    expect(screen.queryByText('Hide equipment configuration')).not.toBeInTheDocument();
  });
});
