import { Customer } from '../types/crm';
import { Invoice } from '../types/invoice';
import { getBusinessSnapshot } from './businessData';

export type ReportRange = '30d' | '90d' | 'all';

export interface MonthlyRevenuePoint {
    label: string;
    amount: number;
}

export interface StatusBreakdownItem {
    status: Invoice['status'];
    count: number;
    amount: number;
}

export interface BusinessReport {
    range: ReportRange;
    invoiceCount: number;
    customerCount: number;
    paidRevenue: number;
    pendingAmount: number;
    overdueAmount: number;
    paidCount: number;
    overdueCount: number;
    averageInvoiceValue: number;
    recentCustomerCount: number;
    collectionRate: number;
    statusBreakdown: StatusBreakdownItem[];
    monthlyRevenue: MonthlyRevenuePoint[];
}

const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' });

const getRangeStart = (range: ReportRange) => {
    if (range === 'all') return null;

    const date = new Date();
    date.setDate(date.getDate() - (range === '30d' ? 30 : 90));
    return date;
};

const filterByRange = <T extends { created_at?: string }>(items: T[], range: ReportRange) => {
    const start = getRangeStart(range);
    if (!start) return items;

    return items.filter((item) => {
        if (!item.created_at) return false;
        return new Date(item.created_at).getTime() >= start.getTime();
    });
};

const sumAmounts = (invoices: Invoice[]) =>
    invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

const buildMonthlyRevenue = (invoices: Invoice[]) => {
    const now = new Date();
    const buckets = Array.from({ length: 4 }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1);
        return {
            key: `${date.getFullYear()}-${date.getMonth()}`,
            label: monthFormatter.format(date),
            amount: 0,
        };
    });

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    invoices
        .filter((invoice) => invoice.status === 'paid')
        .forEach((invoice) => {
            const createdAt = new Date(invoice.created_at);
            const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
            const bucket = bucketMap.get(key);
            if (bucket) {
                bucket.amount += invoice.amount || 0;
            }
        });

    return buckets;
};

const getRecentCustomers = (customers: Customer[], range: ReportRange) => filterByRange(customers, range).length;

export const buildBusinessReport = (
    customers: Customer[],
    invoices: Invoice[],
    range: ReportRange
): BusinessReport => {
    const filteredInvoices = filterByRange(invoices, range);
    const paidInvoices = filteredInvoices.filter((invoice) => invoice.status === 'paid');
    const pendingInvoices = filteredInvoices.filter((invoice) => invoice.status === 'pending');
    const overdueInvoices = filteredInvoices.filter((invoice) => invoice.status === 'overdue');

    const totalInvoiced = sumAmounts(filteredInvoices);
    const paidRevenue = sumAmounts(paidInvoices);
    const pendingAmount = sumAmounts(pendingInvoices);
    const overdueAmount = sumAmounts(overdueInvoices);

    return {
        range,
        invoiceCount: filteredInvoices.length,
        customerCount: customers.length,
        paidRevenue,
        pendingAmount,
        overdueAmount,
        paidCount: paidInvoices.length,
        overdueCount: overdueInvoices.length,
        averageInvoiceValue: filteredInvoices.length
            ? totalInvoiced / filteredInvoices.length
            : 0,
        recentCustomerCount: getRecentCustomers(customers, range),
        collectionRate: totalInvoiced ? paidRevenue / totalInvoiced : 0,
        statusBreakdown: [
            { status: 'paid', count: paidInvoices.length, amount: paidRevenue },
            { status: 'pending', count: pendingInvoices.length, amount: pendingAmount },
            { status: 'overdue', count: overdueInvoices.length, amount: overdueAmount },
        ],
        monthlyRevenue: buildMonthlyRevenue(invoices),
    };
};

export const getBusinessReport = async (userId: string, range: ReportRange) => {
    const { customers, invoices } = await getBusinessSnapshot(userId);
    return buildBusinessReport(customers, invoices, range);
};
