export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface TaxBreakdown {
    nhil: number;       // 2.5%
    getfund: number;    // 2.5%
    covid: number;      // 1.0%
    vat: number;        // 15.0%
    totalTax: number;   // Sum of above
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
}

export interface Invoice {
    id: string; // Unique Invoice number
    user_id?: string; // The owner
    customer_id?: string; // Customer reference
    customer_name: string; // Denormalized name for easier listing
    subtotal?: number; // Pre-tax amount
    taxBreakdown?: TaxBreakdown; // Detailed GRA levies
    amount: number; // Final Total amount
    description?: string; // General description
    items?: InvoiceItem[]; // Line items for scalable invoices
    status: InvoiceStatus;
    due_date?: string; // ISO DateTime
    created_at: string; // ISO DateTime
    updated_at?: string; // ISO DateTime
    share_count?: number;
    last_shared_at?: string;
    last_shared_channel?: string;
    reminder_count?: number;
    last_reminder_at?: string;
    reminder_dismissed_at?: string;
    payment_reference?: string;
    sync_status?: 'local' | 'pending_sync' | 'synced';
    last_synced_at?: string;
}
