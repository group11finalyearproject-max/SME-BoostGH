// Using Tailwind/NativeWind class merging (cn utility equivalent if implemented later)
// Common formatters used across the app

/**
 * Formats a given number into a Ghanaian Cedi (GH₵) currency representation.
 * @param amount - The numerical amount to format.
 * @returns string formatted currency.
 */
export const formatCurrency = (amount: number): string => {
    return `GH₵ ${amount.toFixed(2)}`;
};

/**
 * Formats an ISO Date string into a localized short date.
 * @param isoString - Standard ISO date time
 * @returns string properly formatted date.
 */
export const formatDate = (isoString?: string): string => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
