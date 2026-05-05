import { useState, useCallback } from 'react';
import { SyncService } from '../services/sync';

export function useOfflineSync(userId?: string) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

    const triggerSync = useCallback(async () => {
        if (!userId) return;
        setIsSyncing(true);
        try {
            const meta = await SyncService.triggerManualSync(userId);
            setLastSyncedAt(meta.lastSyncedAt ?? new Date().toISOString());
        } catch (error) {
            console.error('Sync failed', error);
        } finally {
            setIsSyncing(false);
        }
    }, [userId]);

    return {
        isSyncing,
        lastSyncedAt,
        triggerSync
    };
}
