/**
 * Utility functions for the Bedding Lounge e-commerce website
 */

/**
 * Format currency amount with Pakistani Rupee symbol
 * @param amount - The numeric amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string with Rs. prefix (PKR)
 */
export const formatCurrency = (amount: number, decimals: number = 2): string => {
  return `Rs. ${amount.toFixed(decimals)}`;
};

/**
 * Parse currency string to numeric value
 * @param currencyString - String with Rs. prefix
 * @returns Numeric value
 */
export const parseCurrency = (currencyString: string): number => {
  return parseFloat(currencyString.replace('Rs. ', ''));
};

/**
 * Validate currency amount
 * @param amount - Amount to validate
 * @returns Boolean indicating if amount is valid
 */
export const isValidCurrencyAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount >= 0 && Number.isFinite(amount);
};

/**
 * Calculate tax amount (disabled)
 * @param subtotal - Subtotal amount
 * @returns Tax amount
 */
export const calculateTax = (subtotal: number): number => {
  return 0; // Tax calculations removed
};

/**
 * Calculate shipping cost based on order value
 * @param orderValue - Total order value
 * @returns Shipping cost (free for orders over Rs. 1000 PKR)
 */
export const calculateShipping = (orderValue: number): number => {
  return orderValue >= 1000 ? 0 : 150; // Free shipping over Rs. 1000, otherwise Rs. 150
};

/**
 * Format Pakistani phone number
 * @param phoneNumber - Raw phone number
 * @returns Formatted phone number with +92 prefix
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.startsWith('92')) {
    return `+${cleaned}`;
  }
  return `+92${cleaned}`;
};