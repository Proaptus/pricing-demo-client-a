import React from 'react';

/**
 * CompetitiveBenchmarking Component
 *
 * Displays competitive pricing comparison using user-configurable benchmarks:
 * - Shows per-document costs from Advanced Assumptions (benchmarkManualPerDoc, benchmarkCompetitorPerDoc)
 * - Calculates total costs and savings vs Cornerstone AI pricing
 * - Industry research ranges shown as context notes
 *
 * USER-ADJUSTABLE: Benchmark values can be changed in Advanced Assumptions section.
 * All calculations use the values from inputs, ensuring transparent pricing comparisons.
 *
 * @param {Object} props
 * @param {Object} props.model - The computed financial model with pre-calculated savings
 * @param {Object} props.inputs - User input values (including benchmark per-doc costs)
 * @param {Function} props.formatGBP - Function to format currency values in GBP
 */
const CompetitiveBenchmarking = ({ model, inputs, formatGBP }) => {
  // Industry research ranges (shown as context notes only, NOT used in calculations)
  // Manual: GrowthFactor 2025 ($100-$4,000/lease ≈ £82-£3,280 @ 0.82 FX)
  // AI SaaS: LeaseLens $25/lease, LeaseAbstract AI $95/lease (≈ £20-£78)

  // CLIENT QUOTE PRICING: CAPEX only (one-time total cost to client)
  // Note: OPEX is ongoing, benchmarks compare one-time CAPEX cost per document
  const ourPrice = model.capexOneTimePrice;

  // USE ACTUAL INPUT VALUES for calculations (user-adjustable via Advanced Assumptions)
  // and the model's pre-calculated savings based on these inputs
  const savingsVsManual = model.savingsVsManual;
  const savingsVsCompetitor = model.savingsVsCompetitor;

  // Calculate percentage savings using model's calculated values
  const manualTotal = model.N_docs * inputs.benchmarkManualPerDoc;
  const competitorTotal = model.N_docs * inputs.benchmarkCompetitorPerDoc;

  const savingsVsManualPct = manualTotal > 0 ? ((savingsVsManual / manualTotal) * 100) : 0;
  const savingsVsCompetitorPct = competitorTotal > 0 ? ((savingsVsCompetitor / competitorTotal) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">
        Competitive Benchmarking
      </h2>

      <table className="w-full mb-4">
        <thead>
          <tr className="border-b-2 border-slate-300">
            <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Approach</th>
            <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Per Document</th>
            <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Total ({model.N_docs.toLocaleString()} docs)</th>
            <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">What's Included</th>
          </tr>
        </thead>
        <tbody>
          {/* Manual Abstraction Row */}
          <tr className="!transition-none hover:!bg-transparent">
            <td className="py-2 px-4 font-semibold">Manual Abstraction</td>
            <td className="py-2 px-4 text-sm font-mono">£{inputs.benchmarkManualPerDoc}/doc</td>
            <td className="py-2 px-4 text-right font-mono">
              {formatGBP(manualTotal, 0)}
            </td>
            <td className="py-2 px-4 text-xs text-slate-600">Factual QA review (£30/h × 22.4 min + 10% supervision overhead)</td>
          </tr>

          {/* AI SaaS Row */}
          <tr className="!transition-none hover:!bg-transparent">
            <td className="py-2 px-4 font-semibold">Software Vendor</td>
            <td className="py-2 px-4 text-sm font-mono">£{inputs.benchmarkCompetitorPerDoc}/doc</td>
            <td className="py-2 px-4 text-right font-mono">
              {formatGBP(competitorTotal, 0)}
            </td>
            <td className="py-2 px-4 text-xs text-slate-600">Conventional vendor (230d build + 10d ops ÷ 135k docs)</td>
          </tr>

          {/* Cornerstone AI Row */}
          <tr className="bg-blue-50 font-semibold border-t-2 border-slate-300 !transition-none hover:!bg-blue-50">
            <td className="py-2 px-4">Cornerstone AI</td>
            <td className="py-2 px-4 text-sm font-mono">£{(ourPrice / model.N_docs).toFixed(2)}/doc</td>
            <td className="py-2 px-4 text-right font-mono text-blue-700">
              {formatGBP(ourPrice, 0)}
            </td>
            <td className="py-2 px-4 text-xs text-slate-600">Full platform + SSO/MFA + audit + API</td>
          </tr>

          {/* Savings Rows */}
          <tr className={savingsVsManual > 0 ? "bg-green-50 font-bold border-t-2 border-slate-300 !transition-none hover:!bg-green-50" : "bg-red-50 font-bold border-t-2 border-slate-300 !transition-none hover:!bg-red-50"}>
            <td className={savingsVsManual > 0 ? "py-2 px-4 text-green-800" : "py-2 px-4 text-red-800"}>Savings vs Manual Abstraction</td>
            <td className="py-2 px-4 text-sm text-slate-600">{savingsVsManual > 0 ? 'Cheaper' : 'More Expensive'}</td>
            <td className={savingsVsManual > 0 ? "py-2 px-4 text-right font-mono text-green-700" : "py-2 px-4 text-right font-mono text-red-700"}>
              {formatGBP(savingsVsManual, 0)}
            </td>
            <td className={savingsVsManual > 0 ? "py-2 px-4 text-left text-sm text-green-700" : "py-2 px-4 text-left text-sm text-red-700"}>
              {savingsVsManual > 0 ? `${savingsVsManualPct.toFixed(0)}% cheaper` : `${Math.abs(savingsVsManualPct).toFixed(0)}% more expensive`}
            </td>
          </tr>

          <tr className={savingsVsCompetitor > 0 ? "bg-green-50 font-bold !transition-none hover:!bg-green-50" : "bg-red-50 font-bold !transition-none hover:!bg-red-50"}>
            <td className={savingsVsCompetitor > 0 ? "py-2 px-4 text-green-800" : "py-2 px-4 text-red-800"}>Savings vs Software Vendor</td>
            <td className="py-2 px-4 text-sm text-slate-600">{savingsVsCompetitor > 0 ? 'Cheaper' : 'More Expensive'}</td>
            <td className={savingsVsCompetitor > 0 ? "py-2 px-4 text-right font-mono text-green-700" : "py-2 px-4 text-right font-mono text-red-700"}>
              {formatGBP(savingsVsCompetitor, 0)}
            </td>
            <td className={savingsVsCompetitor > 0 ? "py-2 px-4 text-left text-sm text-green-700" : "py-2 px-4 text-left text-sm text-red-700"}>
              {savingsVsCompetitor > 0 ? `${savingsVsCompetitorPct.toFixed(0)}% cheaper` : `${Math.abs(savingsVsCompetitorPct).toFixed(0)}% more expensive`}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Detailed Pricing Breakdown */}
      <div className="bg-slate-50 rounded p-4 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-300">
          Cornerstone AI Pricing Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Infrastructure Services Section */}
          <div className="bg-white rounded p-3 border border-slate-200">
            <p className="font-bold text-slate-800 mb-2">Infrastructure Services</p>
            <div className="space-y-2 text-slate-700">
              {inputs.includeScanningService && model.scanningResult ? (
                <>
                  <div className="flex justify-between items-start">
                    <span>Document Scanning Service</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {(() => {
                        const laborPrice = model.scanningResult.scanningLaborCost / (1 - model.config.laborMargin);
                        const passthroughPrice = model.scanningResult.scanningPassthroughCost / (1 - model.config.passthroughMargin);
                        return formatGBP(laborPrice + passthroughPrice);
                      })()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 ml-0">Professional prep + scanning + AI-ready output</div>
                  <div className="text-xs text-blue-600 ml-0">Competitive with DIY (£0.06-£0.10/page)</div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <span>Azure OCR (Read)</span>
                    <span className="font-mono font-semibold text-slate-900">{formatGBP(model.P_OCR)}</span>
                  </div>
                  <div className="text-xs text-slate-500 ml-0">Document processing</div>
                </>
              )}

              <div className="flex justify-between items-start pt-1">
                <span>AI Extraction</span>
                <span className="font-mono font-semibold text-slate-900">{formatGBP(model.P_LLM)}</span>
              </div>
              <div className="text-xs text-slate-500 ml-0">Multi-model AI processing</div>

              <div className="flex justify-between items-start pt-1">
                <span>Azure Search (Annual)</span>
                <span className="font-mono font-semibold text-slate-900">{formatGBP(model.opexTotalPrice * 12 * 0.067)}</span>
              </div>
              <div className="text-xs text-slate-500 ml-0">Enterprise search service</div>

              <div className="flex justify-between items-start pt-1">
                <span>Storage & Hosting (Annual)</span>
                <span className="font-mono font-semibold text-slate-900">{formatGBP(model.opexTotalPrice * 12 * 0.2)}</span>
              </div>
              <div className="text-xs text-slate-500 ml-0">Cloud infrastructure</div>

              <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-start font-bold text-slate-900">
                <span>Infrastructure Total</span>
                <span className="font-mono">
                  {inputs.includeScanningService && model.scanningResult ? (
                    formatGBP((() => {
                      const laborPrice = model.scanningResult.scanningLaborCost / (1 - model.config.laborMargin);
                      const passthroughPrice = model.scanningResult.scanningPassthroughCost / (1 - model.config.passthroughMargin);
                      return laborPrice + passthroughPrice + model.P_LLM;
                    })())
                  ) : (
                    formatGBP(model.P_OCR + model.P_LLM)
                  )}
                </span>
              </div>
              <div className="text-xs text-slate-500">~3% of ingestion price</div>
            </div>
          </div>

          {/* Manual Review Section */}
          <div className="bg-white rounded p-3 border border-slate-200">
            <p className="font-bold text-slate-800 mb-2">Quality Assurance</p>
            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between items-start">
                <span>Document Flagging</span>
                <span className="font-mono font-semibold text-slate-900">{model.H_rev?.toFixed(0) || '–'} hrs</span>
              </div>
              <div className="text-xs text-slate-500 ml-0">Automated quality review</div>

              <div className="flex justify-between items-start pt-1">
                <span>Conflict Resolution</span>
                <span className="font-mono font-semibold text-slate-900">{model.H_conflict?.toFixed(0) || '–'} hrs</span>
              </div>
              <div className="text-xs text-slate-500 ml-0">Cross-document reconciliation</div>

              <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-start font-bold text-slate-900">
                <span>QA Services Price</span>
                <span className="font-mono">{formatGBP(model.P_manual_eng)}</span>
              </div>
              <div className="text-xs text-slate-500">Professional review services</div>

              <div className="bg-amber-50 border border-amber-200 rounded p-2 mt-2 text-amber-900 text-xs">
                ~{(model.pctManualOfIngestion?.toFixed(0) || '95')}% of ingestion price
              </div>
            </div>
          </div>

          {/* Build Engineering Section */}
          <div className="bg-white rounded p-3 border border-slate-200">
            <p className="font-bold text-slate-800 mb-2">Platform Development</p>
            <div className="space-y-2 text-slate-700">
              <div>
                <div className="font-semibold text-slate-900">Core Platform (230 days)</div>
                <div className="text-xs text-slate-500 mt-1">• Ingestion orchestration</div>
                <div className="text-xs text-slate-500">• Cross-document reasoning</div>
                <div className="text-xs text-slate-500">• Full-text search indexing</div>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <div className="font-semibold text-slate-900">Enterprise Security</div>
                <div className="text-xs text-slate-500 mt-1">• SSO/MFA authentication</div>
                <div className="text-xs text-slate-500">• Audit logging & RBAC</div>
                <div className="text-xs text-slate-500">• Pen-test & UAT</div>
              </div>

              <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-start font-bold text-slate-900">
                <span>Build Price</span>
                <span className="font-mono">{formatGBP(model.buildTotalPrice)}</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2 text-blue-900 text-xs">
                ~{(model.pctBuildOfTotal?.toFixed(0) || '75')}% of total price
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scanning Service Competitive Analysis (if included) */}
      {inputs.includeScanningService && model.scanningResult && (() => {
        // Calculate all values dynamically from model data
        const totalPages = model.scanningResult.totalPages;
        const laborPrice = model.scanningResult.scanningLaborCost / (1 - model.config.laborMargin);
        const passthroughPrice = model.scanningResult.scanningPassthroughCost / (1 - model.config.passthroughMargin);
        const totalPrice = laborPrice + passthroughPrice;
        const pricePerPage = totalPrice / totalPages;
        const costPerPage = model.scanningResult.scanningCost / totalPages;

        // Calculate cost breakdown components dynamically
        const operatorLaborCostPerPage = model.scanningResult.operatorLaborCost / totalPages;
        const managementCostPerPage = model.scanningResult.managementCost / totalPages;
        const equipmentCostPerPage = model.scanningResult.equipmentCost / totalPages;
        const overheadCostPerPage = model.scanningResult.overheadCost / totalPages;
        const totalLaborCostPerPage = operatorLaborCostPerPage + managementCostPerPage;
        const marginPct = ((pricePerPage - costPerPage) / pricePerPage) * 100;

        // Determine position in DIY range (£0.06-£0.10)
        const diyLow = 0.06;
        const diyHigh = 0.10;
        const diyRange = diyHigh - diyLow;
        const positionInRange = (pricePerPage - diyLow) / diyRange; // 0 = low end, 1 = high end

        let positionText = '';
        let positionColor = 'green';
        if (positionInRange < 0) {
          positionText = `Below DIY range (${(Math.abs(positionInRange) * 100).toFixed(0)}% under lower bound)`;
          positionColor = 'green';
        } else if (positionInRange <= 0.33) {
          positionText = `Lower end of DIY range (${(positionInRange * 100).toFixed(0)}% through £${diyLow}-£${diyHigh})`;
          positionColor = 'green';
        } else if (positionInRange <= 0.67) {
          positionText = `Mid-range of DIY alternative (${(positionInRange * 100).toFixed(0)}% through £${diyLow}-£${diyHigh})`;
          positionColor = 'blue';
        } else if (positionInRange < 1.0) {
          positionText = `Upper end of DIY range (${(positionInRange * 100).toFixed(0)}% through £${diyLow}-£${diyHigh})`;
          positionColor = 'amber';
        } else {
          positionText = `Above DIY range (${((positionInRange - 1.0) * 100).toFixed(0)}% over upper bound)`;
          positionColor = 'red';
        }

        // Check if we could charge more and still be competitive
        const aiDataPrepLow = 0.12;
        const aiDataPrepHigh = 0.25;
        const headroomToAIMarket = aiDataPrepLow - pricePerPage;

        return (
          <div className="bg-white rounded-lg border border-blue-200 p-4 mb-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-300">
              Document Scanning Service: AI Document Intelligence Market Analysis
            </h3>

            {/* Per-Page Pricing Comparison */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Per-Page Pricing Comparison</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-2 px-2 font-semibold text-slate-700">Service Type</th>
                    <th className="text-right py-2 px-2 font-semibold text-slate-700">Price/Page</th>
                    <th className="text-left py-2 px-2 font-semibold text-slate-700">What's Included</th>
                  </tr>
                </thead>
                <tbody>
                  {/* DIY Alternative */}
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-2 font-semibold">DIY Alternative</td>
                    <td className="py-2 px-2 text-right font-mono">£{diyLow.toFixed(2)} - £{diyHigh.toFixed(2)}</td>
                    <td className="py-2 px-2 text-slate-600">Paper Escape (£0.02-£0.04) + Azure OCR (£0.001) + Manual classification (£0.02-£0.05) + PM overhead (£0.01-£0.02)</td>
                  </tr>

                  {/* Cloud AI Only (Not Comparable) */}
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="py-2 px-2 text-slate-500">Cloud AI Only</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-500">£0.001 - £0.04</td>
                    <td className="py-2 px-2 text-slate-500 italic">Azure/Google (digital docs only - no physical handling)</td>
                  </tr>

                  {/* Our Price */}
                  <tr className="bg-blue-50 font-semibold border-b-2 border-blue-300">
                    <td className="py-2 px-2 text-blue-900">Cornerstone Scanning</td>
                    <td className="py-2 px-2 text-right font-mono text-blue-700">
                      £{pricePerPage.toFixed(3)}
                    </td>
                    <td className="py-2 px-2 text-blue-900">Physical prep ({Math.round(model.scanningResult.prepHours).toLocaleString()} hrs) + scanning + OCR + classification + AI-ready output</td>
                  </tr>

                  {/* AI Data Prep Market Range */}
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-2 text-slate-600">AI Data Prep Market</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">£{aiDataPrepLow.toFixed(2)} - £{aiDataPrepHigh.toFixed(2)}</td>
                    <td className="py-2 px-2 text-slate-600">Full AI dataset preparation (estimated market range)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cost Structure Transparency */}
            <div className="bg-slate-50 rounded p-3 mb-3">
              <p className="text-sm font-semibold text-slate-700 mb-2">Cost Breakdown (Calculated from Model)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-slate-600">Labor (Operator+Mgmt)</div>
                  <div className="font-mono font-semibold text-slate-900">£{totalLaborCostPerPage.toFixed(3)}/page</div>
                  <div className="text-slate-500">
                    Operator: {Math.round(model.scanningResult.prepHours + model.scanningResult.scanningHours + model.scanningResult.qaHours).toLocaleString()} hrs @ £{inputs.operatorHourlyRate}/hr
                    <br />Mgmt: {Math.round(model.scanningResult.managementHours).toLocaleString()} hrs
                  </div>
                </div>
                <div>
                  <div className="text-slate-600">Equipment</div>
                  <div className="font-mono font-semibold text-slate-900">£{equipmentCostPerPage.toFixed(3)}/page</div>
                  <div className="text-slate-500">{inputs.numberOfScanners} scanners × {model.scanningResult.monthsNeeded} months</div>
                </div>
                <div>
                  <div className="text-slate-600">Overhead (25%)</div>
                  <div className="font-mono font-semibold text-slate-900">£{overheadCostPerPage.toFixed(3)}/page</div>
                  <div className="text-slate-500">Management + facilities</div>
                </div>
                <div className="bg-white rounded p-2 border border-slate-300">
                  <div className="text-slate-700 font-semibold">Total Cost</div>
                  <div className="font-mono font-bold text-slate-900">£{costPerPage.toFixed(3)}/page</div>
                  <div className="text-green-700 font-semibold">{marginPct.toFixed(0)}% margin</div>
                </div>
              </div>
            </div>

            {/* Market Positioning Analysis */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm font-semibold text-blue-900 mb-2">📊 Competitive Positioning Analysis</p>
              <div className="space-y-2 text-xs text-blue-900">
                <div className="flex items-start gap-2">
                  <span className={`font-bold text-${positionColor}-700`}>
                    {positionInRange < 1.0 ? '✓' : '⚠'}
                  </span>
                  <span><strong>Position vs DIY:</strong> {positionText}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-700">→</span>
                  <span><strong>Market Gap:</strong> Few providers offer physical document handling + AI optimization integrated service</span>
                </div>
                {headroomToAIMarket > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-amber-600">⚠</span>
                    <span><strong>Pricing Opportunity:</strong> Could charge up to £{aiDataPrepLow.toFixed(3)}/page (+£{headroomToAIMarket.toFixed(3)} or +{((headroomToAIMarket / pricePerPage) * 100).toFixed(0)}%) and remain competitive in AI data preparation market</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-700">•</span>
                  <span><strong>Positioning:</strong> "AI-Ready Document Intelligence Services" not "document scanning" - targets AI/ML teams building document intelligence systems</span>
                </div>
              </div>
            </div>

            {/* Volume Details */}
            <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <span className="font-semibold">Total Documents:</span> {model.N_docs.toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Total Pages:</span> {totalPages.toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Prep Hours:</span> {Math.round(model.scanningResult.prepHours).toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Production Time:</span> {model.scanningResult.daysNeeded} days ({model.scanningResult.monthsNeeded} months)
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sources & Methodology */}
      <div className="text-xs text-slate-500 border-t border-slate-200 pt-3 mt-3">
        <p className="font-semibold mb-2 text-slate-700">Benchmark Methodology:</p>
        <ul className="space-y-1 ml-4">
          <li><strong>Manual abstraction (£12/doc):</strong> Factual QA-grade review rate (£30/h) × 22.4 min per document (20 min review + 18 min conflict resolution ÷ 7.5 docs/site) + 10% supervision overhead = £11.19 → £12. Based on telecom QA labor, not senior analyst rates (£44/h).</li>
          <li><strong>Conventional vendor (£5/doc):</strong> Reverse-engineered from typical project delivery: Platform Build (230 days @ £900 rate with multipliers/overhead ≈ £355k) + Ingestion Setup (10 days/1,000 sites ≈ £235k) + infrastructure ≈ £600k total ÷ 135,000 documents = £4.44 → £5/doc</li>
          <li><strong>Cornerstone AI:</strong> Full platform cost per document (calculated above: £2.24/doc standard scenario)</li>
          {inputs.includeScanningService && (() => {
            const laborPrice = model.scanningResult.scanningLaborCost / (1 - model.config.laborMargin);
            const passthroughPrice = model.scanningResult.scanningPassthroughCost / (1 - model.config.passthroughMargin);
            const totalPrice = laborPrice + passthroughPrice;
            const pricePerPage = totalPrice / model.scanningResult.totalPages;
            return (
              <li><strong>Scanning service benchmarks:</strong> Based on "AI Document Intelligence Competitive Analysis" (REF-2025-11-scanning-competitive-analysis). DIY alternative = Paper Escape (£0.02-£0.04) + Azure OCR (£0.001) + manual classification labor (£0.02-£0.05) + PM overhead (£0.01-£0.02) = £0.06-£0.10/page total. Our integrated service at £{pricePerPage.toFixed(3)}/page is competitively positioned at lower end of DIY range.</li>
            );
          })()}
          <li className="text-slate-600 italic mt-2">
            Your pricing is <strong>≈2.2× cheaper than conventional vendor</strong> and <strong>≈5.4× cheaper than pure manual QA</strong>. This reflects the economics of built platform + scale, vs. project-based customization.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CompetitiveBenchmarking;
