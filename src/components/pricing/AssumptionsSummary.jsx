import React from 'react';
import PricingSection from './shared/PricingSection';

const SummaryTable = ({ title, rows }) => (
  <div className="flex-1 min-w-[240px]">
    <h3 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b border-slate-200">{title}</h3>
    <table className="w-full">
      <tbody>
        {rows.map(({ label, value }, idx) => (
          <tr
            key={label}
            className={`border-b border-slate-100 ${idx === rows.length - 1 ? 'border-b-0' : ''}`}
          >
            <td className="py-2 pr-4 text-sm text-slate-600">{label}</td>
            <td className="py-2 text-sm font-medium text-slate-900 text-right">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * AssumptionsSummary - Read-only view of core and advanced assumptions
 *
 * @param {Object} props
 * @param {Object} props.inputs - Current assumption values
 * @param {Function} props.onEdit - Callback to enter edit mode
 */
const AssumptionsSummary = ({ inputs, onEdit }) => {
  const volumeRows = [
    { label: 'Total Sites', value: inputs.nSites.toLocaleString() },
    { label: 'Docs per Site', value: `${inputs.minDocs} – ${inputs.maxDocs}` },
    {
      label: 'Document Mix',
      value: [
        inputs.mixLease,
        inputs.mixDeed,
        inputs.mixLicence,
        inputs.mixPlan
      ]
        .map((v, idx) => {
          const labels = ['Lease', 'Deed', 'Licence', 'Plan'];
          return `${labels[idx]} ${(v * 100).toFixed(0)}%`;
        })
        .join(' / ')
    },
    {
      label: 'Pages per Document',
      value: [
        { label: 'Lease', value: inputs.pagesLease },
        { label: 'Deed', value: inputs.pagesDeed },
        { label: 'Licence', value: inputs.pagesLicence },
        { label: 'Plan', value: inputs.pagesPlan }
      ]
        .map(item => `${item.label} ${item.value}`)
        .join(' · ')
    }
  ];

  const qualityRows = [
    {
      label: 'Quality Mix',
      value: [
        { label: 'Good', value: inputs.qGood },
        { label: 'Medium', value: inputs.qMed },
        { label: 'Poor', value: inputs.qPoor }
      ]
        .map(item => `${item.label} ${(item.value * 100).toFixed(0)}%`)
        .join(' / ')
    },
    {
      label: 'Review Rates',
      value: [
        { label: 'Good', value: inputs.rGood },
        { label: 'Medium', value: inputs.rMed },
        { label: 'Poor', value: inputs.rPoor }
      ]
        .map(item => `${item.label} ${(item.value * 100).toFixed(0)}%`)
        .join(' / ')
    },
    { label: 'Review Minutes / Doc', value: `${inputs.reviewMinutes} min` },
    { label: 'Conflict Resolution', value: `${inputs.conflictMinutes} min` },
    {
      label: 'Manual Review Ownership',
      value: `Cornerstone ${inputs.ourManualReviewPct}% / Proaptus ${100 - inputs.ourManualReviewPct}%`
    }
  ];

  const costRows = [
    { label: 'OCR Cost (per 1k pages)', value: `£${inputs.ocrCostPer1000.toFixed(2)}` },
    {
      label: 'LLM Usage',
      value: `${inputs.tokensPerPage.toLocaleString()} tokens/page × ${inputs.pipelinePasses} passes`
    },
    {
      label: 'LLM Cost (per M tokens)',
      value: `£${inputs.llmCostPerMTokens.toFixed(2)}`
    },
    { label: 'Support Allowance', value: `${inputs.supportHours} hrs @ £${inputs.supportRate}/hr` },
    { label: 'Azure Search', value: `£${inputs.azureSearch.toLocaleString()}/month` },
    { label: 'App Hosting', value: `£${inputs.appHosting.toLocaleString()}/month` },
    { label: 'Monitoring & Ops', value: `£${inputs.monitoring.toLocaleString()}/month` }
  ];

  const buildRows = [
    { label: 'Solution Architect', value: `${inputs.saDays} days` },
    { label: 'ML Engineer', value: `${inputs.mlDays} days` },
    { label: 'Backend Engineer', value: `${inputs.beDays} days` },
    { label: 'Frontend Engineer', value: `${inputs.feDays} days` },
    { label: 'DevOps', value: `${inputs.devopsDays} days` },
    { label: 'QA & Testing', value: `${inputs.qaDays} days` },
    { label: 'Product / PM', value: `${inputs.pmDays} days` },
    { label: 'Pen-test', value: `£${inputs.penTest.toLocaleString()}` }
  ];

  const benchmarkRows = [
    {
      label: 'Manual Benchmark (per doc)',
      value: `£${inputs.benchmarkManualPerDoc.toFixed(2)}`
    },
    {
      label: 'Competitor Benchmark (per doc)',
      value: `£${inputs.benchmarkCompetitorPerDoc.toFixed(2)}`
    }
  ];

  return (
    <PricingSection
      title="Assumptions Overview"
      subtitle="Read-only view of current delivery and cost assumptions"
      actions={(
        <button
          onClick={onEdit}
          className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
        >
          Edit Assumptions
        </button>
      )}
      bodyClassName="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SummaryTable title="Volume & Documents" rows={volumeRows} />
        <SummaryTable title="Quality & Review" rows={qualityRows} />
        <SummaryTable title="Unit Costs & Support" rows={costRows} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryTable title="Build Effort Allocation" rows={buildRows} />
        <SummaryTable title="Benchmark References" rows={benchmarkRows} />
      </div>
    </PricingSection>
  );
};

export default AssumptionsSummary;
