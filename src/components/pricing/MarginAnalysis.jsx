import React from 'react';
import PricingSection from './shared/PricingSection';

/**
 * MarginAnalysis Component
 *
 * Displays comprehensive margin analysis including:
 * - Primary metrics (Total Cost, Total Price, Gross Profit, Gross Margin %)
 * - Target vs Achieved margin comparison with visual indicators
 * - Actionable insights and recommendations based on margin performance
 *
 * @param {Object} props
 * @param {Object} props.model - The computed financial model containing all calculations
 * @param {Function} props.formatGBP - Function to format currency values in GBP
 * @param {Object} props.inputs - User input values for calculations
 * @param {string} props.scenario - Selected pricing scenario name
 */
const MarginAnalysis = ({ model, formatGBP, inputs, scenario }) => {
  // CAPEX and OPEX margins must be reported separately - they are different financial categories
  // CAPEX: One-time implementation cost
  // OPEX: Annual ongoing operational cost

  const capexGrossMargin = model.capexOneTimePrice > 0 ? ((model.capexOneTimePrice - model.capexOneTimeCost) / model.capexOneTimePrice) * 100 : 0;
  const opexGrossMargin = model.opexAnnualPrice > 0 ? ((model.opexAnnualPrice - model.opexAnnualCost) / model.opexAnnualPrice) * 100 : 0;

  const laborMargin = model.config.laborMargin * 100;
  const passthroughMargin = model.config.passthroughMargin * 100;
  const targetMargin = model.config.targetMargin * 100;

  // Use CAPEX margin for variance comparison (primary project cost)
  const variance = capexGrossMargin - targetMargin;

  // Status: on-target, near-target, below-target
  let status, statusBadgeClass, statusBorderClass, statusTextClass, statusIcon;
  if (variance >= -2) {
    // Within 2% of target or above
    status = 'On Target';
    statusBadgeClass = 'bg-emerald-100 text-emerald-700';
    statusBorderClass = 'border-emerald-200';
    statusTextClass = 'text-emerald-700';
    statusIcon = '✓';
  } else if (variance >= -5) {
    // 2-5% below target
    status = 'Near Target';
    statusBadgeClass = 'bg-amber-100 text-amber-700';
    statusBorderClass = 'border-amber-200';
    statusTextClass = 'text-amber-700';
    statusIcon = '⚠';
  } else {
    // More than 5% below target
    status = 'Below Target';
    statusBadgeClass = 'bg-rose-100 text-rose-700';
    statusBorderClass = 'border-rose-200';
    statusTextClass = 'text-rose-700';
    statusIcon = '✗';
  }

  let statusMessage;
  let statusDetail;

  if (capexGrossMargin < 25) {
    statusMessage = 'CAPEX margin is below the target window. Consider adjusting assumptions or pricing.';
    statusDetail = (
      <ul className="list-disc ml-5 text-sm text-slate-600 space-y-1">
        <li>Reduce review time per document (currently {(inputs.reviewMinutes / 60).toFixed(2)} hours).</li>
        <li>Improve source data quality to cut manual review load.</li>
        <li>Optimise labour mix or contractor day rates.</li>
        <li>Review pass-through costs (OCR, LLM, hosting) for efficiencies.</li>
        <li>Explore alternative pricing scenarios with higher gross margins.</li>
      </ul>
    );
  } else if (capexGrossMargin >= 25 && capexGrossMargin < 35) {
    statusMessage = 'CAPEX margin sits within the acceptable band. The dual-margin strategy is performing as expected.';
    statusDetail = (
      <p className="text-sm text-slate-600">
        Labour margin {laborMargin.toFixed(0)}% and pass-through margin {passthroughMargin.toFixed(0)}% combine to deliver
        a {capexGrossMargin.toFixed(1)}% CAPEX margin for the {scenario} scenario.
      </p>
    );
  } else {
    statusMessage = 'CAPEX margin is outperforming target. Maintain the current operating cadence.';
    statusDetail = (
      <p className="text-sm text-slate-600">
        Strong margin mix: labour {laborMargin.toFixed(0)}% + pass-through {passthroughMargin.toFixed(0)}% = {capexGrossMargin.toFixed(1)}%.
      </p>
    );
  }

  return (
    <PricingSection
      title="Margin Analysis"
      subtitle="CAPEX and OPEX margins compared to targets, highlighting dual-margin performance."
      bodyClassName="space-y-6"
    >
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
            CAPEX · One-time implementation
          </h3>
          <div className="grid grid-cols-3 gap-4 text-slate-800">
            <div>
              <div className="text-xs text-slate-500 mb-1">Cost</div>
              <div className="text-xl font-semibold">{formatGBP(model.capexOneTimeCost, 0)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Price</div>
              <div className="text-xl font-semibold">{formatGBP(model.capexOneTimePrice, 0)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Margin</div>
              <div className="text-2xl font-bold text-slate-900">{capexGrossMargin.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
            OPEX · Annual managed service
          </h3>
          <div className="grid grid-cols-3 gap-4 text-slate-800">
            <div>
              <div className="text-xs text-slate-500 mb-1">Cost</div>
              <div className="text-xl font-semibold">{formatGBP(model.opexAnnualCost, 0)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Price</div>
              <div className="text-xl font-semibold">{formatGBP(model.opexAnnualPrice, 0)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Margin</div>
              <div className="text-2xl font-bold text-slate-900">{opexGrossMargin.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* CAPEX Margin vs Target */}
      <div className={`border rounded-lg p-5 ${statusBorderClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">CAPEX margin vs target</h3>
            <p className="text-sm text-slate-600 mt-1">{statusMessage}</p>
          </div>
          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass}`}>
            {statusIcon} {status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-slate-800">
          <div>
            <div className="text-xs text-slate-500 mb-1">Target margin</div>
            <div className="text-lg font-semibold">{targetMargin.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Achieved CAPEX margin</div>
            <div className="text-lg font-semibold">{capexGrossMargin.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Variance</div>
            <div className={`text-lg font-semibold ${statusTextClass}`}>
              {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Margin mix</div>
            <div className="text-sm font-semibold text-slate-800">
              Labour {laborMargin.toFixed(1)}% · Pass-through {passthroughMargin.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {statusDetail}
        </div>
      </div>
    </PricingSection>
  );
};

export default MarginAnalysis;
