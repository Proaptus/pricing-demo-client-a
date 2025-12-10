import React from 'react';

/**
 * ReportVariantSelector Component
 * Allows user to choose report type before printing
 *
 * @param {string} reportVariant - Current selected variant (INTERNAL, ROM, DETAILED_QUOTE)
 * @param {Function} setReportVariant - Callback to update variant selection
 */
const ReportVariantSelector = ({ reportVariant, setReportVariant }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 mb-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Report Variant</h3>
      <p className="text-sm text-slate-600 mb-4">
        Select which report variant to generate when you print. Each variant is designed for different audiences and purposes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* INTERNAL Report */}
        <button
          onClick={() => setReportVariant('INTERNAL')}
          className={`p-4 rounded-lg border-2 transition text-left ${
            reportVariant === 'INTERNAL'
              ? 'border-blue-600 bg-blue-50'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div className="font-bold text-slate-900 mb-2">Internal Report</div>
          <div className="text-xs text-slate-600 space-y-1">
            <p>✓ Full financial analysis</p>
            <p>✓ All costs and markups</p>
            <p>✓ Gross margin calculations</p>
            <p>✓ Internal use only</p>
            <p className="text-red-600 font-semibold mt-2">CONFIDENTIAL</p>
          </div>
        </button>

        {/* ROM Report */}
        <button
          onClick={() => setReportVariant('ROM')}
          className={`p-4 rounded-lg border-2 transition text-left ${
            reportVariant === 'ROM'
              ? 'border-green-600 bg-green-50'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div className="font-bold text-slate-900 mb-2">ROM Quote</div>
          <div className="text-xs text-slate-600 space-y-1">
            <p>✓ Rough Order of Magnitude pricing</p>
            <p>✓ Three quality scenarios</p>
            <p>✓ Cost driver analysis</p>
            <p>✓ Early engagement tool</p>
            <p className="text-green-600 font-semibold mt-2">CLIENT PROPOSAL</p>
          </div>
        </button>

        {/* Detailed Quote Report */}
        <button
          onClick={() => setReportVariant('DETAILED_QUOTE')}
          className={`p-4 rounded-lg border-2 transition text-left ${
            reportVariant === 'DETAILED_QUOTE'
              ? 'border-purple-600 bg-purple-50'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div className="font-bold text-slate-900 mb-2">Detailed Quote</div>
          <div className="text-xs text-slate-600 space-y-1">
            <p>✓ Client-facing pricing</p>
            <p>✓ Detailed line items</p>
            <p>✓ No internal costs</p>
            <p>✓ Ready to present</p>
            <p className="text-purple-600 font-semibold mt-2">CLIENT-READY</p>
          </div>
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
        <strong>Tip:</strong> The report type determines what financial details are shown. INTERNAL shows all costs and margins, ROM shows pricing ranges by data quality, and DETAILED QUOTE shows client-facing pricing only.
      </div>
    </div>
  );
};

export default ReportVariantSelector;
