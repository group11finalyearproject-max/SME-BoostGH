import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { CloudUpload, Download, FolderArchive, RefreshCw, Share2 } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { AppScreenHeader } from '../components/ui/AppScreenHeader';
import { AppStateCard } from '../components/ui/AppStateCard';
import { createBackupFile, getBackupMeta, shareBackupFile, shareBackupSummary } from '../services/backup';
import { Analytics } from '../services/analytics';
import { SyncService } from '../services/sync';

export default function BackupSyncScreen() {
    const { user } = useAuth();
    const { isSyncing, lastSyncedAt, triggerSync } = useOfflineSync(user?.id);
    const [backupAt, setBackupAt] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingBackup, setLoadingBackup] = useState(false);

    const refreshMeta = useCallback(async () => {
        if (!user?.id) return;

        const [backupMeta, syncMeta] = await Promise.all([
            getBackupMeta(user.id),
            SyncService.getSyncMeta(user.id),
        ]);

        setBackupAt(backupMeta.lastBackupAt ?? null);
        if (!message && syncMeta.lastSyncedAt) {
            setMessage(`Last local sync snapshot: ${new Date(syncMeta.lastSyncedAt).toLocaleString()}`);
        }
    }, [message, user?.id]);

    useFocusEffect(
        useCallback(() => {
            void refreshMeta();
        }, [refreshMeta])
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <AppScreenHeader
                title="Backup & Sync"
                subtitle="Protect your local business records with backup exports and sync snapshots."
                onBack={() => router.back()}
            />

            <ScrollView className="flex-1">
                <View className="gap-4 px-5 pb-12 pt-6">
                    {message ? (
                        <AppStateCard
                            title="Backup center updated"
                            description={message}
                            tone="success"
                        />
                    ) : null}

                    {errorMessage ? (
                        <AppStateCard
                            title="Backup center needs attention"
                            description={errorMessage}
                            tone="error"
                        />
                    ) : null}

                    <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <Text className="text-base font-bold text-gray-900 dark:text-white">
                            Current safety status
                        </Text>
                        <View className="mt-4 gap-3">
                            <View className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/50">
                                <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Last backup export
                                </Text>
                                <Text className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                                    {backupAt ? new Date(backupAt).toLocaleString() : 'No backup exported yet'}
                                </Text>
                            </View>
                            <View className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/50">
                                <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Last local sync snapshot
                                </Text>
                                <Text className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                                    {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Not synced in this session'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        disabled={isSyncing}
                        onPress={async () => {
                            try {
                                setMessage('');
                                setErrorMessage('');
                                await triggerSync();
                                setMessage('A fresh local sync snapshot has been prepared for your current records.');
                                await Analytics.logEvent('local_sync_snapshot_created');
                            } catch (error: any) {
                                setErrorMessage(error?.message ?? 'Could not prepare a local sync snapshot.');
                            }
                        }}
                        className={`min-h-[56px] flex-row items-center justify-center rounded-3xl bg-primary-600 px-4 py-4 ${
                            isSyncing ? 'opacity-70' : ''
                        }`}
                    >
                        <RefreshCw size={18} color="#FFFFFF" />
                        <Text className="ml-2 text-base font-bold text-white">
                            {isSyncing ? 'Preparing Snapshot...' : 'Prepare Local Sync Snapshot'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={loadingBackup}
                        onPress={async () => {
                            if (!user?.id) return;
                            try {
                                setLoadingBackup(true);
                                setMessage('');
                                setErrorMessage('');
                                const backup = await createBackupFile(user.id);
                                setBackupAt(backup.exportedAt);
                                setMessage(`Backup file created on ${new Date(backup.exportedAt).toLocaleString()}.`);
                                await Analytics.logEvent('backup_file_created');
                            } catch (error: any) {
                                setErrorMessage(error?.message ?? 'Could not create a backup file.');
                            } finally {
                                setLoadingBackup(false);
                            }
                        }}
                        className={`min-h-[56px] flex-row items-center justify-center rounded-3xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-600 dark:bg-gray-800 ${
                            loadingBackup ? 'opacity-70' : ''
                        }`}
                    >
                        <FolderArchive size={18} color="#2E7D32" />
                        <Text className="ml-2 text-base font-bold text-primary-700 dark:text-primary-300">
                            {loadingBackup ? 'Creating Backup...' : 'Create Backup File'}
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={async () => {
                                if (!user?.id) return;
                                try {
                                    await shareBackupFile(user.id);
                                    await Analytics.logEvent('backup_file_shared');
                                } catch (error: any) {
                                    setErrorMessage(error?.message ?? 'Could not share the backup file.');
                                }
                            }}
                            className="flex-1 flex-row items-center justify-center rounded-3xl bg-secondary-600 px-4 py-4"
                        >
                            <Share2 size={18} color="#FFFFFF" />
                            <Text className="ml-2 text-base font-bold text-white">Share Backup</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={async () => {
                                if (!user?.id) return;
                                try {
                                    await shareBackupSummary(user.id);
                                    await Analytics.logEvent('backup_summary_shared');
                                } catch (error: any) {
                                    setErrorMessage(error?.message ?? 'Could not share the backup summary.');
                                }
                            }}
                            className="flex-1 flex-row items-center justify-center rounded-3xl bg-emerald-600 px-4 py-4"
                        >
                            <Download size={18} color="#FFFFFF" />
                            <Text className="ml-2 text-base font-bold text-white">Share Summary</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="rounded-3xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
                        <View className="flex-row items-start">
                            <CloudUpload size={20} color="#2563EB" />
                            <View className="ml-3 flex-1">
                                <Text className="text-base font-bold text-blue-900 dark:text-blue-100">
                                    What this does today
                                </Text>
                                <Text className="mt-2 text-sm leading-6 text-blue-800 dark:text-blue-200">
                                    This version protects your data by preparing local sync snapshots and exportable backup files. It does not connect to Paystack or a cloud database, so your existing app logic stays safe.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
