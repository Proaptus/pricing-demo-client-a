import React from 'react';
import PricingSection from './shared/PricingSection';

/**
 * IngestionCapexTable - Displays the Ingestion CAPEX breakdown table
 *
 * @param {Object} model - The computed pricing model object
 * @param {Object} inputs - User input parameters
 * @param {Function} formatGBP - Currency formatting function
 * @param {React.Component} CostPriceRow - Row component for displaying cost/price items
 */
const IngestionCapexTable = ({ model, inputs, CostPriceRow }) => (
  <PricingSection
    title="Ingestion CAPEX Breakdown"
    subtitle={`Calculated for ${inputs.nSites.toLocaleString()} sites`}
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
        {model.ingestionLineItems.map(item => (
          <CostPriceRow
            key={item.id}
            label={item.description}
            calculation={`${typeof item.quantity === 'number' ? item.quantity.toLocaleString() : item.quantity} ${item.unit} × £${item.unitRate}${item.unit === 'M tokens' ? ' per 1M tokens' : ''}`}
            cost={item.cost}
            margin={`${(item.margin * 100).toFixed(0)}%`}
            price={item.price}
            note={item.notes}
          />
        ))}
        <CostPriceRow
          label="Total Ingestion CAPEX"
          calculation="One-time platform ingestion investment"
          cost={model.ingestionTotalCost}
          margin="—"
          price={model.ingestionTotalPrice}
          isTotal
        />
      </tbody>
    </table>
  </PricingSection>
);

export default IngestionCapexTable;
