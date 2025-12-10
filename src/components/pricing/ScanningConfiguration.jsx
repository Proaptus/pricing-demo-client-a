import React, { useState } from 'react';

/**
 * ScanningConfiguration Component
 *
 * Displays scanning service configuration with toggle and inputs.
 * When enabled, shows:
 * - Equipment parameters (scanner speed, number of scanners)
 * - Operation parameters (hours per day, operator rate, lease cost)
 * - Quality control (QA review percentage)
 * - Document preparation times by type
 * - Calculated results (duration, capacity, cost per page)
 *
 * @param {Object} props
 * @param {Object} props.inputs - Current input values
 * @param {Function} props.setInputs - Function to update input values
 * @param {Object} props.model - Computed model results (includes scanningResult)
 */
const ScanningConfiguration = ({ inputs, setInputs, model }) => {
  const [showEquipmentConfig, setShowEquipmentConfig] = useState(false);
  const handleToggle = () => {
    const newScanningState = !inputs.includeScanningService;

    // When enabling scanning, auto-apply Excellent Quality preset
    if (newScanningState) {
      setInputs(prev => ({
        ...prev,
        includeScanningService: true,
        // Apply Excellent Quality preset values (92% good, 7% med, 1% poor)
        qGood: 0.92,
        qMed: 0.07,
        qPoor: 0.01,
        rGood: 0.005,
        rMed: 0.03,
        rPoor: 0.10,
        reviewMinutes: 5,
        conflictMinutes: 1,
        minDocs: 5,
        maxDocs: 10,
        ourManualReviewPct: 75,
        tokensPerPage: 2100,
        pipelinePasses: 1.1,
      }));
    } else {
      // Just toggle off scanning (keep existing quality settings)
      setInputs(prev => ({ ...prev, includeScanningService: false }));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
      {/* Section Header with Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Document Scanning Service</h2>
          <p className="text-xs text-blue-600 font-medium">Professional Preparation & AI-Ready Output</p>
          <p className="text-sm text-slate-600 mt-1">
            Complete service: document prep, scanning, OCR, classification & metadata extraction
          </p>
        </div>
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={inputs.includeScanningService}
              onChange={handleToggle}
              className="sr-only"
            />
            <div className={`block w-14 h-8 rounded-full transition-colors ${
              inputs.includeScanningService ? 'bg-blue-600' : 'bg-slate-300'
            }`}></div>
            <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
              inputs.includeScanningService ? 'transform translate-x-6' : ''
            }`}></div>
          </div>
          <span className="ml-3 text-sm font-medium text-slate-700">
            {inputs.includeScanningService ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>

      {/* Scanning Inputs - Only show when enabled */}
      {inputs.includeScanningService && (
        <div className="space-y-6 pt-4 border-t border-slate-200">
          {/* Equipment Configuration - Expandable */}
          <div>
            <button
              onClick={() => setShowEquipmentConfig(!showEquipmentConfig)}
              className="text-sm text-slate-700 hover:text-slate-900 font-medium mb-3"
            >
              {showEquipmentConfig ? 'Hide equipment configuration' : 'Show equipment configuration'}
            </button>

            {showEquipmentConfig && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Scanner Speed (pages/min)
                  </label>
                  <input
                    type="number"
                    step={5}
                    min={50}
                    max={150}
                    value={inputs.scannerSpeed}
                    onChange={(e) => setInputs(prev => ({ ...prev, scannerSpeed: Number(e.target.value) }))}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Number of Scanners
                  </label>
                  <input
                    type="number"
                    step={1}
                    min={1}
                    max={5}
                    value={inputs.numberOfScanners}
                    onChange={(e) => setInputs(prev => ({ ...prev, numberOfScanners: Number(e.target.value) }))}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Scanner Lease (£/month)
                  </label>
                  <input
                    type="number"
                    step={100}
                    min={500}
                    max={2000}
                    value={inputs.scannerMonthlyLease}
                    onChange={(e) => setInputs(prev => ({ ...prev, scannerMonthlyLease: Number(e.target.value) }))}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Operation Configuration */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">Operation Configuration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Working Hours/Day
                </label>
                <input
                  type="number"
                  step={0.5}
                  min={4}
                  max={10}
                  value={inputs.workingHoursPerDay}
                  onChange={(e) => setInputs(prev => ({ ...prev, workingHoursPerDay: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Operator Rate (£/hour)
                </label>
                <input
                  type="number"
                  step={1}
                  min={10}
                  max={30}
                  value={inputs.operatorHourlyRate}
                  onChange={(e) => setInputs(prev => ({ ...prev, operatorHourlyRate: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  QA Review %
                </label>
                <input
                  type="number"
                  step={1}
                  min={5}
                  max={25}
                  value={inputs.qaReviewPercentage}
                  onChange={(e) => setInputs(prev => ({ ...prev, qaReviewPercentage: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Document Prep Times */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">Document Prep Time (minutes)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Lease Prep</label>
                <input
                  type="number"
                  step={0.5}
                  min={0}
                  max={10}
                  value={inputs.prepMinutesLease}
                  onChange={(e) => setInputs(prev => ({ ...prev, prepMinutesLease: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Deed Prep</label>
                <input
                  type="number"
                  step={0.5}
                  min={0}
                  max={10}
                  value={inputs.prepMinutesDeed}
                  onChange={(e) => setInputs(prev => ({ ...prev, prepMinutesDeed: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Licence Prep</label>
                <input
                  type="number"
                  step={0.5}
                  min={0}
                  max={10}
                  value={inputs.prepMinutesLicence}
                  onChange={(e) => setInputs(prev => ({ ...prev, prepMinutesLicence: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Plan Prep</label>
                <input
                  type="number"
                  step={0.5}
                  min={0}
                  max={10}
                  value={inputs.prepMinutesPlan}
                  onChange={(e) => setInputs(prev => ({ ...prev, prepMinutesPlan: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Calculated Results */}
          {model.scanningResult && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Service Delivery Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="block text-xs text-slate-600">Project Duration</span>
                    <span className="block text-lg font-bold text-slate-900">
                      {model.scanningResult.monthsNeeded} months
                    </span>
                    <span className="block text-xs text-slate-500">
                      ({model.scanningResult.daysNeeded} working days)
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-600">Daily Capacity</span>
                    <span className="block text-lg font-bold text-slate-900">
                      {model.scanningResult.dailyCapacity.toLocaleString()}
                    </span>
                    <span className="block text-xs text-slate-500">pages/day</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-600">Cost per Page</span>
                    <span className="block text-lg font-bold text-slate-900">
                      £{model.scanningResult.costPerPage.toFixed(3)}
                    </span>
                    <span className="block text-xs text-slate-500">
                      Total: £{model.scanningResult.scanningCost.toLocaleString('en-GB', {maximumFractionDigits: 0})}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-600">Labor Hours</span>
                    <span className="block text-lg font-bold text-slate-900">
                      {Math.round(model.scanningResult.laborHours).toLocaleString()}
                    </span>
                    <span className="block text-xs text-slate-500">total hours</span>
                  </div>
                </div>
              </div>

              {/* Value Breakdown - What's Included (FULLY CALCULATED FROM MODEL) */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">What's Included (Per Page Value)</h3>
                <div className="space-y-2 text-sm">
                  {(() => {
                    // Calculate all values dynamically from model
                    const totalPages = model.scanningResult.totalPages;
                    const prepCostPerPage = model.scanningResult.operatorLaborCost / totalPages * (model.scanningResult.prepHours / (model.scanningResult.prepHours + model.scanningResult.scanningHours + model.scanningResult.qaHours));
                    const scanningCostPerPage = model.scanningResult.operatorLaborCost / totalPages * (model.scanningResult.scanningHours / (model.scanningResult.prepHours + model.scanningResult.scanningHours + model.scanningResult.qaHours));
                    const qaCostPerPage = model.scanningResult.operatorLaborCost / totalPages * (model.scanningResult.qaHours / (model.scanningResult.prepHours + model.scanningResult.scanningHours + model.scanningResult.qaHours));
                    const equipmentCostPerPage = model.scanningResult.equipmentCost / totalPages;
                    const managementCostPerPage = model.scanningResult.managementCost / totalPages;

                    // Calculate PRICE per page (what client pays), not just cost
                    const laborMargin = model.config.laborMargin;
                    const passthroughMargin = model.config.passthroughMargin;
                    const laborPrice = model.scanningResult.scanningLaborCost / (1 - laborMargin);
                    const passthroughPrice = model.scanningResult.scanningPassthroughCost / (1 - passthroughMargin);
                    const totalPrice = laborPrice + passthroughPrice;
                    const pricePerPage = totalPrice / totalPages;

                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-slate-700">📋 Document Preparation</span>
                            <span className="text-xs text-slate-500 ml-2">({Math.round(model.scanningResult.prepHours).toLocaleString()} hrs unfolding, organizing)</span>
                          </div>
                          <span className="font-mono text-slate-900">£{prepCostPerPage.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-slate-700">📷 High-Volume Scanning</span>
                            <span className="text-xs text-slate-500 ml-2">({inputs.numberOfScanners} scanner{inputs.numberOfScanners > 1 ? 's' : ''}, {model.scanningResult.monthsNeeded} month{model.scanningResult.monthsNeeded > 1 ? 's' : ''})</span>
                          </div>
                          <span className="font-mono text-slate-900">£{(scanningCostPerPage + equipmentCostPerPage).toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-slate-700">🤖 AI Processing</span>
                            <span className="text-xs text-slate-500 ml-2">(OCR £{(model.C_OCR / totalPages).toFixed(4)}/page included in workflow)</span>
                          </div>
                          <span className="font-mono text-slate-900">£{(model.C_OCR / totalPages).toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-slate-700">✅ Quality Assurance</span>
                            <span className="text-xs text-slate-500 ml-2">({inputs.qaReviewPercentage}% verification)</span>
                          </div>
                          <span className="font-mono text-slate-900">£{qaCostPerPage.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-slate-700">🎯 Project Management</span>
                            <span className="text-xs text-slate-500 ml-2">({Math.round(model.scanningResult.managementHours).toLocaleString()} hrs coordination & oversight)</span>
                          </div>
                          <span className="font-mono text-slate-900">£{managementCostPerPage.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-green-300">
                          <span className="font-bold text-slate-900">Total Cost per Page</span>
                          <span className="font-mono font-bold text-slate-900">£{model.scanningResult.costPerPage.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="font-bold text-blue-800">Client Price per Page</span>
                          <span className="font-mono font-bold text-blue-900">£{pricePerPage.toFixed(3)}</span>
                        </div>
                        <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
                          <strong>💡 Competitive Context:</strong> DIY alternatives (outsourced scanning + Azure OCR + manual classification)
                          cost £0.06-£0.10/page. Our integrated service delivers AI-ready datasets at <strong>£{pricePerPage.toFixed(3)}/page</strong> with no project overhead.
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanningConfiguration;
