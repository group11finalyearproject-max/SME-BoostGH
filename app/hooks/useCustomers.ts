import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer } from '../types/crm';
import { useAuth } from '../contexts/AuthContext';

export function useCustomers() {
    const { user } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomers = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const stored = await AsyncStorage.getItem(`@customers_${user.id}`);
            if (stored) {
                const parsed: Customer[] = JSON.parse(stored);
                parsed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setCustomers(parsed);
            } else {
                setCustomers([]);
            }
        } catch (err: any) {
            console.error('Error fetching customers:', err);
            setError(err.message || 'Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at'>) => {
        if (!user) return;
        setLoading(true);
        try {
            const newCustomer: Customer = {
                ...customerData,
                id: Math.random().toString(36).substring(2, 9),
                user_id: user.id,
                created_at: new Date().toISOString()
            };
            const updated = [newCustomer, ...customers];
            await AsyncStorage.setItem(`@customers_${user.id}`, JSON.stringify(updated));
            setCustomers(updated);
            return newCustomer;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        customers,
        loading,
        error,
        fetchCustomers,
        addCustomer,
    };
}
