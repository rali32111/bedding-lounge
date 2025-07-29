/**
 * Currency utilities for Indian Rupee formatting and calculations
 */

export const CURRENCY_CONFIG = {
  symbol: 'PKR',
  code: 'PKR',
  decimals: 2,
  taxRate: 0.0, // GST/tax completely removed
  freeShippingThreshold: 1000,
  shippingCost: 150,
};

/**
 * Format amount as Pakistani Rupee currency
 */
export const formatCurrency = (amount: number): string => {
  return `${CURRENCY_CONFIG.symbol} ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: CURRENCY_CONFIG.decimals,
    maximumFractionDigits: CURRENCY_CONFIG.decimals
  })}`;
};

/**
 * Format amount in Pakistani numbering system
 */
export const formatPakistaniCurrency = (amount: number): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `PKR ${formatter.format(amount)}`;
};

/**
 * Calculate tax (completely removed)
 */
export const calculateTax = (amount: number): number => {
  return 0; // GST/tax calculations completely removed
};

/**
 * Calculate shipping cost based on order value
 */
export const calculateShipping = (orderValue: number): number => {
  return orderValue >= CURRENCY_CONFIG.freeShippingThreshold ? 0 : CURRENCY_CONFIG.shippingCost;
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  return parseFloat(currencyString.replace(/Rs\.\s?|,/g, ''));
};

/**
 * Validate currency amount
 */
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount >= 0 && Number.isFinite(amount);
};

/**
 * Get free shipping message
 */
export const getFreeShippingMessage = (currentTotal: number): string => {
  const remaining = CURRENCY_CONFIG.freeShippingThreshold - currentTotal;
  if (remaining <= 0) {
    return '🎉 You qualify for free shipping!';
  }
  return `📦 Add ${formatCurrency(remaining)} more for free shipping!`;
};