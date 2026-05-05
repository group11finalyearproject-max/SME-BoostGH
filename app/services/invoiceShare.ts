import { Share } from 'react-native';
import { Invoice } from '../types/invoice';
import { updateInvoice } from './businessData';

const formatMoney = (amount: number) =>
    `GHS ${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatDueDate = (dueDate?: string) =>
    dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set';

export const formatInvoiceShareMessage = (invoice: Invoice) => {
    const lines = [
        `Invoice ${invoice.id}`,
        `Customer: ${invoice.customer_name}`,
        `Amount due: ${formatMoney(invoice.amount)}`,
        `Status: ${invoice.status}`,
        `Due date: ${formatDueDate(invoice.due_date)}`,
    ];

    if (invoice.description?.trim()) {
        lines.push(`Description: ${invoice.description.trim()}`);
    }

    if (invoice.taxBreakdown) {
        lines.push(`Tax included: ${formatMoney(invoice.taxBreakdown.totalTax)}`);
    }

    lines.push('Thank you for doing business with SME Boost GH.');

    return lines.join('\n');
};

export const shareInvoice = async (
    userId: string,
    invoice: Invoice,
    channel: 'general' | 'email' | 'whatsapp' = 'general'
) => {
    const baseMessage = formatInvoiceShareMessage(invoice);
    const message =
        channel === 'email'
            ? `Hello,\n\nPlease find your invoice details below.\n\n${baseMessage}`
            : channel === 'whatsapp'
                ? `Hello, here are your invoice details:\n\n${baseMessage}`
                : baseMessage;

    await Share.share({
        title: `Invoice ${invoice.id}`,
        message,
    });

    return updateInvoice(userId, invoice.id, (current) => ({
        ...current,
        share_count: (current.share_count ?? 0) + 1,
        last_shared_at: new Date().toISOString(),
        last_shared_channel: channel,
    }));
};
