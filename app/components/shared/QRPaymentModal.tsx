import React, { useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Share, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Share as ShareIcon, X, CheckCircle } from 'lucide-react-native';
import { Invoice } from '../../types/invoice';

interface QRPaymentModalProps {
    visible: boolean;
    onClose: () => void;
    invoice: Invoice | null;
    onPaymentSuccess: () => void;
}

export const QRPaymentModal: React.FC<QRPaymentModalProps> = ({ visible, onClose, invoice, onPaymentSuccess }) => {
    let svgRef = useRef<any>(null);

    if (!invoice) return null;

    const qrPayload = JSON.stringify({
        id: invoice.id,
        amount: invoice.amount,
        customer: invoice.customer_name,
        reference: `PAY-${invoice.id}-${Date.now()}`
    });

    const handleShare = () => {
        if (svgRef.current) {
            svgRef.current.toDataURL((data: string) => {
                const shareImageBase64 = `data:image/png;base64,${data}`;
                Share.share({
                    message: `Scan to pay invoice ${invoice.id}.\nAmount: GH₵ ${invoice.amount.toFixed(2)}\nCustomer: ${invoice.customer_name}`,
                    url: shareImageBase64, // Note: Supported heavily on iOS. Fallback to basic share text natively.
                    title: `Invoice Payment QR`
                }).catch(err => console.log('Error sharing:', err));
            });
        } else {
             Share.share({
                 message: `Please pay invoice ${invoice.id}.\nAmount: GH₵ ${invoice.amount.toFixed(2)}\nCustomer: ${invoice.customer_name}\nData: ${qrPayload}`,
            });
        }
    };

    const simulatePayment = () => {
        Alert.alert(
            "Mock Payment",
            "Simulating a successful payment received from the scanned QR code.",
            [{ text: "OK", onPress: () => {
                onPaymentSuccess();
                onClose();
            }}]
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 bg-black/60 justify-center items-center px-4">
                <View className="bg-white dark:bg-gray-800 w-full rounded-3xl p-6 items-center shadow-xl">
                    <TouchableOpacity onPress={onClose} className="absolute right-4 top-4 p-2">
                        <X size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                    
                    <Text className="text-xl font-bold dark:text-white mt-4 mb-2">Invoice Payment</Text>
                    <Text className="text-gray-500 mb-6 text-center">Scan this code to instantly pay the invoice.</Text>
                    
                    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 w-full items-center">
                        <QRCode
                            value={qrPayload}
                            size={200}
                            color="black"
                            backgroundColor="white"
                            getRef={(c) => (svgRef.current = c)}
                        />
                    </View>

                    <View className="w-full bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-6">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-500 font-medium">Invoice ID</Text>
                            <Text className="dark:text-white font-bold">{invoice.id}</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-500 font-medium">Customer</Text>
                            <Text className="dark:text-white font-bold">{invoice.customer_name}</Text>
                        </View>
                        <View className="flex-row justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                            <Text className="text-gray-700 dark:text-gray-300 font-medium">Total Due</Text>
                            <Text className="text-xl text-primary-600 font-bold tracking-tight">GH₵ {invoice.amount.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View className="flex-row gap-3 w-full">
                        <TouchableOpacity 
                            onPress={handleShare}
                            className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl flex-row justify-center items-center"
                        >
                            <ShareIcon size={20} color="#4B5563" />
                            <Text className="font-bold text-gray-700 dark:text-gray-200 ml-2">Share QR</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={simulatePayment}
                            className="flex-1 bg-green-500 p-4 rounded-xl flex-row justify-center items-center shadow-md active:bg-green-600"
                        >
                            <CheckCircle size={20} color="white" />
                            <Text className="font-bold text-white ml-2">Test Pay</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
