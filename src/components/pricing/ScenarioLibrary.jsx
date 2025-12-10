import React from 'react';
import { Trash2, Download, FolderOpen } from 'lucide-react';

/**
 * ScenarioLibrary Component
 * Displays saved assumption scenarios with load, export, and delete actions
 *
 * @param {Array<Object>} scenarios - Array of saved scenario objects
 * @param {Function} onLoadScenario - Callback when user clicks load
 * @param {Function} onDeleteScenario - Callback when user clicks delete
 * @param {Function} onExportScenario - Callback when user clicks export
 */
const ScenarioLibrary = ({ scenarios, onLoadScenario, onDeleteScenario, onExportScenario }) => {
  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 border border-slate-200 text-center">
        <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No Saved Scenarios</h3>
        <p className="text-slate-600">
          Save your current assumptions to build a library of data quality scenarios for comparison.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Saved Assumption Scenarios</h2>

      <div className="space-y-2">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
          >
            {/* Scenario Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-800 truncate">{scenario.name}</h3>
                {scenario.reportVariant && (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded whitespace-nowrap">
                    {scenario.reportVariant === 'INTERNAL' ? 'Internal' :
                     scenario.reportVariant === 'ROM' ? 'ROM' :
                     'Detailed Quote'}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">
                <div>
                  Saved: {new Date(scenario.timestamp).toLocaleDateString()} at{' '}
                  {new Date(scenario.timestamp).toLocaleTimeString()}
                </div>
                <div className="mt-1">
                  Quality: {(scenario.assumptions.qGood * 100).toFixed(0)}% good /{' '}
                  {(scenario.assumptions.qMed * 100).toFixed(0)}% medium /{' '}
                  {(scenario.assumptions.qPoor * 100).toFixed(0)}% poor
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onLoadScenario(scenario.id)}
                className="px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                title="Load this scenario into the pricing model"
              >
                Load
              </button>

              <button
                onClick={() => onExportScenario(scenario.id)}
                className="p-2 border border-slate-300 text-slate-600 rounded hover:bg-slate-100 transition-colors"
                title="Export this scenario as JSON"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete scenario "${scenario.name}"?`)) {
                    onDeleteScenario(scenario.id);
                  }
                }}
                className="p-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                title="Delete this scenario"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-sm text-slate-600">
          <strong>{scenarios.length}</strong> scenario{scenarios.length !== 1 ? 's' : ''} saved •{' '}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => {
              // Export all scenarios
              const allData = {
                scenarios,
                exportedAt: new Date().toISOString(),
                count: scenarios.length,
              };
              const blob = new Blob([JSON.stringify(allData, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `all_scenarios_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export all scenarios
          </span>
        </p>
      </div>
    </div>
  );
};

export default ScenarioLibrary;
