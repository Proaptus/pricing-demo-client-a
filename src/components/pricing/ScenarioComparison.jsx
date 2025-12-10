import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PricingSection from './shared/PricingSection';

/**
 * ScenarioComparison Component
 *
 * Displays a comparison table and chart for all three pricing scenarios
 * (Conservative, Standard, Aggressive). Includes toggle to show/hide the comparison.
 *
 * @param {Object} props - Component props
 * @param {Object} props.allScenarios - Object containing computed models for all scenarios
 * @param {Object} props.allScenarios.conservative - Conservative scenario model
 * @param {Object} props.allScenarios.standard - Standard scenario model
 * @param {Object} props.allScenarios.aggressive - Aggressive scenario model
 * @param {boolean} props.showComparison - Whether to display the comparison section
 * @param {Function} props.setShowComparison - Function to toggle comparison visibility
 * @param {Function} props.formatGBP - Currency formatting function
 */
const ScenarioComparison = ({ allScenarios, showComparison, setShowComparison, formatGBP }) => {
  // Calculate metrics for each scenario - CAPEX and OPEX reported separately
  const scenarios = ['conservative', 'standard', 'aggressive'];
  const scenarioData = scenarios.map(key => {
    const scenario = allScenarios[key];

    // Calculate CAPEX margin (primary project cost indicator)
    const capexMargin = scenario.capexOneTimePrice > 0 ? ((scenario.capexOneTimePrice - scenario.capexOneTimeCost) / scenario.capexOneTimePrice) * 100 : 0;
    const targetMargin = scenario.config.targetMargin * 100;
    const variance = capexMargin - targetMargin;

    return {
      name: scenario.config.name,
      capexPrice: scenario.capexOneTimePrice,
      opexPrice: scenario.opexAnnualPrice,
      targetMargin,
      capexMargin,
      variance,
      laborMargin: scenario.config.laborMargin * 100,
      passthroughMargin: scenario.config.passthroughMargin * 100,
      onTarget: variance >= -2,
    };
  });

  return (
    <>
      {/* Toggle Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="px-3 py-1.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-md hover:bg-slate-100"
        >
          {showComparison ? 'Hide comparison' : 'Show scenario comparison'}
        </button>
      </div>

      {/* Scenario Comparison Content */}
      {showComparison && (
        <PricingSection
          title="Scenario Comparison"
          subtitle="Benchmark Conservative, Standard, and Aggressive scenarios across margin targets."
          bodyClassName="space-y-6"
        >
          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scenarioData.map((scenario, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-4 bg-white transition-shadow ${scenario.onTarget ? 'border-slate-900 shadow-sm' : 'border-slate-200'}`}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">{scenario.name}</h3>
                  <div className="text-sm text-slate-600 mt-2 space-y-1">
                    <div>
                      CAPEX (one-time):{' '}
                      <span className="font-mono font-bold text-slate-900">{formatGBP(scenario.capexPrice, 0)}</span>
                    </div>
                    <div>
                      OPEX (annual):{' '}
                      <span className="font-mono font-bold text-slate-900">{formatGBP(scenario.opexPrice, 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-3">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Target margin</span>
                    <span className="font-mono font-semibold text-slate-800">{scenario.targetMargin.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>CAPEX margin</span>
                    <span className={`font-mono font-semibold ${scenario.onTarget ? 'text-slate-900' : 'text-slate-700'}`}>
                      {scenario.capexMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Variance</span>
                    <span className={`font-mono font-semibold ${scenario.onTarget ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {scenario.variance > 0 ? '+' : ''}{scenario.variance.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">Labour margin</div>
                      <div className="font-mono font-semibold text-slate-800">{scenario.laborMargin.toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">Pass-through</div>
                      <div className="font-mono font-semibold text-slate-800">{scenario.passthroughMargin.toFixed(0)}%</div>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${scenario.onTarget ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {scenario.onTarget ? '✓ On target' : '≈ Monitor'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Comparison Table */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Detailed comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Metric</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-600">Conservative<br />(40%)</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-600">Standard<br />(50%)</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-600">Aggressive<br />(60%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2 px-3">CAPEX (One-time)</td>
                    <td className="py-2 px-3 text-right font-mono">{formatGBP(allScenarios.conservative.capexOneTimePrice, 0)}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatGBP(allScenarios.standard.capexOneTimePrice, 0)}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatGBP(allScenarios.aggressive.capexOneTimePrice, 0)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2 px-3">OPEX (Annual)</td>
                    <td className="py-2 px-3 text-right font-mono">{formatGBP(allScenarios.conservative.opexAnnualPrice, 0)}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatGBP(allScenarios.standard.opexAnnualPrice, 0)}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatGBP(allScenarios.aggressive.opexAnnualPrice, 0)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-slate-50 font-semibold">
                    <td className="py-2 px-3">CAPEX Margin %</td>
                    <td className="py-2 px-3 text-right font-mono">{scenarioData[0].capexMargin.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-right font-mono">{scenarioData[1].capexMargin.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-right font-mono">{scenarioData[2].capexMargin.toFixed(1)}%</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2 px-3">vs Manual Benchmark</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">
                      {(((allScenarios.conservative.capexOneTimePrice / allScenarios.conservative.benchManualTotal) - 1) * 100).toFixed(0)}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">
                      {(((allScenarios.standard.capexOneTimePrice / allScenarios.standard.benchManualTotal) - 1) * 100).toFixed(0)}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">
                      {(((allScenarios.aggressive.capexOneTimePrice / allScenarios.aggressive.benchManualTotal) - 1) * 100).toFixed(0)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Margin Visualization */}
          <div className="mt-6">
            <h3 className="font-semibold text-slate-900 mb-4">Margin performance chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Margin %', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(v) => v.toFixed(1) + '%'} />
                <Bar dataKey="targetMargin" fill="#cbd5e1" name="Target Margin" />
                <Bar dataKey="capexMargin" fill="#64748b" name="CAPEX Margin" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Note */}
          <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <p className="text-sm text-slate-700">
              <strong>Insight:</strong> Each scenario protects target CAPEX margins through a dual-margin approach—value-added labour carries higher markup,
              while pass-through Azure costs stay lean and defensible.
            </p>
          </div>
        </PricingSection>
      )}
    </>
  );
};

export default ScenarioComparison;
