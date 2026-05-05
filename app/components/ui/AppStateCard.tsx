import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import {
    AlertCircle,
    CheckCircle2,
    Info,
    LucideIcon,
    Sparkles,
    TriangleAlert,
} from 'lucide-react-native';

export type AppStateTone =
    | 'neutral'
    | 'loading'
    | 'error'
    | 'success'
    | 'warning'
    | 'empty';

interface AppStateCardProps {
    title: string;
    description: string;
    tone?: AppStateTone;
    icon?: LucideIcon;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    children?: React.ReactNode;
}

const toneStyles: Record<
    AppStateTone,
    { wrap: string; title: string; body: string; icon: string; defaultIcon: LucideIcon }
> = {
    neutral: {
        wrap: 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700',
        title: 'text-gray-900 dark:text-white',
        body: 'text-gray-500 dark:text-gray-400',
        icon: '#2E7D32',
        defaultIcon: Sparkles,
    },
    loading: {
        wrap: 'bg-primary-50 border-primary-100 dark:bg-primary-900/20 dark:border-primary-800',
        title: 'text-primary-900 dark:text-primary-100',
        body: 'text-primary-700 dark:text-primary-200',
        icon: '#2E7D32',
        defaultIcon: Info,
    },
    error: {
        wrap: 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800',
        title: 'text-red-900 dark:text-red-100',
        body: 'text-red-700 dark:text-red-200',
        icon: '#DC2626',
        defaultIcon: AlertCircle,
    },
    success: {
        wrap: 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800',
        title: 'text-green-900 dark:text-green-100',
        body: 'text-green-700 dark:text-green-200',
        icon: '#16A34A',
        defaultIcon: CheckCircle2,
    },
    warning: {
        wrap: 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
        title: 'text-amber-900 dark:text-amber-100',
        body: 'text-amber-700 dark:text-amber-200',
        icon: '#D97706',
        defaultIcon: TriangleAlert,
    },
    empty: {
        wrap: 'bg-white border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-600',
        title: 'text-gray-900 dark:text-white',
        body: 'text-gray-500 dark:text-gray-400',
        icon: '#6B7280',
        defaultIcon: Sparkles,
    },
};

export const AppStateCard: React.FC<AppStateCardProps> = ({
    title,
    description,
    tone = 'neutral',
    icon,
    actionLabel,
    actionHref,
    onAction,
    children,
}) => {
    const styles = toneStyles[tone];
    const Icon = icon ?? styles.defaultIcon;

    return (
        <View className={`rounded-3xl border p-5 shadow-sm ${styles.wrap}`}>
            <View className="flex-row items-start">
                <View className="mr-3 mt-0.5">
                    {tone === 'loading' ? (
                        <ActivityIndicator color={styles.icon} />
                    ) : (
                        <Icon size={20} color={styles.icon} />
                    )}
                </View>
                <View className="flex-1">
                    <Text className={`text-base font-bold ${styles.title}`}>{title}</Text>
                    <Text className={`mt-2 text-sm leading-6 ${styles.body}`}>{description}</Text>
                </View>
            </View>

            {children ? <View className="mt-4">{children}</View> : null}

            {actionLabel && actionHref ? (
                <View className="mt-4">
                    <Link href={actionHref as never} asChild>
                        <TouchableOpacity className="min-h-[48px] items-center justify-center rounded-2xl bg-white px-4 py-3 active:opacity-90 dark:bg-gray-700">
                            <Text className="text-center text-sm font-semibold text-primary-700 dark:text-primary-300">
                                {actionLabel}
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            ) : null}

            {actionLabel && onAction ? (
                <View className="mt-4">
                    <TouchableOpacity
                        onPress={onAction}
                        className="min-h-[48px] items-center justify-center rounded-2xl bg-white px-4 py-3 active:opacity-90 dark:bg-gray-700"
                    >
                        <Text className="text-center text-sm font-semibold text-primary-700 dark:text-primary-300">
                            {actionLabel}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
};
