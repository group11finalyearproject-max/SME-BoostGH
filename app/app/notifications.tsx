import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Bell, CheckCheck, ChevronRight, X } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { AppNotification } from '../types';
import { AppScreenHeader } from '../components/ui/AppScreenHeader';
import { AppStateCard } from '../components/ui/AppStateCard';
import {
    dismissNotification,
    loadNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    syncInvoiceNotifications,
} from '../services/notifications';
import { Analytics } from '../services/analytics';

export default function NotificationsScreen() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshNotifications = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        const synced = await syncInvoiceNotifications(user.id);
        setNotifications(synced);
        setLoading(false);
        await Analytics.logEvent('notifications_opened', { count: synced.length });
    }, [user?.id]);

    useFocusEffect(
        useCallback(() => {
            void refreshNotifications();
        }, [refreshNotifications])
    );

    const handleOpen = async (notification: AppNotification) => {
        if (!user?.id) return;

        await markNotificationRead(user.id, notification.id);
        if (notification.actionHref) {
            router.push(notification.actionHref as never);
        }
    };

    const handleDismiss = async (notificationId: string) => {
        if (!user?.id) return;

        await dismissNotification(user.id, notificationId);
        setNotifications(await loadNotifications(user.id));
    };

    const unreadCount = notifications.filter((item) => !item.readAt).length;

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <AppScreenHeader
                title="Notifications"
                subtitle="Stay on top of invoices that need follow-up."
                onBack={() => router.back()}
                rightAction={(
                    <TouchableOpacity
                        onPress={async () => {
                            if (!user?.id) return;
                            await markAllNotificationsRead(user.id);
                            setNotifications(await loadNotifications(user.id));
                        }}
                        className="rounded-2xl bg-primary-50 px-4 py-3 dark:bg-primary-900/20"
                    >
                        <Text className="text-sm font-semibold text-primary-700 dark:text-primary-200">
                            Mark all read
                        </Text>
                    </TouchableOpacity>
                )}
            />

            <ScrollView className="flex-1">
                <View className="gap-4 px-5 pb-12 pt-6">
                    <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <View className="flex-row items-start justify-between">
                            <View className="mr-4 flex-1">
                                <Text className="text-base font-bold text-gray-900 dark:text-white">
                                    Reminder center
                                </Text>
                                <Text className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                    SME Boost GH keeps these reminders inside the app so you can quickly review invoices that are due soon or already overdue.
                                </Text>
                            </View>
                            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20">
                                <Bell size={20} color="#2E7D32" />
                            </View>
                        </View>

                        <View className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-700/50">
                            <Text className="text-sm text-gray-700 dark:text-gray-200">
                                {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
                            </Text>
                        </View>
                    </View>

                    {loading ? (
                        <AppStateCard
                            title="Refreshing reminders"
                            description="SME Boost GH is checking which invoices need your attention."
                            tone="loading"
                        />
                    ) : null}

                    {!loading && notifications.length === 0 ? (
                        <AppStateCard
                            title="No reminders right now"
                            description="Your invoices are under control. When an invoice is due soon or overdue, it will appear here."
                            tone="empty"
                        />
                    ) : null}

                    {!loading
                        ? notifications.map((notification) => (
                            <View
                                key={notification.id}
                                className={`rounded-3xl border p-4 shadow-sm ${
                                    notification.readAt
                                        ? 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
                                        : 'border-primary-100 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20'
                                }`}
                            >
                                <View className="flex-row items-start justify-between">
                                    <View className="mr-3 flex-1">
                                        <Text className="text-base font-bold text-gray-900 dark:text-white">
                                            {notification.title}
                                        </Text>
                                        <Text className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                            {notification.description}
                                        </Text>
                                        <Text className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => void handleDismiss(notification.id)}
                                        className="rounded-2xl bg-white p-2 dark:bg-gray-700"
                                    >
                                        <X size={18} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                <View className="mt-4 flex-row gap-3">
                                    <TouchableOpacity
                                        onPress={() => void handleOpen(notification)}
                                        className="flex-1 flex-row items-center justify-center rounded-2xl bg-primary-600 px-4 py-3"
                                    >
                                        <Text className="text-sm font-semibold text-white">Open invoice</Text>
                                        <ChevronRight size={16} color="#FFFFFF" />
                                    </TouchableOpacity>

                                    {!notification.readAt ? (
                                        <TouchableOpacity
                                            onPress={async () => {
                                                if (!user?.id) return;
                                                await markNotificationRead(user.id, notification.id);
                                                setNotifications(await loadNotifications(user.id));
                                            }}
                                            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-700"
                                        >
                                            <CheckCheck size={18} color="#2E7D32" />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            </View>
                        ))
                        : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
