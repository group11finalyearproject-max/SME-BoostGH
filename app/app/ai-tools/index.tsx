import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Briefcase, Mail, Megaphone, MessageSquare, Save } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { AIWorkflowHero } from '../../components/ai/AIWorkflowHero';
import { AIWorkflowLauncherCard } from '../../components/ai/AIWorkflowLauncherCard';
import { AISectionCard } from '../../components/ai/AISectionCard';
import { AIStateCard } from '../../components/ai/AIStateCard';
import { loadDrafts } from '../../services/drafts';

export default function AITools() {
    const [draftCount, setDraftCount] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const fetchDrafts = async () => {
                const drafts = await loadDrafts();
                setDraftCount(drafts.length);
            };

            fetchDrafts();
        }, [])
    );

    return (
        <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="px-5 pb-12 pt-6">
                <AIWorkflowHero
                    eyebrow="AI Workflows"
                    title="Choose the business outcome you want"
                    description="SME Boost GH is designed to help you plan, write, and move faster with guided business workflows instead of generic AI prompts."
                />

                <View className="mt-6 gap-4">
                    <AIWorkflowLauncherCard
                        href="/ai-tools/business-plan"
                        title="Build a business plan"
                        outcome="Create a practical growth-ready plan for your business."
                        description="Answer a few guided questions and get a business plan organized into clear sections you can review, edit, and save."
                        icon={Briefcase}
                        iconColor="#2563EB"
                        iconBgClassName="bg-blue-100 dark:bg-blue-900/30"
                        badge="Guided workflow"
                    />

                    <AIWorkflowLauncherCard
                        href="/ai-tools/marketing"
                        title="Write marketing content"
                        outcome="Generate promotional messages you can use right away."
                        description="Create social posts, flyer copy, and promotional messages based on your offer, audience, and goal."
                        icon={Megaphone}
                        iconColor="#D97706"
                        iconBgClassName="bg-amber-100 dark:bg-amber-900/30"
                    />

                    <AIWorkflowLauncherCard
                        href="/ai-tools/email"
                        title="Draft a professional email"
                        outcome="Compose business emails with clearer purpose and tone."
                        description="Draft follow-ups, inquiries, proposals, and customer messages with AI support and save them for reuse."
                        icon={Mail}
                        iconColor="#059669"
                        iconBgClassName="bg-emerald-100 dark:bg-emerald-900/30"
                    />

                    <AIWorkflowLauncherCard
                        href="/ai-tools/chat"
                        title="Ask the business assistant"
                        outcome="Get quick advice grounded in your business activity."
                        description="Ask about sales, customers, overdue invoices, and next steps when you need fast support."
                        icon={MessageSquare}
                        iconColor="#7C3AED"
                        iconBgClassName="bg-purple-100 dark:bg-purple-900/30"
                    />
                </View>

                <View className="mt-8">
                    <AISectionCard
                        title="Continue saved work"
                        description="Pick up where you left off without starting your workflow again."
                    >
                        {draftCount > 0 ? (
                            <AIWorkflowLauncherCard
                                href="/ai-tools/drafts"
                                title="Open saved drafts"
                                outcome={`${draftCount} saved ${draftCount === 1 ? 'draft' : 'drafts'} ready to review.`}
                                description="Return to your business plans, marketing content, and email drafts to edit, copy, share, or delete them."
                                icon={Save}
                                iconColor="#4B5563"
                                iconBgClassName="bg-gray-100 dark:bg-gray-700"
                                badge="Continue work"
                            />
                        ) : (
                            <AIStateCard
                                title="No saved AI work yet"
                                description="When you save a business plan, marketing draft, or email, it will appear here so you can continue later."
                                actionLabel="Start with Business Plan"
                                actionHref="/ai-tools/business-plan"
                            />
                        )}
                    </AISectionCard>
                </View>

                <View className="mt-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                        How these workflows help
                    </Text>
                    <Text className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        Each workflow is designed to move you from a simple input step to a practical business output you can refine, save, and reuse.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
