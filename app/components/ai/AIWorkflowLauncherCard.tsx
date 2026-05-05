import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { ChevronRight, LucideIcon } from 'lucide-react-native';

interface AIWorkflowLauncherCardProps {
    href: string;
    title: string;
    outcome: string;
    description: string;
    icon: LucideIcon;
    iconColor: string;
    iconBgClassName: string;
    badge?: string;
}

export const AIWorkflowLauncherCard: React.FC<AIWorkflowLauncherCardProps> = ({
    href,
    title,
    outcome,
    description,
    icon: Icon,
    iconColor,
    iconBgClassName,
    badge,
}) => {
    return (
        <Link href={href as never} asChild>
            <TouchableOpacity className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm active:opacity-90 dark:border-gray-700 dark:bg-gray-800">
                <View className="flex-row items-start justify-between">
                    <View className={`h-12 w-12 items-center justify-center rounded-2xl ${iconBgClassName}`}>
                        <Icon size={22} color={iconColor} />
                    </View>
                    {badge ? (
                        <View className="rounded-full bg-primary-50 px-3 py-1 dark:bg-primary-900/30">
                            <Text className="text-[11px] font-semibold text-primary-700 dark:text-primary-300">
                                {badge}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <Text className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                    {title}
                </Text>
                <Text className="mt-2 text-sm font-semibold text-primary-700 dark:text-primary-300">
                    {outcome}
                </Text>
                <Text className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {description}
                </Text>

                <View className="mt-4 flex-row items-center justify-between">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        Open workflow
                    </Text>
                    <ChevronRight size={18} color="#9CA3AF" />
                </View>
            </TouchableOpacity>
        </Link>
    );
};
