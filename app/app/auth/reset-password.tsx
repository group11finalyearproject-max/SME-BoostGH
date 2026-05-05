import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'expo-router';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        setLoading(true);
        const { error } = await resetPassword(email);
        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'Check your email for password reset instructions.');
        }
    };

    return (
        <View className="flex-1 justify-center px-8 bg-gray-50 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm">
                <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">Reset Password</Text>
                <Text className="text-gray-500 dark:text-gray-400 mb-6">Enter your email to receive instructions</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                            placeholder="you@company.com"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-primary-600 py-3 rounded-lg items-center mt-2 active:bg-primary-700"
                        onPress={handleReset}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Send Instructions</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View className="items-center mt-6">
                    <Link href="/auth/login" asChild>
                        <TouchableOpacity>
                            <Text className="text-primary-600 dark:text-primary-400 font-semibold">Back to Sign In</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    );
}
