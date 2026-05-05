import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';

export interface BusinessMetrics {
    total_customers: number;
    total_invoices: number;
    overdue_invoices: number;
    overdue_amount: number;
    revenue: number;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Iterates through the local Offline First AsyncStorage database and strictly counts aggregate metrics
 * without lifting any pure PII/Names.
 */
export const getBusinessMetrics = async (userId: string): Promise<BusinessMetrics> => {
    let metrics: BusinessMetrics = {
        total_customers: 0,
        total_invoices: 0,
        overdue_invoices: 0,
        overdue_amount: 0,
        revenue: 0
    };

    try {
        const custStored = await AsyncStorage.getItem(`@customers_${userId}`);
        const customers = custStored ? JSON.parse(custStored) : [];
        metrics.total_customers = customers.length;

        const invStored = await AsyncStorage.getItem(`@invoices_${userId}`);
        const invoices = invStored ? JSON.parse(invStored) : [];
        metrics.total_invoices = invoices.length;

        invoices.forEach((inv: any) => {
            if (inv.status === 'paid') {
                metrics.revenue += inv.amount || 0;
            } else if (inv.status === 'overdue') {
                metrics.overdue_invoices += 1;
                metrics.overdue_amount += inv.amount || 0;
            }
        });
    } catch (error) {
        console.error("Failed to aggregate AI business metrics", error);
    }

    return metrics;
};

/**
 * Sends the user's chat message + optional local business context safely to the AI Router.
 */
export const sendSalesChat = async (messages: any[], businessMetrics?: BusinessMetrics): Promise<any> => {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            messages,
            business_metrics: businessMetrics
        })
    });

    if (!response.ok) {
        throw new Error('Failed to generate sales advice');
    }

    return await response.json();
};
