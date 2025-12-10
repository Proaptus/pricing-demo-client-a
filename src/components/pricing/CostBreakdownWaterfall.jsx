import React from 'react';
import PricingSection from './shared/PricingSection';

/**
 * CostBreakdownWaterfall Component
 *
 * Displays a detailed waterfall/breakdown of total quote cost:
 * - Ingestion CAPEX (OCR + AI Extraction + Manual Review)
 * - Build CAPEX (Platform Engineering)
 * - OPEX (Annual)
 * - Total Quote with markup and gross margin
 *
 * Helps procurement understand cost structure and where value is delivered.
 *
 * @param {Object} props
 * @param {Object} props.model - The computed financial model containing all calculations
 * @param {Function} props.formatGBP - Function to format currency values in GBP
 */
const CostBreakdownWaterfall = ({ model, formatGBP, inputs }) => {
  // Extract key cost components
  const ocrCost = model.C_OCR;
  const llmCost = model.C_LLM;
  const manualCost = model.C_manual;
  const scanningCost = model.C_scanning || 0;
  const scanningResult = model.scanningResult;
  const ingestionLaborCost = manualCost;
  const ingestionPassthroughCost = ocrCost + llmCost + scanningCost;
  const ingestionTotalCost = model.ingestionTotalCost;
  const ingestionTotalPrice = model.ingestionTotalPrice;

  const buildLaborCost = model.buildLaborCost;
  const buildPassthroughCost = model.buildPassthroughCost;
  const buildTotalCost = model.buildTotalCost;
  const buildTotalPrice = model.buildTotalPrice;

  const opexAnnualCost = model.opexAnnualCost;
  const opexAnnualPrice = model.opexAnnualPrice;

  const capexTotalCost = model.capexOneTimeCost;
  const capexTotalPrice = model.capexOneTimePrice;

  // Calculate percentages within CAPEX
  const ingestionPct = capexTotalCost > 0 ? (ingestionTotalCost / capexTotalCost) * 100 : 0;
  const buildPct = capexTotalCost > 0 ? (buildTotalCost / capexTotalCost) * 100 : 0;

  // Calculate average margins (margin = (Price - Cost) / Price)
  const ingestionMarginAvg = ingestionTotalPrice > 0
    ? ((ingestionTotalPrice - ingestionTotalCost) / ingestionTotalPrice) * 100
    : 0;
  const buildMarginAvg = buildTotalPrice > 0
    ? ((buildTotalPrice - buildTotalCost) / buildTotalPrice) * 100
    : 0;
  const opexMarginAvg = opexAnnualPrice > 0
    ? ((opexAnnualPrice - opexAnnualCost) / opexAnnualPrice) * 100
    : 0;

  const totalBuildDays = inputs
    ? inputs.saDays + inputs.mlDays + inputs.beDays + inputs.feDays + inputs.devopsDays + inputs.qaDays + inputs.pmDays
    : null;
  const buildDaysLabel = totalBuildDays ? `${totalBuildDays} days` : 'multi-disciplinary effort';

  return (
    <PricingSection
      title="Cost Breakdown & Margin Structure"
      subtitle="Where capital expenditure and operating costs sit, with average margins by category."
      bodyClassName="space-y-6"
    >
      {/* Ingestion CAPEX */}
      <div className="border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Ingestion CAPEX (one-time)</h3>
          <span className="text-sm text-slate-500">{ingestionPct.toFixed(0)}% of total CAPEX cost</span>
        </div>
        <table>
          <tbody>
            {/* Show scanning service if enabled, otherwise show OCR */}
            {inputs.includeScanningService && scanningResult ? (
              <tr>
                <td className="text-slate-700">
                  <div>Document Scanning Service</div>
                  <div className="text-xs text-slate-500">AI-optimized prep, scan, OCR & classification</div>
                </td>
                <td className="text-right font-mono text-slate-600">{formatGBP(scanningCost, 0)}</td>
                <td className="text-right text-sm text-slate-500">
                  {(() => {
                    const laborPrice = scanningResult.scanningLaborCost / (1 - model.config.laborMargin);
                    const passthroughPrice = scanningResult.scanningPassthroughCost / (1 - model.config.passthroughMargin);
                    const totalScanningPrice = laborPrice + passthroughPrice;
                    const blendedMargin = ((totalScanningPrice - scanningCost) / totalScanningPrice) * 100;
                    return `${blendedMargin.toFixed(0)}% margin`;
                  })()}
                </td>
                <td className="text-right font-mono font-medium text-slate-900">
                  {(() => {
                    const laborPrice = scanningResult.scanningLaborCost / (1 - model.config.laborMargin);
                    const passthroughPrice = scanningResult.scanningPassthroughCost / (1 - model.config.passthroughMargin);
                    return formatGBP(laborPrice + passthroughPrice, 0);
                  })()}
                </td>
              </tr>
            ) : (
              <tr>
                <td className="text-slate-700">OCR (Azure Read)</td>
                <td className="text-right font-mono text-slate-600">{formatGBP(ocrCost, 0)}</td>
                <td className="text-right text-sm text-slate-500">{(model.config.passthroughMargin * 100).toFixed(0)}% margin</td>
                <td className="text-right font-mono font-medium text-slate-900">{formatGBP(model.P_OCR, 0)}</td>
              </tr>
            )}
            <tr>
              <td className="text-slate-700">AI Extraction</td>
              <td className="text-right font-mono text-slate-600">{formatGBP(llmCost, 0)}</td>
              <td className="text-right text-sm text-slate-500">{(model.config.passthroughMargin * 100).toFixed(0)}% margin</td>
              <td className="text-right font-mono font-medium text-slate-900">{formatGBP(model.P_LLM, 0)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="text-slate-700">Manual Review (billed {inputs.ourManualReviewPct}%)</td>
              <td className="text-right font-mono text-slate-600">{formatGBP(manualCost, 0)}</td>
              <td className="text-right text-sm text-slate-500">{(model.config.laborMargin * 100).toFixed(0)}% margin</td>
              <td className="text-right font-mono font-medium text-slate-900">{formatGBP(model.P_manual_eng, 0)}</td>
            </tr>
            <tr className="bg-slate-100 font-semibold border-t border-slate-200">
              <td>Ingestion CAPEX total</td>
              <td className="text-right font-mono">{formatGBP(ingestionTotalCost, 0)}</td>
              <td className="text-right text-sm text-slate-600">Avg {ingestionMarginAvg.toFixed(0)}% margin</td>
              <td className="text-right font-mono">{formatGBP(ingestionTotalPrice, 0)}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-slate-500 mt-3">
          Machine costs (OCR + AI) total {formatGBP(ocrCost + llmCost, 0)} — only {(((ocrCost + llmCost) / ingestionTotalCost) * 100).toFixed(1)}% of ingestion cost.
          The remaining spend is governed human review for low-quality documents.
        </p>
      </div>

      {/* Build CAPEX */}
      <div className="border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Build CAPEX (platform development)</h3>
          <span className="text-sm text-slate-500">{buildPct.toFixed(0)}% of total CAPEX cost</span>
        </div>
        <table>
          <tbody>
            <tr>
              <td className="text-slate-700">Engineering labour (multi-role · {buildDaysLabel})</td>
              <td className="text-right font-mono text-slate-600">{formatGBP(buildLaborCost, 0)}</td>
              <td className="text-right text-sm text-slate-500">{(model.config.laborMargin * 100).toFixed(0)}% margin</td>
              <td className="text-right font-mono font-medium text-slate-900">{formatGBP(model.buildLaborPrice, 0)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="text-slate-700">Security & accreditation (pen-test, hardening)</td>
              <td className="text-right font-mono text-slate-600">{formatGBP(buildPassthroughCost, 0)}</td>
              <td className="text-right text-sm text-slate-500">{(model.config.passthroughMargin * 100).toFixed(0)}% margin</td>
              <td className="text-right font-mono font-medium text-slate-900">{formatGBP(model.buildPassthroughPrice, 0)}</td>
            </tr>
            <tr className="bg-slate-100 font-semibold border-t border-slate-200">
              <td>Build CAPEX total</td>
              <td className="text-right font-mono">{formatGBP(buildTotalCost, 0)}</td>
              <td className="text-right text-sm text-slate-600">Avg {buildMarginAvg.toFixed(0)}% margin</td>
              <td className="text-right font-mono">{formatGBP(buildTotalPrice, 0)}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-slate-500 mt-3">
          Covers ingestion orchestration, document intelligence pipelines, governance, security, UX, QA, and the production-grade
          digital twin platform.
        </p>
      </div>

      {/* Annual OPEX */}
      <div className="border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">OPEX (annual run-rate)</h3>
          <span className="text-sm text-slate-500">Recurring managed service</span>
        </div>
        <table>
          <tbody>
            <tr>
              <td className="text-slate-700">Azure services, monitoring, support ({inputs.supportHours} hrs/mo)</td>
              <td className="text-right font-mono text-slate-600">{formatGBP(model.opexTotalCost, 0)}/month</td>
              <td className="text-right text-sm text-slate-500">{(model.config.passthroughMargin * 100).toFixed(0)}% margin</td>
              <td className="text-right font-mono font-medium text-slate-900">{formatGBP(model.opexTotalPrice, 0)}/month</td>
            </tr>
            <tr className="bg-slate-100 font-semibold border-t border-slate-200">
              <td>Annualised OPEX</td>
              <td className="text-right font-mono">{formatGBP(opexAnnualCost, 0)}</td>
              <td className="text-right text-sm text-slate-600">Avg {opexMarginAvg.toFixed(0)}% margin</td>
              <td className="text-right font-mono">{formatGBP(opexAnnualPrice, 0)}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-slate-500 mt-3">
          Baseline includes 16 hrs/month of managed support. Flexible tiers expand to 40–120 hrs/month as the programme scales.
        </p>
      </div>

      {/* Key Insights */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <h3 className="font-semibold text-slate-900 mb-3">What drives the economics</h3>
        <ul className="text-sm text-slate-600 space-y-2 ml-4 list-disc">
          <li>
            Machine costs remain minimal: OCR {formatGBP(ocrCost, 0)} + LLM {formatGBP(llmCost, 0)} =
            {` ${formatGBP(ocrCost + llmCost, 0)} `} ({(((ocrCost + llmCost) / capexTotalCost) * 100).toFixed(1)}% of CAPEX).
          </li>
          <li>
            Manual review is the lever: {model.H_rev?.toFixed(0)} flagged hours; Cornerstone bills {100 - inputs.ourManualReviewPct}%
            ({formatGBP(manualCost, 0)}) for spot checks and guidance, while Proaptus handles {inputs.ourManualReviewPct}% (they know their data best).
          </li>
          <li>
            Platform engineering is where value accrues: {buildPct.toFixed(0)}% of CAPEX funds automation, security, governance, and user experience.
          </li>
          <li>
            Ongoing operations remain predictable: {formatGBP(opexAnnualPrice, 0)}/year with clear levers for scaling support up or down.
          </li>
        </ul>
      </div>
    </PricingSection>
  );
};

export default CostBreakdownWaterfall;
