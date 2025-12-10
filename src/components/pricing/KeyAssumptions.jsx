import React from 'react';
import PricingSection from './shared/PricingSection';

/**
 * KeyAssumptions Component
 *
 * Displays primary input fields for the pricing model:
 * - Total Sites
 * - Min-Max Docs/Site
 * - Review Minutes/Doc
 *
 * @param {Object} props
 * @param {Object} props.inputs - Current input values
 * @param {Function} props.setInputs - Function to update input values
 * @param {boolean} props.showAdvanced - Whether advanced section is expanded
 * @param {Function} props.setShowAdvanced - Function to toggle advanced section
 * @param {Function} props.onSave - Callback when user saves updates
 * @param {Function} props.onCancel - Callback when user cancels edits
 * @param {React.ReactNode} props.children - Advanced assumption fields rendered when expanded
 */
const KeyAssumptions = ({
  inputs,
  setInputs,
  showAdvanced,
  setShowAdvanced,
  onSave,
  onCancel,
  children
}) => (
  <PricingSection
    title="Assumptions (Edit Mode)"
    subtitle="Update baseline volumes, quality mix, and review effort before saving."
    actions={(
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
        >
          Save Assumptions
        </button>
      </div>
    )}
    bodyClassName="space-y-6"
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Total Sites</label>
        <input
          type="number"
          value={inputs.nSites}
          onChange={(e) => setInputs(prev => ({ ...prev, nSites: Number(e.target.value) }))}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Min-Max Docs/Site</label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={inputs.minDocs}
            onChange={(e) => setInputs(prev => ({ ...prev, minDocs: Number(e.target.value) }))}
          />
          <input
            type="number"
            value={inputs.maxDocs}
            onChange={(e) => setInputs(prev => ({ ...prev, maxDocs: Number(e.target.value) }))}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Review Minutes/Doc</label>
        <input
          type="number"
          value={inputs.reviewMinutes}
          onChange={(e) => setInputs(prev => ({ ...prev, reviewMinutes: Number(e.target.value) }))}
        />
      </div>
    </div>

    <div className="pt-4 border-t border-slate-200 space-y-4">
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-slate-700 hover:text-slate-900 font-medium"
      >
        {showAdvanced ? 'Hide advanced fields' : 'Show advanced assumptions'}
      </button>
      {showAdvanced && children}
    </div>
  </PricingSection>
);

export default KeyAssumptions;
