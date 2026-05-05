import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CircleHelp, FileText, Lightbulb, MessageSquare, Users } from 'lucide-react-native';
import { AppScreenHeader } from '../components/ui/AppScreenHeader';

const helpSections = [
    {
        title: 'How should I start?',
        description: 'Begin by adding one customer, then create your first invoice. After that, use the AI tools for planning, marketing, or email writing.',
        icon: Lightbulb,
        accent: 'bg-amber-100 dark:bg-amber-900/30',
        color: '#D97706',
    },
    {
        title: 'When should I use the AI tools?',
        description: 'Use Business Plan for planning, Marketing Content for promotions, Email Draft for professional communication, and AI Business Advisor for quick guidance.',
        icon: MessageSquare,
        accent: 'bg-purple-100 dark:bg-purple-900/30',
        color: '#7C3AED',
    },
    {
        title: 'Why add customers first?',
        description: 'Customer records make invoicing faster, keep contact details in one place, and support better follow-up.',
        icon: Users,
        accent: 'bg-blue-100 dark:bg-blue-900/30',
        color: '#2563EB',
    },
    {
        title: 'How do invoice reminders work?',
        description: 'Invoices with due dates can appear in the Notifications screen when they are due soon or overdue, so you can take action quickly.',
        icon: FileText,
        accent: 'bg-emerald-100 dark:bg-emerald-900/30',
        color: '#059669',
    },
];

export default function HelpScreen() {
    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <AppScreenHeader
                title="Help & Support"
                subtitle="Practical guidance for running the app with less stress."
                onBack={() => router.back()}
            />

            <ScrollView className="flex-1">
                <View className="gap-4 px-5 pb-12 pt-6">
                    <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <View className="flex-row items-start justify-between">
                            <View className="mr-4 flex-1">
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                    Guided support for SME owners
                                </Text>
                                <Text className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                    This screen is designed for users who want short, simple explanations instead of technical instructions.
                                </Text>
                            </View>
                            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20">
                                <CircleHelp size={20} color="#2E7D32" />
                            </View>
                        </View>
                    </View>

                    {helpSections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <View
                                key={section.title}
                                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                            >
                                <View className="flex-row items-start">
                                    <View className={`mr-4 h-12 w-12 items-center justify-center rounded-2xl ${section.accent}`}>
                                        <Icon size={20} color={section.color} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-base font-bold text-gray-900 dark:text-white">
                                            {section.title}
                                        </Text>
                                        <Text className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                            {section.description}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    <View className="rounded-3xl border border-primary-100 bg-primary-50 p-5 dark:border-primary-800 dark:bg-primary-900/20">
                        <Text className="text-base font-bold text-primary-900 dark:text-primary-100">
                            Recommended workflow
                        </Text>
                        <Text className="mt-2 text-sm leading-6 text-primary-800 dark:text-primary-200">
                            1. Add a customer.
                        </Text>
                        <Text className="text-sm leading-6 text-primary-800 dark:text-primary-200">
                            2. Create an invoice with a due date.
                        </Text>
                        <Text className="text-sm leading-6 text-primary-800 dark:text-primary-200">
                            3. Track reminders in Notifications.
                        </Text>
                        <Text className="text-sm leading-6 text-primary-800 dark:text-primary-200">
                            4. Use AI tools to save time on writing and planning.
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/ai-tools')}
                        className="min-h-[56px] items-center justify-center rounded-3xl bg-primary-600 px-4 py-4"
                    >
                        <Text className="text-base font-bold text-white">Open AI Tools</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
