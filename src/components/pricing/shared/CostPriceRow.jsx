import React from 'react';
import formatGBP from './formatGBP';

/**
 * CostPriceRow - Displays a row in the cost-to-price breakdown table
 * @param {Object} props
 * @param {string} props.label - Row label/description
 * @param {string} props.calculation - Formula or calculation description
 * @param {number} props.cost - Cost amount
 * @param {string} props.margin - Margin percentage or description
 * @param {number} props.price - Price amount
 * @param {string} props.note - Optional note to display below the row
 * @param {boolean} props.isSubtotal - Whether this is a subtotal row
 * @param {boolean} props.isTotal - Whether this is a total row
 */
const CostPriceRow = ({ label, calculation, cost, margin, price, note, isSubtotal, isTotal }) => (
  <>
    <tr className={`transition-colors ${
      isTotal
        ? 'bg-slate-800 text-white font-semibold border-t border-slate-700'
        : isSubtotal
          ? 'bg-slate-100 font-semibold border-t border-slate-200'
          : 'border-b border-slate-200'
    }`}>
      <td className={`py-3 px-4 font-medium ${isTotal ? 'text-white' : 'text-slate-800'}`}>
        {label}
      </td>
      <td className={`py-3 px-4 text-sm font-mono ${isTotal ? 'text-slate-200' : 'text-slate-600'}`}>
        {calculation}
      </td>
      <td className={`py-3 px-4 text-right font-mono tabular-nums ${isTotal ? 'text-slate-100 font-semibold' : 'text-slate-700'}`}>
        {formatGBP(cost, 2)}
      </td>
      <td className={`py-3 px-4 text-center text-sm font-semibold ${isTotal ? 'text-slate-200' : 'text-slate-600'}`}>
        {margin}
      </td>
      <td className={`py-3 px-4 text-right font-mono tabular-nums font-semibold ${isTotal ? 'text-white text-lg' : 'text-slate-900'}`}>
        {formatGBP(price, 2)}
      </td>
    </tr>
    {note && (
      <tr className={`border-b border-slate-200 ${isTotal || isSubtotal ? 'bg-slate-50' : 'bg-slate-50'}`}>
        <td colSpan="5" className="py-2 px-4 pl-8 text-xs text-slate-600 italic">
          {note}
        </td>
      </tr>
    )}
  </>
);

export default CostPriceRow;
