import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer } from '../types/crm';
import { Invoice } from '../types/invoice';

const invoicesKey = (userId: string) => `@invoices_${userId}`;
const customersKey = (userId: string) => `@customers_${userId}`;

const sortByNewest = <T extends { created_at?: string }>(items: T[]) =>
    [...items].sort(
        (a, b) =>
            new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );

export const getCustomers = async (userId: string): Promise<Customer[]> => {
    const stored = await AsyncStorage.getItem(customersKey(userId));
    const customers: Customer[] = stored ? JSON.parse(stored) : [];
    return sortByNewest(customers);
};

export const saveCustomers = async (userId: string, customers: Customer[]) => {
    await AsyncStorage.setItem(customersKey(userId), JSON.stringify(sortByNewest(customers)));
};

export const getInvoices = async (userId: string): Promise<Invoice[]> => {
    const stored = await AsyncStorage.getItem(invoicesKey(userId));
    const invoices: Invoice[] = stored ? JSON.parse(stored) : [];
    return sortByNewest(invoices);
};

export const saveInvoices = async (userId: string, invoices: Invoice[]) => {
    await AsyncStorage.setItem(invoicesKey(userId), JSON.stringify(sortByNewest(invoices)));
};

export const updateInvoice = async (
    userId: string,
    invoiceId: string,
    updater: (invoice: Invoice) => Invoice
) => {
    const invoices = await getInvoices(userId);
    const nextInvoices = invoices.map((invoice) =>
        invoice.id === invoiceId
            ? {
                ...updater(invoice),
                updated_at: new Date().toISOString(),
                sync_status: 'pending_sync' as const,
            }
            : invoice
    );
    await saveInvoices(userId, nextInvoices);
    return nextInvoices.find((invoice) => invoice.id === invoiceId) ?? null;
};

export const updateCustomer = async (
    userId: string,
    customerId: string,
    updater: (customer: Customer) => Customer
) => {
    const customers = await getCustomers(userId);
    const nextCustomers = customers.map((customer) =>
        customer.id === customerId
            ? {
                ...updater(customer),
                updated_at: new Date().toISOString(),
            }
            : customer
    );
    await saveCustomers(userId, nextCustomers);
    return nextCustomers.find((customer) => customer.id === customerId) ?? null;
};

export const getBusinessSnapshot = async (userId: string) => {
    const [customers, invoices] = await Promise.all([
        getCustomers(userId),
        getInvoices(userId),
    ]);

    return {
        customers,
        invoices,
    };
};
