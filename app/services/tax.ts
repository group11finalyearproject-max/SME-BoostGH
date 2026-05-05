import { TaxBreakdown } from '../types/invoice';

/**
 * Standard Ghana Revenue Authority (GRA) Tax Rates
 * These defaults represent the standard VAT scheme.
 */
export const GRA_TAX_RATES = {
    NHIL: 0.025,    // National Health Insurance Levy (2.5%)
    GETFUND: 0.025, // GETFund Levy (2.5%)
    COVID: 0.01,    // COVID-19 Health Recovery Levy (1%)
    VAT: 0.15       // Standard VAT (15%) - Applied sequentially
};

/**
 * calculateGhanaTaxes
 * 
 * Computes standard GRA taxes on a given subtotal.
 * NHIL, GETFund, and COVID levies are calculated flat on the subtotal.
 * VAT is calculated on the (Subtotal + All previously calculated Levies).
 * 
 * @param subtotal - The pre-tax invoice amount.
 * @returns TaxBreakdown object containing exact calculated values.
 */
export const calculateGhanaTaxes = (subtotal: number): TaxBreakdown => {
    // 1. Calculate base levies
    const nhil = subtotal * GRA_TAX_RATES.NHIL;
    const getfund = subtotal * GRA_TAX_RATES.GETFUND;
    const covid = subtotal * GRA_TAX_RATES.COVID;
    
    // 2. Calculate VAT sequential base
    const taxableValueForVat = subtotal + nhil + getfund + covid;
    const vat = taxableValueForVat * GRA_TAX_RATES.VAT;

    const totalTax = nhil + getfund + covid + vat;

    return {
        nhil: Number(nhil.toFixed(2)),
        getfund: Number(getfund.toFixed(2)),
        covid: Number(covid.toFixed(2)),
        vat: Number(vat.toFixed(2)),
        totalTax: Number(totalTax.toFixed(2))
    };
};
