import React, { useState } from 'react';

/**
 * SaveScenarioModal Component
 * Modal dialog to capture user input for saving current assumptions
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {Function} onClose - Callback when user clicks cancel
 * @param {Function} onSave - Callback with scenario name and variant when user clicks save
 * @param {Object} inputs - Current assumption inputs (for validation)
 * @param {string} reportVariant - Current report variant (INTERNAL, ROM, DETAILED_QUOTE)
 */
const SaveScenarioModal = ({ isOpen, onClose, onSave, inputs, reportVariant }) => {
  const [scenarioName, setScenarioName] = useState('');
  const [error, setError] = useState('');

  const reportVariantLabel = {
    INTERNAL: 'Internal Report',
    ROM: 'ROM Quote',
    DETAILED_QUOTE: 'Detailed Quote',
  }[reportVariant] || reportVariant;

  const handleSave = () => {
    // Validation
    if (!scenarioName.trim()) {
      setError('Scenario name is required');
      return;
    }
    if (scenarioName.length > 100) {
      setError('Scenario name must be 100 characters or less');
      return;
    }

    // Call parent callback with scenario name and current report variant
    onSave(scenarioName.trim(), reportVariant);

    // Reset modal
    setScenarioName('');
    setError('');
  };

  const handleClose = () => {
    setScenarioName('');
    setError('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <h2 className="text-xl font-bold text-slate-800 mb-4">Save Assumption Scenario</h2>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-2">
          Give this data quality scenario a name so you can load it later for comparison or revision.
        </p>
        <p className="text-sm text-slate-500 mb-4 p-2 bg-slate-50 rounded border border-slate-200">
          <strong>Report Variant:</strong> {reportVariantLabel}
        </p>

        {/* Input Field */}
        <div className="mb-4">
          <label htmlFor="scenarioName" className="block text-sm font-semibold text-slate-700 mb-2">
            Scenario Name
          </label>
          <input
            id="scenarioName"
            type="text"
            value={scenarioName}
            onChange={(e) => {
              setScenarioName(e.target.value);
              setError(''); // Clear error on input change
            }}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Q4 2024 - Client A Data"
            maxLength={100}
            autoFocus
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-1">
            {scenarioName.length}/100 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>This will save:</strong> Current data quality assumptions, review rates, document counts, and all advanced parameters. Pricing scenario selection is NOT saved.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Scenario
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveScenarioModal;
