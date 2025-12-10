import React from 'react';
import PricingSection from './shared/PricingSection';

/**
 * BuildCapexTable - Displays the Build CAPEX breakdown table
 *
 * @param {Object} model - The computed pricing model object
 * @param {Function} formatGBP - Currency formatting function
 * @param {React.Component} CostPriceRow - Row component for displaying cost/price items
 */
const BuildCapexTable = ({ model, CostPriceRow }) => (
  <PricingSection
    title="Build CAPEX Breakdown"
    subtitle="Custom platform engineering effort and pass-through costs"
  >
    <table>
      <thead>
        <tr>
          <th className="text-left">Role</th>
          <th className="text-left">Calculation</th>
          <th className="text-right">Cost</th>
          <th className="text-center">Margin</th>
          <th className="text-right">Price</th>
        </tr>
      </thead>
      <tbody>
        {model.buildLineItems.map(item => (
          <CostPriceRow
            key={item.id}
            label={item.description}
            calculation={`${typeof item.quantity === 'number' ? item.quantity.toLocaleString() : item.quantity} ${item.unit} × £${item.unitRate}`}
            cost={item.cost}
            margin={`${(item.margin * 100).toFixed(0)}%`}
            price={item.price}
            note={item.notes}
          />
        ))}
        <CostPriceRow
          label="Total Build CAPEX"
          calculation="One-time platform cost"
          cost={model.buildTotalCost}
          margin="—"
          price={model.buildTotalPrice}
          isTotal
        />
      </tbody>
    </table>
  </PricingSection>
);

export default BuildCapexTable;
