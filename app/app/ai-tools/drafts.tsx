import { useCallback, useState } from 'react';
import { Clipboard, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useFocusEffect } from 'expo-router';
import { ArrowLeft, BookOpen } from 'lucide-react-native';
import { AIStateCard } from '../../components/ai/AIStateCard';
import { AIWorkflowHero } from '../../components/ai/AIWorkflowHero';
import { AIDraftGroupSection } from '../../components/ai/AIDraftGroupSection';
import { AIDraftMemoryCard } from '../../components/ai/AIDraftMemoryCard';
import { deleteDraft, Draft, getDraftTypeLabel, loadDrafts } from '../../services/drafts';
import { getDraftContinueLabel, getDraftPreview, getDraftRoute, groupDraftsByType } from '../../lib/aiDrafts';
import { saveWorkflowResume } from '../../services/aiWorkflowResume';
import { confirmDestructiveAction } from '../../services/confirm';

const TYPE_THEME = {
    business_plan: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
        description: 'Plans you can keep refining as the business grows.',
    },
    marketing: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-300',
        description: 'Promotional drafts ready to reuse and improve.',
    },
    email: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        description: 'Professional email drafts you can reopen and send later.',
    },
} as const;

const SHARE_PREFIX = {
    business_plan: 'Business Plan',
    marketing: 'Marketing Content',
    email: 'Email Draft',
} as const;

export default function Drafts() {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useFocusEffect(
        useCallback(() => {
            const fetchDrafts = async () => {
                setLoading(true);
                setErrorMessage('');
                try {
                    const data = await loadDrafts();
                    setDrafts(data);
                } catch (error: any) {
                    setErrorMessage(error?.message ?? 'Failed to load drafts.');
                } finally {
                    setLoading(false);
                }
            };

            fetchDrafts();
        }, [])
    );

    const handleDelete = (draft: Draft) => {
        confirmDestructiveAction({
            title: 'Delete draft',
            message: `Delete "${draft.title}" from your saved AI work? This cannot be undone.`,
            confirmLabel: 'Delete',
            onConfirm: async () => {
                try {
                    await deleteDraft(draft.id);
                    setDrafts((prev) => prev.filter((item) => item.id !== draft.id));
                    setSuccessMessage('Draft deleted.');
                    setErrorMessage('');
                } catch (error: any) {
                    setErrorMessage(error?.message ?? 'Failed to delete draft.');
                }
            },
        });
    };

    const handleCopy = (draft: Draft) => {
        Clipboard.setString(draft.content);
        setSuccessMessage(`Copied "${draft.title}".`);
        setErrorMessage('');
    };

    const handleShare = async (draft: Draft) => {
        try {
            await Share.share({
                message: `${SHARE_PREFIX[draft.type]} - ${draft.title}\n\n${draft.content}`,
                title: draft.title,
            });
            setSuccessMessage(`Shared "${draft.title}".`);
            setErrorMessage('');
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Failed to share draft.');
        }
    };

    const handleContinue = async (draft: Draft) => {
        await saveWorkflowResume(draft.type, {
            title: draft.title,
            content: draft.content,
        });
        setSuccessMessage(`Reopening "${draft.title}" in its workflow.`);
        setErrorMessage('');
        router.push(getDraftRoute(draft.type) as never);
    };

    const grouped = groupDraftsByType(drafts);

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            <View className="border-b border-gray-100 bg-white px-4 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2">
                        <ArrowLeft size={24} color="#6B7280" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">
                        Saved Drafts
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1">
                <View className="px-5 pb-12 pt-6">
                    <AIWorkflowHero
                        eyebrow="Working Memory"
                        title="Return to your AI work and keep improving it"
                        description="Saved drafts are organized by workflow so you can quickly find what you created, review the preview, and continue editing inside the right AI tool."
                    />

                    <View className="mt-6">
                        {errorMessage ? (
                            <View className="mb-4">
                                <AIStateCard
                                    title="Drafts need another try"
                                    description={errorMessage}
                                    tone="error"
                                />
                            </View>
                        ) : null}

                        {successMessage && !loading ? (
                            <View className="mb-4">
                                <AIStateCard
                                    title="Drafts updated"
                                    description={successMessage}
                                    tone="success"
                                />
                            </View>
                        ) : null}

                        {loading ? (
                            <AIStateCard
                                title="Loading saved drafts"
                                description="SME Boost GH is organizing your previous AI work so you can continue from where you left off."
                                tone="loading"
                            />
                        ) : drafts.length === 0 ? (
                            <View className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <View className="items-center">
                                    <View className="rounded-full bg-gray-100 p-5 dark:bg-gray-700">
                                        <BookOpen size={36} color="#9CA3AF" />
                                    </View>
                                    <Text className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                                        No saved drafts yet
                                    </Text>
                                    <Text className="mt-2 text-center text-sm leading-6 text-gray-500 dark:text-gray-400">
                                        Save a business plan, marketing draft, or email draft and it will appear here as reusable working memory.
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <>
                                {grouped.business_plan.length > 0 ? (
                                    <AIDraftGroupSection
                                        title="Business Plans"
                                        description={TYPE_THEME.business_plan.description}
                                        count={grouped.business_plan.length}
                                    >
                                        {grouped.business_plan.map((draft) => (
                                            <AIDraftMemoryCard
                                                key={draft.id}
                                                title={draft.title}
                                                subtitle={`${getDraftTypeLabel(draft.type)} • ${draft.date}`}
                                                preview={getDraftPreview(draft)}
                                                accentBgClassName={TYPE_THEME.business_plan.bg}
                                                accentTextClassName={TYPE_THEME.business_plan.text}
                                                continueLabel={getDraftContinueLabel(draft.type)}
                                                onContinue={() => handleContinue(draft)}
                                                onCopy={() => handleCopy(draft)}
                                                onShare={() => handleShare(draft)}
                                                onDelete={() => handleDelete(draft)}
                                            />
                                        ))}
                                    </AIDraftGroupSection>
                                ) : null}

                                {grouped.marketing.length > 0 ? (
                                    <AIDraftGroupSection
                                        title="Marketing Drafts"
                                        description={TYPE_THEME.marketing.description}
                                        count={grouped.marketing.length}
                                    >
                                        {grouped.marketing.map((draft) => (
                                            <AIDraftMemoryCard
                                                key={draft.id}
                                                title={draft.title}
                                                subtitle={`${getDraftTypeLabel(draft.type)} • ${draft.date}`}
                                                preview={getDraftPreview(draft)}
                                                accentBgClassName={TYPE_THEME.marketing.bg}
                                                accentTextClassName={TYPE_THEME.marketing.text}
                                                continueLabel={getDraftContinueLabel(draft.type)}
                                                onContinue={() => handleContinue(draft)}
                                                onCopy={() => handleCopy(draft)}
                                                onShare={() => handleShare(draft)}
                                                onDelete={() => handleDelete(draft)}
                                            />
                                        ))}
                                    </AIDraftGroupSection>
                                ) : null}

                                {grouped.email.length > 0 ? (
                                    <AIDraftGroupSection
                                        title="Email Drafts"
                                        description={TYPE_THEME.email.description}
                                        count={grouped.email.length}
                                    >
                                        {grouped.email.map((draft) => (
                                            <AIDraftMemoryCard
                                                key={draft.id}
                                                title={draft.title}
                                                subtitle={`${getDraftTypeLabel(draft.type)} • ${draft.date}`}
                                                preview={getDraftPreview(draft)}
                                                accentBgClassName={TYPE_THEME.email.bg}
                                                accentTextClassName={TYPE_THEME.email.text}
                                                continueLabel={getDraftContinueLabel(draft.type)}
                                                onContinue={() => handleContinue(draft)}
                                                onCopy={() => handleCopy(draft)}
                                                onShare={() => handleShare(draft)}
                                                onDelete={() => handleDelete(draft)}
                                            />
                                        ))}
                                    </AIDraftGroupSection>
                                ) : null}
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
