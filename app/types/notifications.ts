export type AppNotificationType =
    | 'invoice_due_soon'
    | 'invoice_overdue'
    | 'backup_ready'
    | 'sync_completed'
    | 'help_tip';

export interface AppNotification {
    id: string;
    userId: string;
    type: AppNotificationType;
    title: string;
    description: string;
    createdAt: string;
    readAt?: string;
    dismissedAt?: string;
    actionHref?: string;
    invoiceId?: string;
    metadata?: Record<string, string | number | boolean | undefined>;
}
