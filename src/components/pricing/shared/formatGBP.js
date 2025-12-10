/**
 * Formats a number as GBP currency with proper locale formatting
 * @param {number} n - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted currency string with £ symbol
 */
const formatGBP = (n, decimals = 0) => {
  if (!isFinite(n)) n = 0;
  return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export default formatGBP;
