import React from 'react';
import { View, Text } from 'react-native';
import { InvoiceStatus } from '../../types/invoice';

interface StatusBadgeProps {
    status: InvoiceStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    let bg = 'bg-gray-100 dark:bg-gray-800';
    let text = 'text-gray-600 dark:text-gray-400';

    if (status === 'paid') { 
        bg = 'bg-green-100 dark:bg-green-900/30'; 
        text = 'text-green-700 dark:text-green-400'; 
    }
    if (status === 'pending') { 
        bg = 'bg-yellow-100 dark:bg-yellow-900/30'; 
        text = 'text-yellow-700 dark:text-yellow-400'; 
    }
    if (status === 'overdue') { 
        bg = 'bg-red-100 dark:bg-red-900/30'; 
        text = 'text-red-700 dark:text-red-400'; 
    }

    return (
        <View className={`${bg} px-2 py-1 rounded-md`}>
            <Text className={`${text} text-xs font-medium capitalize`}>{status}</Text>
        </View>
    );
};
