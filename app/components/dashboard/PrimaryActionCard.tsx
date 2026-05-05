import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';

interface PrimaryActionCardProps {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    tone?: 'primary' | 'secondary' | 'neutral';
    featured?: boolean;
}

const toneStyles = {
    primary: {
        card: 'bg-primary-600 dark:bg-primary-700',
        title: 'text-white',
        description: 'text-primary-50',
        iconWrap: 'bg-white/15',
        iconColor: '#FFFFFF',
    },
    secondary: {
        card: 'bg-secondary-600 dark:bg-secondary-700',
        title: 'text-white',
        description: 'text-secondary-50',
        iconWrap: 'bg-white/15',
        iconColor: '#FFFFFF',
    },
    neutral: {
        card: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
        title: 'text-gray-900 dark:text-white',
        description: 'text-gray-500 dark:text-gray-400',
        iconWrap: 'bg-primary-50 dark:bg-primary-900/30',
        iconColor: '#2E7D32',
    },
} as const;

export const PrimaryActionCard: React.FC<PrimaryActionCardProps> = ({
    title,
    description,
    href,
    icon: Icon,
    tone = 'neutral',
    featured = false,
}) => {
    const styles = toneStyles[tone];

    return (
        <Link href={href as never} asChild>
            <TouchableOpacity
                className={`rounded-3xl px-4 py-4 shadow-sm active:opacity-90 ${styles.card} ${
                    featured ? 'min-h-[120px]' : 'min-h-[112px]'
                }`}
            >
                <View className="flex-1 flex-row items-start justify-between">
                    <View className="mr-3 flex-1">
                        <Text className={`text-lg font-bold ${styles.title}`}>{title}</Text>
                        <Text className={`mt-2 text-sm leading-5 ${styles.description}`}>
                            {description}
                        </Text>
                    </View>

                    <View className={`h-12 w-12 items-center justify-center rounded-2xl ${styles.iconWrap}`}>
                        <Icon size={22} color={styles.iconColor} />
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
};
