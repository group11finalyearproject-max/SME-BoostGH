import { useState, useCallback } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Share,
    Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useFocusEffect } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { generateAIContent } from '../../services/ai';
import { saveDraft } from '../../services/drafts';
import { AIActionBar } from '../../components/ai/AIActionBar';
import { AIEditableOutputCard } from '../../components/ai/AIEditableOutputCard';
import { AIFieldGroup } from '../../components/ai/AIFieldGroup';
import { AIResultSectionCard } from '../../components/ai/AIResultSectionCard';
import { AISectionCard } from '../../components/ai/AISectionCard';
import { AIStateCard } from '../../components/ai/AIStateCard';
import { AIWorkflowHero } from '../../components/ai/AIWorkflowHero';
import { getStructuredBusinessPlanSections } from '../../lib/aiBusinessPlan';
import { consumeWorkflowResume } from '../../services/aiWorkflowResume';
import { getAIContext } from '../../services/aiContext';
import { Analytics } from '../../services/analytics';

const inputClassName =
    'rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white';

const requiredSections = [
    'Business summary',
    'Target market',
    'Revenue model',
    'Operations',
    'Next 3 actions',
];

export default function BusinessPlanGenerator() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [result, setResult] = useState('');
    const [editableResult, setEditableResult] = useState('');

    const [businessName, setBusinessName] = useState('');
    const [industry, setIndustry] = useState('');
    const [customerType, setCustomerType] = useState('');
    const [offer, setOffer] = useState('');
    const [revenueApproach, setRevenueApproach] = useState('');
    const [operations, setOperations] = useState('');
    const [businessGoal, setBusinessGoal] = useState('');

    const structuredSections = editableResult
        ? getStructuredBusinessPlanSections(editableResult)
        : [];

    useFocusEffect(
        useCallback(() => {
            const loadResumeDraft = async () => {
                if (!user?.id) return;

                const resume = await consumeWorkflowResume(user.id, 'business_plan');
                if (!resume) return;

                setEditableResult(resume.content);
                setResult(resume.content);
                setBusinessName((prev) => prev || resume.title);
                setErrorMessage('');
                setSuccessMessage('Saved business plan loaded. Continue editing and save again when ready.');
            };

            void loadResumeDraft();
        }, [user?.id])
    );

    const resetFeedback = () => {
        setErrorMessage('');
        setSuccessMessage('');
        setSaved(false);
        setCopied(false);
    };

    const handleGenerate = async () => {
        if (!businessName.trim() || !industry.trim() || !offer.trim() || !businessGoal.trim()) {
            setErrorMessage('Add your business name, industry, offer, and current goal so the assistant can produce a useful plan.');
            return;
        }

        setLoading(true);
        resetFeedback();

        try {
            const aiContext = await getAIContext(user?.id);
            const content = await generateAIContent('business_plan', {
                businessName,
                industry,
                customerType,
                offer,
                revenueApproach,
                operations,
                businessGoal,
                businessProfile: aiContext,
                requested_sections: requiredSections,
                guidance:
                    'Write a practical business plan for a Ghanaian SME. Keep the writing clear, concise, structured, and action-focused. Use simple language and include practical next steps.',
            });

            setResult(content);
            setEditableResult(content);
            setSuccessMessage('Your draft business plan is ready. Review each section, then edit or save it.');
            await Analytics.logEvent('ai_business_plan_generated');
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Failed to generate your business plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editableResult.trim()) return;

        setSaving(true);
        setErrorMessage('');

        try {
            if (!user?.id) {
                throw new Error('Sign in again before saving drafts.');
            }

            await saveDraft(user.id, 'business_plan', businessName || 'Business Plan', editableResult);
            setSaved(true);
            setSuccessMessage('Business plan saved. You can continue working on it later from Saved Drafts.');
            await Analytics.logEvent('ai_business_plan_saved');
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Failed to save draft.');
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = () => {
        if (!editableResult.trim()) return;

        Clipboard.setString(editableResult);
        setCopied(true);
        setSuccessMessage('Business plan copied. You can paste it into another document or message.');
        setTimeout(() => setCopied(false), 3000);
    };

    const handleShare = async () => {
        if (!editableResult.trim()) return;

        try {
            await Share.share({
                message: `Business Plan - ${businessName}\n\n${editableResult}`,
                title: `Business Plan - ${businessName}`,
            });
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Failed to share business plan.');
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
                        Business Plan
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1">
                <View className="px-5 pb-12 pt-6">
                    <AIWorkflowHero
                        eyebrow="Guided Workflow"
                        title="Turn your business idea into a clear plan"
                        description="Answer a few practical questions and SME Boost GH will organize your plan into a format you can review, edit, save, and reuse."
                    />

                    <View className="mt-6 gap-4">
                        <AISectionCard
                            title="Step 1: Business basics"
                            description="Start with the core identity of the business so the assistant understands what you do."
                        >
                            <AIFieldGroup
                                label="Business name"
                                helper="Use the name customers know or the name you plan to trade with."
                                example="Ama's Catering Services"
                            >
                                <TextInput
                                    className={inputClassName}
                                    value={businessName}
                                    onChangeText={(text) => {
                                        setBusinessName(text);
                                        resetFeedback();
                                    }}
                                    placeholder="Enter your business name"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </AIFieldGroup>

                            <AIFieldGroup
                                label="Industry"
                                helper="Describe the type of business you run."
                                example="Retail, catering, farming, transport, beauty, tailoring"
                            >
                                <TextInput
                                    className={inputClassName}
                                    value={industry}
                                    onChangeText={(text) => {
                                        setIndustry(text);
                                        resetFeedback();
                                    }}
                                    placeholder="What industry are you in?"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </AIFieldGroup>
                        </AISectionCard>

                        <AISectionCard
                            title="Step 2: Customer and market"
                            description="Explain who you serve so the plan can reflect the right market opportunity."
                        >
                            <AIFieldGroup
                                label="Target customer"
                                helper="Describe who is most likely to buy from you."
                                example="Busy office workers in Accra who need affordable lunch delivery"
                            >
                                <TextInput
                                    className={`${inputClassName} min-h-[96px]`}
                                    value={customerType}
                                    onChangeText={(text) => {
                                        setCustomerType(text);
                                        resetFeedback();
                                    }}
                                    placeholder="Who is your customer?"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                />
                            </AIFieldGroup>
                        </AISectionCard>

                        <AISectionCard
                            title="Step 3: Offer and income"
                            description="Describe what you sell and how the business earns money."
                        >
                            <AIFieldGroup
                                label="What do you sell?"
                                helper="List the product or service and the value it gives customers."
                                example="Fresh daily meals for office teams and small events"
                            >
                                <TextInput
                                    className={`${inputClassName} min-h-[96px]`}
                                    value={offer}
                                    onChangeText={(text) => {
                                        setOffer(text);
                                        resetFeedback();
                                    }}
                                    placeholder="Describe your offer"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                />
                            </AIFieldGroup>

                            <AIFieldGroup
                                label="How do you make money?"
                                helper="Explain pricing, payment style, or the main way revenue comes in."
                                example="Customers pay per meal, with larger orders coming from weekly office contracts"
                            >
                                <TextInput
                                    className={`${inputClassName} min-h-[96px]`}
                                    value={revenueApproach}
                                    onChangeText={(text) => {
                                        setRevenueApproach(text);
                                        resetFeedback();
                                    }}
                                    placeholder="Describe your revenue model"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                />
                            </AIFieldGroup>
                        </AISectionCard>

                        <AISectionCard
                            title="Step 4: Operations and current goal"
                            description="This helps the assistant shape a plan that is practical for the way you actually run the business."
                        >
                            <AIFieldGroup
                                label="How does the business operate?"
                                helper="Mention staff, tools, suppliers, delivery, or any key process."
                                example="We prepare meals each morning, deliver with one rider, and buy ingredients from Makola Market"
                            >
                                <TextInput
                                    className={`${inputClassName} min-h-[96px]`}
                                    value={operations}
                                    onChangeText={(text) => {
                                        setOperations(text);
                                        resetFeedback();
                                    }}
                                    placeholder="Describe how the business runs"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                />
                            </AIFieldGroup>

                            <AIFieldGroup
                                label="Current challenge or growth goal"
                                helper="Tell SME Boost GH what the plan should help you improve next."
                                example="I want to attract more repeat customers and increase weekly sales"
                            >
                                <TextInput
                                    className={`${inputClassName} min-h-[110px]`}
                                    value={businessGoal}
                                    onChangeText={(text) => {
                                        setBusinessGoal(text);
                                        resetFeedback();
                                    }}
                                    placeholder="What do you want to improve or achieve next?"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                />
                            </AIFieldGroup>
                        </AISectionCard>

                        <TouchableOpacity
                            className={`min-h-[56px] items-center justify-center rounded-3xl bg-primary-600 px-4 py-4 ${
                                loading ? 'opacity-70' : 'active:opacity-90'
                            }`}
                            onPress={handleGenerate}
                            disabled={loading}
                        >
                            <Text className="text-base font-bold text-white">
                                {result ? 'Regenerate Business Plan' : 'Generate Business Plan'}
                            </Text>
                        </TouchableOpacity>

                        {!result && !loading && !errorMessage ? (
                            <AIStateCard
                                title="What you will get"
                                description="Your plan will be organized into a business summary, target market, revenue model, operations, and next 3 actions so it is easier to review and use."
                                tone="neutral"
                            />
                        ) : null}

                        {loading ? (
                            <AIStateCard
                                title="Building your business plan"
                                description="SME Boost GH is organizing your details into a clear business plan with practical next actions."
                                tone="loading"
                            />
                        ) : null}

                        {errorMessage ? (
                            <AIStateCard
                                title="Could not complete your plan"
                                description={errorMessage}
                                tone="error"
                            />
                        ) : null}

                        {successMessage && !loading ? (
                            <AIStateCard
                                title="Business plan updated"
                                description={successMessage}
                                tone="success"
                            />
                        ) : null}

                        {editableResult ? (
                            <>
                                <AISectionCard
                                    title="Structured plan"
                                    description="Review each section first, then make edits below if you want to refine the wording."
                                >
                                    <View className="gap-3">
                                        {structuredSections.map((section) => (
                                            <AIResultSectionCard
                                                key={section.key}
                                                title={section.title}
                                                content={section.content}
                                            />
                                        ))}
                                    </View>
                                </AISectionCard>

                                <AIEditableOutputCard
                                    value={editableResult}
                                    onChangeText={(text) => {
                                        setEditableResult(text);
                                        setSaved(false);
                                        setSuccessMessage('');
                                    }}
                                />

                                <AIActionBar
                                    onRegenerate={handleGenerate}
                                    onSave={handleSave}
                                    onCopy={handleCopy}
                                    onShare={handleShare}
                                    loading={loading}
                                    saving={saving}
                                    saved={saved}
                                    copied={copied}
                                />
                            </>
                        ) : null}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
