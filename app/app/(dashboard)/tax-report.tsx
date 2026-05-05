import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from 'expo-router';
import { Landmark } from 'lucide-react-native';

export default function TaxReport() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalSales: 0,
        taxableSales: 0,
        totalTaxesCollected: 0,
        nhil: 0,
        getfund: 0,
        covid: 0,
        vat: 0
    });

    const fetchReport = async () => {
        if (!user) return;
        try {
            const stored = await AsyncStorage.getItem(`@invoices_${user.id}`);
            if (stored) {
                const invoices = JSON.parse(stored);
                // Only count PAID invoices for collected taxes
                const paid = invoices.filter((i: any) => i.status === 'paid');
                
                let totalSales = 0;
                let taxableSales = 0;
                let nhil = 0, getfund = 0, covid = 0, vat = 0, totalTax = 0;

                paid.forEach((inv: any) => {
                    totalSales += inv.amount || 0;
                    if (inv.taxBreakdown) {
                        taxableSales += inv.subtotal || 0;
                        nhil += inv.taxBreakdown.nhil || 0;
                        getfund += inv.taxBreakdown.getfund || 0;
                        covid += inv.taxBreakdown.covid || 0;
                        vat += inv.taxBreakdown.vat || 0;
                        totalTax += inv.taxBreakdown.totalTax || 0;
                    }
                });

                setStats({
                    totalSales,
                    taxableSales,
                    totalTaxesCollected: totalTax,
                    nhil, getfund, covid, vat
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchReport();
        }, [user])
    );

    return (
        <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 100 }}>
            <View className="px-6 mb-8">
                <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tax Compliance</Text>
                <Text className="text-gray-500">Overview of your collected GRA taxes from paid invoices.</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#16a34a" />
            ) : (
                <View className="px-5">
                    <View className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
                        <View className="flex-row items-center mb-4">
                            <View className="bg-green-100 p-3 rounded-full mr-3"><Landmark color="#16a34a" size={24} /></View>
                            <Text className="text-lg font-bold dark:text-white">Collected GRA Taxes</Text>
                        </View>
                        <Text className="text-4xl font-bold text-primary-600 mb-2">GH₵ {stats.totalTaxesCollected.toFixed(2)}</Text>
                        <Text className="text-xs text-gray-400 font-medium">From GH₵ {stats.taxableSales.toFixed(2)} in taxable sales</Text>
                    </View>

                    <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 px-1">Detailed Breakdown</Text>
                    
                    <View className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6 border border-gray-100 dark:border-gray-700 space-y-4 gap-4">
                        <View className="flex-row justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
                            <Text className="text-gray-600 dark:text-gray-300 font-medium">Value Added Tax (15%)</Text>
                            <Text className="text-lg font-bold dark:text-white">GH₵ {stats.vat.toFixed(2)}</Text>
                        </View>
                        <View className="flex-row justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
                            <Text className="text-gray-600 dark:text-gray-300 font-medium">NHIL (2.5%)</Text>
                            <Text className="text-lg font-bold dark:text-white">GH₵ {stats.nhil.toFixed(2)}</Text>
                        </View>
                        <View className="flex-row justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
                            <Text className="text-gray-600 dark:text-gray-300 font-medium">GETFund (2.5%)</Text>
                            <Text className="text-lg font-bold dark:text-white">GH₵ {stats.getfund.toFixed(2)}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                            <Text className="text-gray-600 dark:text-gray-300 font-medium">COVID-19 (1%)</Text>
                            <Text className="text-lg font-bold dark:text-white">GH₵ {stats.covid.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 mt-4">
                        <Text className="text-blue-800 dark:text-blue-300 text-xs text-center font-medium leading-relaxed">
                            This is a business support tool and not definitive legal or GRA advice. Please consult your accountant for official filings.
                        </Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}
