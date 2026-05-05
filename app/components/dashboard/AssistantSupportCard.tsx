import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { Briefcase, Mail, Megaphone, MessageSquare } from 'lucide-react-native';

const QuickTask = ({
    href,
    label,
    icon: Icon,
    iconColor,
    bgClassName,
}: {
    href: string;
    label: string;
    icon: typeof Briefcase;
    iconColor: string;
    bgClassName: string;
}) => (
    <Link href={href as never} asChild>
        <TouchableOpacity className="flex-1 rounded-2xl border border-gray-100 bg-white p-3 active:opacity-90 dark:border-gray-700 dark:bg-gray-800">
            <View className={`mb-3 h-10 w-10 items-center justify-center rounded-2xl ${bgClassName}`}>
                <Icon size={18} color={iconColor} />
            </View>
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">{label}</Text>
        </TouchableOpacity>
    </Link>
);

export const AssistantSupportCard: React.FC = () => {
    return (
        <View className="rounded-3xl bg-primary-900 px-5 py-5 shadow-md dark:bg-primary-800">
            <Text className="text-xs font-semibold uppercase tracking-wider text-primary-200">
                SME Boost Assistant
            </Text>
            <Text className="mt-2 text-2xl font-bold text-white">
                Get practical help for the next move in your business
            </Text>
            <Text className="mt-3 text-sm leading-6 text-primary-100">
                Use AI to write customer messages, plan growth, or create marketing content from one guided workspace.
            </Text>

            <View className="mt-5">
                <Link href="/ai-tools/chat" asChild>
                    <TouchableOpacity className="min-h-[52px] flex-row items-center justify-center rounded-2xl bg-white px-4 py-3 active:opacity-90">
                        <MessageSquare size={18} color="#1C4F21" />
                        <Text className="ml-2 text-sm font-bold text-primary-800">
                            Ask the advisor
                        </Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <View className="mt-4 flex-row gap-3">
                <QuickTask
                    href="/ai-tools/business-plan"
                    label="Plan growth"
                    icon={Briefcase}
                    iconColor="#2563EB"
                    bgClassName="bg-blue-100"
                />
                <QuickTask
                    href="/ai-tools/marketing"
                    label="Write marketing"
                    icon={Megaphone}
                    iconColor="#D97706"
                    bgClassName="bg-amber-100"
                />
                <QuickTask
                    href="/ai-tools/email"
                    label="Draft email"
                    icon={Mail}
                    iconColor="#059669"
                    bgClassName="bg-emerald-100"
                />
            </View>
        </View>
    );
};
