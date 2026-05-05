import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildBackupPayload } from './backup';
import { getCustomers, getInvoices, saveCustomers, saveInvoices } from './businessData';

const syncMetaKey = (userId: string) => `@sync_meta_${userId}`;

export interface SyncMeta {
    lastSyncedAt?: string;
    lastSnapshotInvoiceCount?: number;
    lastSnapshotCustomerCount?: number;
}

export const SyncService = {
    triggerManualSync: async (userId: string) => {
        const [customers, invoices] = await Promise.all([
            getCustomers(userId),
            getInvoices(userId),
        ]);

        const timestamp = new Date().toISOString();

        await saveCustomers(userId, customers);
        await saveInvoices(
            userId,
            invoices.map((invoice) => ({
                ...invoice,
                sync_status: 'synced',
                last_synced_at: timestamp,
            }))
        );

        await buildBackupPayload(userId);

        const meta: SyncMeta = {
            lastSyncedAt: timestamp,
            lastSnapshotCustomerCount: customers.length,
            lastSnapshotInvoiceCount: invoices.length,
        };

        await AsyncStorage.setItem(syncMetaKey(userId), JSON.stringify(meta));
        console.log(`[SyncService] Prepared local sync snapshot for user ${userId}`);
        return meta;
    },
    getSyncMeta: async (userId: string): Promise<SyncMeta> => {
        const stored = await AsyncStorage.getItem(syncMetaKey(userId));
        return stored ? JSON.parse(stored) : {};
    },
    scheduleBackgroundSync: async () => {
        console.log(`[SyncService] Background sync is not configured in this offline-first build`);
    }
};
