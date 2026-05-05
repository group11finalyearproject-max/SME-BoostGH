import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Share } from 'react-native';
import { getBusinessSnapshot } from './businessData';
import { getStoredProfile } from './profile';
import { loadDrafts } from './drafts';

const backupMetaKey = (userId: string) => `@backup_meta_${userId}`;

export interface BackupMeta {
    lastBackupAt?: string;
    lastBackupUri?: string;
}

export const getBackupMeta = async (userId: string): Promise<BackupMeta> => {
    const stored = await AsyncStorage.getItem(backupMetaKey(userId));
    return stored ? JSON.parse(stored) : {};
};

const setBackupMeta = async (userId: string, meta: BackupMeta) => {
    await AsyncStorage.setItem(backupMetaKey(userId), JSON.stringify(meta));
};

export const buildBackupPayload = async (userId: string) => {
    const [profile, drafts, snapshot] = await Promise.all([
        getStoredProfile(userId),
        loadDrafts(),
        getBusinessSnapshot(userId),
    ]);

    return {
        exportedAt: new Date().toISOString(),
        userId,
        profile,
        customers: snapshot.customers,
        invoices: snapshot.invoices,
        drafts,
    };
};

export const createBackupFile = async (userId: string) => {
    if (!FileSystem.cacheDirectory) {
        throw new Error('Backup storage is not available on this device.');
    }

    const payload = await buildBackupPayload(userId);
    const uri = `${FileSystem.cacheDirectory}sme-boost-backup-${Date.now()}.json`;

    await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
    });

    await setBackupMeta(userId, {
        lastBackupAt: payload.exportedAt,
        lastBackupUri: uri,
    });

    return { uri, exportedAt: payload.exportedAt };
};

export const shareBackupFile = async (userId: string) => {
    const { uri, exportedAt } = await createBackupFile(userId);

    await Share.share({
        title: 'SME Boost GH Backup',
        message: `SME Boost GH backup created on ${new Date(exportedAt).toLocaleString()}`,
        url: uri,
    });

    return { uri, exportedAt };
};

export const shareBackupSummary = async (userId: string) => {
    const payload = await buildBackupPayload(userId);

    await Share.share({
        title: 'SME Boost GH Business Summary',
        message: [
            'SME Boost GH Business Summary',
            `Exported: ${new Date(payload.exportedAt).toLocaleString()}`,
            `Customers: ${payload.customers.length}`,
            `Invoices: ${payload.invoices.length}`,
            `Drafts: ${payload.drafts.length}`,
        ].join('\n'),
    });
};
