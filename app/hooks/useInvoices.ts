import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Invoice, InvoiceStatus } from '../types/invoice';
import { useAuth } from '../contexts/AuthContext';

export function useInvoices() {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInvoices = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const stored = await AsyncStorage.getItem(`@invoices_${user.id}`);
            if (stored) {
                const parsed: Invoice[] = JSON.parse(stored);
                parsed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setInvoices(parsed);
            } else {
                setInvoices([]);
            }
        } catch (err: any) {
            console.error('Error fetching invoices:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
        if (!user) return;
        try {
            const updated = invoices.map(inv => inv.id === id ? { ...inv, status } : inv);
            await AsyncStorage.setItem(`@invoices_${user.id}`, JSON.stringify(updated));
            setInvoices(updated);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    return {
        invoices,
        loading,
        error,
        fetchInvoices,
        updateInvoiceStatus,
    };
}
