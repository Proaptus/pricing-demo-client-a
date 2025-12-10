import React from 'react';
import PricingSection from './shared/PricingSection';

/**
 * MonthlyOpexTable - Displays the Monthly OPEX breakdown table
 *
 * @param {Object} model - The computed pricing model object
 * @param {Function} formatGBP - Currency formatting function
 * @param {React.Component} CostPriceRow - Row component for displaying cost/price items
 */
const MonthlyOpexTable = ({ model, CostPriceRow }) => (
  <PricingSection
    title="Monthly OPEX Breakdown"
    subtitle="Recurring operational services and infrastructure"
  >
    <table>
      <thead>
        <tr>
          <th className="text-left">Line Item</th>
          <th className="text-left">Calculation</th>
          <th className="text-right">Cost</th>
          <th className="text-center">Margin</th>
          <th className="text-right">Price</th>
        </tr>
      </thead>
      <tbody>
        {model.opexLineItems.map(item => (
          <CostPriceRow
            key={item.id}
            label={item.description}
            calculation={`${typeof item.quantity === 'number' ? item.quantity.toLocaleString() : item.quantity} ${item.unit} × £${item.unitRate}`}
            cost={item.cost}
            margin={item.margin === 0 ? '—' : `${(item.margin * 100).toFixed(0)}%`}
            price={item.price}
            note={item.notes}
          />
        ))}

        {/* Subtotals */}
        <tr className="border-t border-gray-200">
          <td colSpan="5" className="h-2"></td>
        </tr>
        <CostPriceRow
          label="Total Client Direct Costs (Azure/3rd Party)"
          calculation="Payable directly to providers"
          cost={model.opexClientDirectCost}
          margin="0%"
          price={model.opexClientDirectPrice}
          isSubtotal
        />
        <CostPriceRow
          label="Total Proaptus Managed Services"
          calculation="Billed by Proaptus"
          cost={model.opexProaptusCost}
          margin="—"
          price={model.opexProaptusPrice}
          isSubtotal
        />

        {/* Grand Total */}
        <CostPriceRow
          label="Total Monthly OPEX"
          calculation="Recurring operational cost"
          cost={model.opexTotalCost}
          margin="—"
          price={model.opexTotalPrice}
          isTotal
        />
      </tbody>
    </table>
    <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-200">
      <h4 className="font-semibold mb-2">Payment Responsibility:</h4>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Client Direct Costs:</strong> Azure Services, Hosting, Storage, and API usage are payable directly to the provider (e.g., Microsoft Azure, OpenAI) by Cornerstone. These are shown at cost (0% margin).</li>
        <li><strong>Proaptus Billed Services:</strong> Support & Maintenance and Penetration Testing are billed by Proaptus and include standard service margins.</li>
      </ul>
    </div>
  </PricingSection>
);

export default MonthlyOpexTable;
