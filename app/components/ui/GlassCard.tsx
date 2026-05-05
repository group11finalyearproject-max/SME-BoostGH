import React from 'react';
import { View, ViewProps } from 'react-native';

interface GlassCardProps extends ViewProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * GlassCard - A premium glassmorphism container component
 * Requires support for backdrop-blur in NativeWind.
 */
export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', ...props }) => {
    return (
        <View 
            className={`bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-sm ${className}`}
            {...props}
        >
            {children}
        </View>
    );
};
