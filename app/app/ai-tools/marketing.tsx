import { useMemo, useState, useCallback } from 'react';
import {
    Clipboard,
    ScrollView,
    Share,
    Text,
    TextInput,
    TouchableOpacity,
    View,
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
import { AISectionCard } from '../../components/ai/AISectionCard';
import { AIStateCard } from '../../components/ai/AIStateCard';
import { AIWorkflowHero } from '../../components/ai/AIWorkflowHero';
import { AIVariantCard } from '../../components/ai/AIVariantCard';
import { getMarketingVariants } from '../../lib/aiMarketing';
import { consumeWorkflowResume } from '../../services/aiWorkflowResume';
import { getAIContext } from '../../services/aiContext';
import { Analytics } from '../../services/analytics';

const inputClassName =
    'rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white';

const channels = ['Social Media Post', 'Advertisement', 'Flyer Text', 'Promotional Message'];
const tones = ['Friendly', 'Bold', 'Professional', 'Warm'];

export default function MarketingGenerator() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [result, setResult] = useState('');
    const [editableResult, setEditableResult] = useState('');
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

    const [offerName, setOfferName] = useState('');
    const [offerDetails, setOfferDetails] = useState('');
    const [audience, setAudience] = useState('');
    const [channel, setChannel] = useState('Social Media Post');
    const [goal, setGoal] = useState('');
    const [tone, setTone] = useState('Friendly');

    const variants = useMemo(() => getMarketingVariants(result), [result]);

    useFocusEffect(
        useCallback(() => {
            const loadResumeDraft = async () => {
                if (!user?.id) return;

                const resume = await consumeWorkflowResume(user.id, 'marketing');
                if (!resume) return;

                setEditableResult(resume.content);
                setOfferName((prev) => prev || resume.title);
                setResult('');
                setSelectedVariantId(null);
                setErrorMessage('');
                setSuccessMessage('Saved marketing draft loaded. Continue editing and save again when ready.');
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

    const combinedDescription = [
        offerDetails.trim() && `Offer details: ${offerDetails.trim()}`,
        audience.trim() && `Audience: ${audience.trim()}`,
        goal.trim() && `Goal: ${goal.trim()}`,
        tone.trim() && `Tone: ${tone.trim()}`,
    ]
        .filter(Boolean)
        .join('\n');

    const handleGenerate = async () => {
        if (!offerName.trim() || !offerDetails.trim() || !audience.trim() || !goal.trim()) {
            setErrorMessage('Add your offer, audience, and campaign goal so the assistant can create useful marketing drafts.');
            return;
        }

        setLoading(true);
        resetFeedback();

        try {
            const aiContext = await getAIContext(user?.id);
            const content = await generateAIContent('marketing', {
                productName: offerName,
                contentType: channel,
                description: combinedDescription,
                audience,
                goal,
                tone,
                businessProfile: aiContext,
                requested_variants: [
                    'Primary version',
                    'Short version',
                    'Promotional version',
                ],
                guidance:
                    'Create 3 clearly labeled marketing variants for a Ghanaian SME. Keep each version practical, readable, and ready to use. Make the call to action clear and believable.',
            });

            const parsedVariants = getMarketingVariants(content);
            const firstVariant = parsedVariants[0];

            setResult(content);
            setSelectedVariantId(firstVariant?.id ?? null);
            setEditableResult(firstVariant?.content ?? content);
            setSuccessMessage('Your marketing drafts are ready. Compare the versions below and choose one to edit or save.');
            await Analytics.logEvent('ai_marketing_generated', {
                channel,
            });
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Failed to generate marketing content. Please try again.');
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

            await saveDraft(user.id, 'marketing', `${channel} - ${offerName}`, editableResult);
            setSaved(true);
            setSuccessMessage('Marketing draft saved. You can continue working on it later from Saved Drafts.');
            await Analytics.logEvent('ai_marketing_saved');
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
        setSuccessMessage('Selected marketing draft copied.');
        setTimeout(() => setCopied(false), 3000);
    };

    const handleShare = async () => {
        if (!editableResult.trim()) return;

        try {
            await Share.share({
                message: `${channel} - ${offerName}\n\n${editableResult}`,
                title: `${channel} - ${offerName}`,
            });
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Failed to share marketing draft.');
        }
    };

    const handleUseVariant = (variantId: string, content: string) => {
        setSelectedVariantId(variantId);
        setEditableResult(content);
        setSaved(false);
        setSuccessMessage('This version is now ready for editing, saving, or sharing.');
    };

    const handleCopyVariant = (content: string) => {
        Clipboard.setString(content);
        setSuccessMessage('Variant copied.');
    };

    const handleShareVariant = async (content: string) => {
        try {
            await Share.share({
                message: `${channel} - ${offerName}\n\n${content}`,
                title: `${channel} - ${offerName}`,
            });
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Failed to share variant.');
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
                        Marketing Content
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1">
                <View className="px-5 pb-12 pt-6">
                    <AIWorkflowHero
                        eyebrow="Guided Workflow"
                        title="Create marketing messages you can use right away"
                        description="Tell SME Boost GH what you are offering, who you want to reach, and what result you want. The assistant will create multiple practical versions for you."
                    />

                    <View className="mt-6 gap-4">
                        <AISectionCard
                            title="Step 1: Offer"
                            description="Start with the product or service you want to promote."
                        >
                            <AIFieldGroup
                                label="Offer name"
                                helper="Use the product or service name customers recognize."
                                example="Weekend catering package"
                            >
                                <TextInput
                                    className={inputClassName}
                                    value={offerName}
                                    onChangeText={(text) => {
                                        setOfferName(text);
                                        resetFeedback();
                                    }}
                                    placeholder="What are you promoting?"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </AIFieldGroup>

                            <AIFieldGroup
                                label="Offer details"
                                helper="Explain the value, benefit, or key selling point."
                                example="Affordable buffet catering for birthdays, office events, and church programs"
                            >
                                <TextInput
                                    className={`${inputClassName} min-h-[96px]`}
                                    value={offerDetails}
                                    onChangeText={(text) => {
                                        setOfferDetails(text);
                                        resetFeedback();
                                    }}
                                    placeholder="Why should people care about this offer?"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                />
                            </AIFieldGroup>
                        </AISectionCard>

                        <AISectionCard
                            title="Step 2: Audience and channel"
                            description="This helps the assistant match the message to the right people and format."
                        >
                            <AIFieldGroup
                                label="Audience"
                                helper="Describe who should see this message."
                                example="Working parents in Kumasi who need reliable school transport"
                            >
                                <TextInput
                                    className={`${inputClassName} min-h-[96px]`}
                                    value={audience}
                                    onChangeText={(text) => {
                                        setAudience(text);
                                        resetFeedback();
                                    }}
                                    placeholder="Who is this message for?"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                />
                            </AIFieldGroup>

                            <AIFieldGroup
                                label="Channel"
                                helper="Choose the format you want the assistant to write for."
                            >
                                <View className="flex-row flex-wrap gap-2">
                                    {channels.map((item) => (
                                        <TouchableOpacity
                                            key={item}
                                            onPress={() => {
                                                setChannel(item);
                                                resetFeedback();
                                            }}
                                            className={`rounded-full border px-4 py-2 ${
                                                channel === item
                                                    ? 'border-amber-500 bg-amber-500'
                                                    : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700'
                                            }`}
                                        >
                                            <Text
                                                className={`text-sm font-medium ${
                                                    channel === item
                                                        ? 'text-white'
                                                        : 'text-gray-700 dark:text-gray-200'
                                                }`}
                                            >
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </AIFieldGroup>
                        </AISectionCard>

                        <AISectionCard
                            title="Step 3: Goal and tone"
                            description="Set the result you want and the voice that best suits your audience."
                        >
                            <AIFieldGroup
                                label="Goal"
                                helper="Tell the assistant what action you want the audience to take."
                                example="Increase WhatsApp inquiries for Easter orders"
                            >
                                <TextInput
                                    className={`${inputClassName} min-h-[96px]`}
                                    value={goal}
                                    onChangeText={(text) => {
                                        setGoal(text);
                                        resetFeedback();
                                    }}
                                    placeholder="What should this message achieve?"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                />
                            </AIFieldGroup>

                            <AIFieldGroup
                                label="Tone"
                                helper="Choose the style you want the message to sound like."
                            >
                                <View className="flex-row flex-wrap gap-2">
                                    {tones.map((item) => (
                                        <TouchableOpacity
                                            key={item}
                                            onPress={() => {
                                                setTone(item);
                                                resetFeedback();
                                            }}
                                            className={`rounded-full border px-4 py-2 ${
                                                tone === item
                                                    ? 'border-primary-600 bg-primary-600'
                                                    : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700'
                                            }`}
                                        >
                                            <Text
                                                className={`text-sm font-medium ${
                                                    tone === item
                                                        ? 'text-white'
                                                        : 'text-gray-700 dark:text-gray-200'
                                                }`}
                                            >
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </AIFieldGroup>
                        </AISectionCard>

                        <TouchableOpacity
                            className={`min-h-[56px] items-center justify-center rounded-3xl bg-amber-500 px-4 py-4 ${
                                loading ? 'opacity-70' : 'active:opacity-90'
                            }`}
                            onPress={handleGenerate}
                            disabled={loading}
                        >
                            <Text className="text-base font-bold text-white">
                                {result ? 'Regenerate Marketing Variants' : 'Generate Marketing Variants'}
                            </Text>
                        </TouchableOpacity>

                        {!result && !loading && !errorMessage ? (
                            <AIStateCard
                                title="What you will get"
                                description="SME Boost GH will prepare 2 to 3 practical versions you can compare, choose from, and refine before saving or sharing."
                                tone="neutral"
                            />
                        ) : null}

                        {loading ? (
                            <AIStateCard
                                title="Creating your marketing drafts"
                                description="The assistant is writing multiple versions so you can choose the one that best fits your audience and channel."
                                tone="loading"
                            />
                        ) : null}

                        {errorMessage ? (
                            <AIStateCard
                                title="Could not create marketing drafts"
                                description={errorMessage}
                                tone="error"
                            />
                        ) : null}

                        {successMessage && !loading ? (
                            <AIStateCard
                                title="Marketing workflow updated"
                                description={successMessage}
                                tone="success"
                            />
                        ) : null}

                        {variants.length > 0 || editableResult ? (
                            <>
                                {variants.length > 0 ? (
                                    <AISectionCard
                                        title="Choose a version"
                                        description="Compare the variants below, then choose one to edit, save, or share."
                                    >
                                        <View className="gap-3">
                                            {variants.map((variant) => (
                                                <AIVariantCard
                                                    key={variant.id}
                                                    title={variant.title}
                                                    description={variant.description}
                                                    content={variant.content}
                                                    selected={selectedVariantId === variant.id}
                                                    onUse={() => handleUseVariant(variant.id, variant.content)}
                                                    onCopy={() => handleCopyVariant(variant.content)}
                                                    onShare={() => handleShareVariant(variant.content)}
                                                />
                                            ))}
                                        </View>
                                    </AISectionCard>
                                ) : null}

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
