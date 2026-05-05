import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppNotification, Invoice } from '../types';
import { getInvoices, saveInvoices } from './businessData';

const notificationsKey = (userId: string) => `@notifications_${userId}`;
const REMINDER_LOOKAHEAD_DAYS = 3;

const readAllNotifications = async (userId: string): Promise<AppNotification[]> => {
    const stored = await AsyncStorage.getItem(notificationsKey(userId));
    return stored ? JSON.parse(stored) : [];
};

const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate());

const getDaysUntil = (isoDate?: string) => {
    if (!isoDate) return null;

    const now = startOfDay(new Date());
    const target = startOfDay(new Date(isoDate));
    const diff = target.getTime() - now.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
};

const createNotification = (
    userId: string,
    invoice: Invoice,
    type: AppNotification['type'],
    title: string,
    description: string
): AppNotification => ({
    id: `${type}_${invoice.id}`,
    userId,
    type,
    title,
    description,
    createdAt: new Date().toISOString(),
    actionHref: `/invoices/${invoice.id}`,
    invoiceId: invoice.id,
    metadata: {
        status: invoice.status,
        amount: invoice.amount,
    },
});

export const loadNotifications = async (userId: string): Promise<AppNotification[]> => {
    const notifications = await readAllNotifications(userId);

    return notifications
        .filter((notification) => !notification.dismissedAt)
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
};

const saveNotifications = async (userId: string, notifications: AppNotification[]) => {
    await AsyncStorage.setItem(notificationsKey(userId), JSON.stringify(notifications));
};

export const syncInvoiceNotifications = async (userId: string) => {
    const [invoices, existing] = await Promise.all([
        getInvoices(userId),
        readAllNotifications(userId),
    ]);

    const existingMap = new Map(existing.map((notification) => [notification.id, notification]));
    const generated: AppNotification[] = [];

    invoices.forEach((invoice) => {
        if (invoice.status === 'paid') return;

        const daysUntilDue = getDaysUntil(invoice.due_date);
        if (invoice.status === 'overdue' || (typeof daysUntilDue === 'number' && daysUntilDue < 0)) {
            generated.push(
                createNotification(
                    userId,
                    invoice,
                    'invoice_overdue',
                    'Invoice needs follow-up',
                    `${invoice.customer_name} has an overdue invoice worth GHS ${invoice.amount.toFixed(2)}.`
                )
            );
            return;
        }

        if (
            typeof daysUntilDue === 'number' &&
            daysUntilDue >= 0 &&
            daysUntilDue <= REMINDER_LOOKAHEAD_DAYS
        ) {
            generated.push(
                createNotification(
                    userId,
                    invoice,
                    'invoice_due_soon',
                    'Invoice due soon',
                    `${invoice.customer_name}'s invoice is due in ${daysUntilDue === 0 ? 'today' : `${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`}.`
                )
            );
        }
    });

    const merged = generated.map((notification) => {
        const existingNotification = existingMap.get(notification.id);
        return existingNotification
            ? {
                ...notification,
                createdAt: existingNotification.createdAt,
                readAt: existingNotification.readAt,
                dismissedAt: existingNotification.dismissedAt,
            }
            : notification;
    });

    existing
        .filter((notification) => notification.dismissedAt)
        .forEach((notification) => {
            if (!merged.find((item) => item.id === notification.id)) {
                merged.push(notification);
            }
        });

    await saveNotifications(userId, merged);

    const overdueIds = new Set(
        generated
            .filter((notification) => notification.type === 'invoice_overdue')
            .map((notification) => notification.invoiceId)
    );

    const dueSoonIds = new Set(
        generated
            .filter((notification) => notification.type === 'invoice_due_soon')
            .map((notification) => notification.invoiceId)
    );

    const nextInvoices = invoices.map((invoice) => {
        if (overdueIds.has(invoice.id) || dueSoonIds.has(invoice.id)) {
            return {
                ...invoice,
                reminder_count: Math.max(invoice.reminder_count ?? 0, 1),
                last_reminder_at: new Date().toISOString(),
            };
        }

        return invoice;
    });

    await saveInvoices(userId, nextInvoices);
    return merged;
};

export const markNotificationRead = async (userId: string, id: string) => {
    const notifications = await readAllNotifications(userId);
    const nextNotifications = notifications.map((notification) =>
        notification.id === id && !notification.readAt
            ? { ...notification, readAt: new Date().toISOString() }
            : notification
    );
    await saveNotifications(userId, nextNotifications);
};

export const markAllNotificationsRead = async (userId: string) => {
    const notifications = await readAllNotifications(userId);
    const timestamp = new Date().toISOString();
    await saveNotifications(
        userId,
        notifications.map((notification) => ({
            ...notification,
            readAt: notification.readAt ?? timestamp,
        }))
    );
};

export const dismissNotification = async (userId: string, id: string) => {
    const notifications = await readAllNotifications(userId);
    const nextNotifications = notifications.map((notification) =>
        notification.id === id
            ? { ...notification, dismissedAt: new Date().toISOString() }
            : notification
    );
    await AsyncStorage.setItem(notificationsKey(userId), JSON.stringify(nextNotifications));
};

export const getUnreadNotificationCount = async (userId: string) => {
    const notifications = await loadNotifications(userId);
    return notifications.filter((notification) => !notification.readAt).length;
};
