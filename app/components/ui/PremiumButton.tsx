import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface PremiumButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
    className?: string;
}

/**
 * PremiumButton - Styled base button matching the SME Boost design system
 */
export const PremiumButton: React.FC<PremiumButtonProps> = ({ 
    title, 
    loading = false, 
    variant = 'primary', 
    className = '', 
    ...props 
}) => {
    let bgClass = 'bg-primary-600 active:bg-primary-700 shadow-md';
    let textClass = 'text-white';

    if (variant === 'secondary') {
        bgClass = 'bg-secondary-600 active:bg-secondary-700 shadow-md';
    } else if (variant === 'outline') {
        bgClass = 'bg-transparent border-2 border-primary-600 active:bg-primary-50';
        textClass = 'text-primary-600 dark:text-primary-400';
    }

    return (
        <TouchableOpacity 
            className={`p-4 rounded-xl items-center justify-center flex-row ${bgClass} ${loading ? 'opacity-70' : ''} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? '#2E7D32' : 'white'} />
            ) : (
                <Text className={`font-bold text-lg ${textClass}`}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};
