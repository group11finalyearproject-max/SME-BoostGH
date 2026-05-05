import { useEffect, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft, ClipboardList, Send, Users, WalletCards, Zap } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { sendSalesChat, getBusinessMetrics, BusinessMetrics } from '../../services/ai_sales';
import { AIAdvisorMessageCard } from '../../components/ai/AIAdvisorMessageCard';
import { AIAdvisorTaskCard } from '../../components/ai/AIAdvisorTaskCard';
import { AIContextBanner } from '../../components/ai/AIContextBanner';
import { AISectionCard } from '../../components/ai/AISectionCard';
import { AIStateCard } from '../../components/ai/AIStateCard';
import { Analytics } from '../../services/analytics';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    metrics_used?: BusinessMetrics;
};

const ADVISOR_TASKS = [
    {
        title: 'Review overdue invoices',
        description: 'Find the payment issues that need attention first.',
        prompt: 'Review my overdue or unpaid invoices and tell me the best follow-up actions to take first.',
        icon: ClipboardList,
        iconColor: '#D97706',
        iconBgClassName: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
        title: 'Increase weekly sales',
        description: 'Get practical ideas based on current business activity.',
        prompt: 'Based on my current customers and invoices, what should I do this week to increase sales?',
        icon: WalletCards,
        iconColor: '#2563EB',
        iconBgClassName: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
        title: 'Re-engage customers',
        description: 'Ask which customers may need a follow-up or retention plan.',
        prompt: 'What customer follow-up actions would you recommend to improve retention and repeat business?',
        icon: Users,
        iconColor: '#059669',
        iconBgClassName: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
        title: 'Get quick advice',
        description: 'Ask for the next best move if you feel stuck today.',
        prompt: 'What is the single most important business action I should take next based on my current situation?',
        icon: Zap,
        iconColor: '#7C3AED',
        iconBgClassName: 'bg-purple-100 dark:bg-purple-900/30',
    },
];

export default function AIChat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content:
                'I am your SME Boost business advisor. Ask me about sales, customers, or your next best action and I will respond using the business context available in the app.',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState<BusinessMetrics | undefined>();

    useEffect(() => {
        if (user?.id) {
            getBusinessMetrics(user.id).then((data) => setMetrics(data));
        }
    }, [user?.id]);

    const sendUserMessage = async (text: string) => {
        if (!text.trim() || loading) return;

        const newMsg: Message = { role: 'user', content: text.trim() };
        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            const apiMessages = updatedMessages.map((message) => ({
                role: message.role,
                content: message.content,
            }));
            const reply = await sendSalesChat(apiMessages, metrics);
            await Analytics.logEvent('ai_advisor_message_sent');

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: reply.content,
                    metrics_used: reply.metrics_used,
                },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content:
                        'I am having trouble connecting right now. Please try again in a moment.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            <View className="border-b border-gray-100 bg-white px-4 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2">
                        <ArrowLeft size={24} color="#6B7280" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">
                        AI Business Advisor
                    </Text>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                <FlatList
                    data={messages}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
                    ListHeaderComponent={
                        <View className="mb-6 gap-4">
                            <AIContextBanner metrics={metrics} />

                            <AISectionCard
                                title="Ask for practical business help"
                                description="Choose a common business task below or type your own question. The advisor will respond with clearer, action-focused guidance."
                            >
                                <View className="gap-3">
                                    {ADVISOR_TASKS.map((task) => (
                                        <AIAdvisorTaskCard
                                            key={task.title}
                                            title={task.title}
                                            description={task.description}
                                            prompt={task.prompt}
                                            icon={task.icon}
                                            iconColor={task.iconColor}
                                            iconBgClassName={task.iconBgClassName}
                                            onPress={sendUserMessage}
                                        />
                                    ))}
                                </View>
                            </AISectionCard>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View
                            className={`mb-4 w-full flex-row ${
                                item.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            {item.role === 'assistant' ? (
                                <AIAdvisorMessageCard
                                    content={item.content}
                                    metricsUsed={item.metrics_used}
                                />
                            ) : (
                                <View className="max-w-[84%] rounded-[28px] rounded-br-md bg-primary-600 px-4 py-4">
                                    <Text className="text-sm leading-6 text-white">{item.content}</Text>
                                </View>
                            )}
                        </View>
                    )}
                    ListFooterComponent={
                        loading ? (
                            <View className="mt-2">
                                <AIStateCard
                                    title="Advisor is preparing your answer"
                                    description="SME Boost GH is reviewing your current business context and shaping a practical response."
                                    tone="loading"
                                />
                            </View>
                        ) : null
                    }
                />

                <View className="border-t border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <View className="flex-row items-end">
                        <TextInput
                            className="mr-3 min-h-[52px] flex-1 rounded-3xl bg-gray-100 px-4 py-3 text-sm text-gray-900 dark:bg-gray-700 dark:text-white"
                            placeholder="Ask about sales, customers, or the next best action..."
                            placeholderTextColor="#9CA3AF"
                            value={input}
                            onChangeText={setInput}
                            editable={!loading}
                            multiline
                        />
                        <TouchableOpacity
                            onPress={() => sendUserMessage(input)}
                            disabled={loading}
                            className={`h-12 w-12 items-center justify-center rounded-full bg-primary-600 ${
                                loading ? 'opacity-50' : 'active:opacity-90'
                            }`}
                        >
                            <Send size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
