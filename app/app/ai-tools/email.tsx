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
import { AIResultSectionCard } from '../../components/ai/AIResultSectionCard';
import { AISectionCard } from '../../components/ai/AISectionCard';
import { AIStateCard } from '../../components/ai/AIStateCard';
import { AIWorkflowHero } from '../../components/ai/AIWorkflowHero';
import {
    formatStructuredEmailForEditing,
    getStructuredEmailOutput,
} from '../../lib/aiEmail';
import { consumeWorkflowResume } from '../../services/aiWorkflowResume';
import { getAIContext } from '../../services/aiContext';
import { Analytics } from '../../services/analytics';

const inputClassName =
    'rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white';

const emailGoals = ['Inquiry', 'Follow-up', 'Thank You', 'Complaint', 'Proposal', 'Introduction'];
const tones = ['Professional', 'Warm', 'Friendly', 'Confident'];

export default function EmailGenerator() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [result, setResult] = useState('');
    const [editableResult, setEditableResult] = useState('');

    const [recipient, setRecipient] = useState('');
    const [emailType, setEmailType] = useState('Inquiry');
    const [tone, setTone] = useState('Professional');
    const [background, setBackground] = useState('');
    const [desiredOutcome, setDesiredOutcome] = useState('');

    const structuredOutput = useMemo(
        () =>
            getStructuredEmailOutput(editableResult || result, {
                emailType,
                recipient,
                desiredOutcome,
            }),
        [editableResult, result, emailType, recipient, desiredOutcome]
    );

    useFocusEffect(
        useCallback(() => {
            const loadResumeDraft = async () => {
                if (!user?.id) return;

                const resume = await consumeWorkflowResume(user.id, 'email');
                if (!resume) return;

                setEditableResult(resume.content);
                setResult(resume.content);
                setErrorMessage('');
                setSuccessMessage('Saved email draft loaded. Continue editing and save again when ready.');
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
        if (!recipient.trim() || !background.trim() || !desiredOutcome.trim()) {
            setErrorMessage('Add the recipient, background, and desired outcome so the assistant can draft a professional email.');
            return;
        }

        setLoading(true);
        resetFeedback();

        try {
            const aiContext = await getAIContext(user?.id);
            const content = await generateAIContent('email', {
                recipient,
                type: emailType,
                context: background,
                tone,
                desiredOutcome,
                businessProfile: aiContext,
                requested_sections: ['Subject line', 'Email body', 'Suggested CTA'],
                guidance:
                    'Write a professional email for a Ghanaian SME and clearly label Subject line, Email body, and Suggested CTA. Use clear business language and keep the next step specific.',
            });

            const structured = getStructuredEmailOutput(content, {
                emailType,
                recipient,
                desiredOutcome,
            });

            setResult(content);
            setEditableResult(formatStructuredEmailForEditing(structured));
            setSuccessMessage('Your email draft is ready. Review the subject, body, and CTA, then edit or save it.');
            await Analytics.logEvent('ai_email_generated', {
                email_type: emailType,
            });
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Failed to generate email. Please try again.');
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

            await saveDraft(user.id, 'email', `${emailType} to ${recipient}`, editableResult);
            setSaved(true);
            setSuccessMessage('Email draft saved. You can return to it later from Saved Drafts.');
            await Analytics.logEvent('ai_email_saved');
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
        setSuccessMessage('Email draft copied.');
        setTimeout(() => setCopied(false), 3000);
    };

    const handleShare = async () => {
        if (!editableResult.trim()) return;

        try {
            await Share.share({
                message: editableResult,
                title: `${emailType} to ${recipient}`,
            });
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Failed to share email draft.');
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
                        Email Draft
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1">
                <View className="px-5 pb-12 pt-6">
                    <AIWorkflowHero
                        eyebrow="Guided Workflow"
                        title="Draft a professional email with clearer intent"
                        description="Tell SME Boost GH who the message is for, what you want to achieve, and the tone you want. The assistant will organize the email into a subject, body, and CTA."
                    />

                    <View className="mt-6 gap-4">
                        <AISectionCard
                            title="Step 1: Recipient and goal"
                            description="Start with who the email is for and the type of message you want to send."
                        >
                            <AIFieldGroup
                                label="Recipient"
                                helper="Use the person's name, role, or organization."
                                example="Procurement manager at a local supermarket"
                            >
                                <TextInput
                                    className={inputClassName}
                                    value={recipient}
                                    onChangeText={(text) => {
                                        setRecipient(text);
                                        resetFeedback();
                                    }}
                                    placeholder="Who is this email for?"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </AIFieldGroup>

                            <AIFieldGroup
                                label="Email goal"
                                helper="Choose the kind of business email you want to write."
                            >
                                <View className="flex-row flex-wrap gap-2">
                                    {emailGoals.map((item) => (
                                        <TouchableOpacity
                                            key={item}
                                            onPress={() => {
                                                setEmailType(item);
                                                resetFeedback();
                                            }}
                                            className={`rounded-full border px-4 py-2 ${
                                                emailType === item
                                                    ? 'border-primary-600 bg-primary-600'
                                                    : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700'
                                            }`}
                                        >
                                            <Text
                                                className={`text-sm font-medium ${
                                                    emailType === item
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
                            title="Step 2: Tone and background"
                            description="This helps the assistant make the email sound right and include the right context."
                        >
                            <AIFieldGroup
                                label="Tone"
                                helper="Pick how formal or warm the email should feel."
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
                                                    ? 'border-emerald-500 bg-emerald-500'
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

                            <AIFieldGroup
                                label="Background"
                                helper="Explain the context the recipient needs to understand."
                                example="We met at a trade fair last week and I want to follow up on a supply partnership"
                            >
                                <TextInput
                                    className={`${inputClassName} min-h-[110px]`}
                                    value={background}
                                    onChangeText={(text) => {
                                        setBackground(text);
                                        resetFeedback();
                                    }}
                                    placeholder="What should the recipient know?"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                />
                            </AIFieldGroup>
                        </AISectionCard>

                        <AISectionCard
                            title="Step 3: Desired outcome"
                            description="Tell the assistant what action you want the email to drive."
                        >
                            <AIFieldGroup
                                label="Desired outcome"
                                helper="This becomes the call to action at the end of the email."
                                example="Ask them to confirm a meeting next Tuesday"
                            >
                                <TextInput
                                    className={`${inputClassName} min-h-[96px]`}
                                    value={desiredOutcome}
                                    onChangeText={(text) => {
                                        setDesiredOutcome(text);
                                        resetFeedback();
                                    }}
                                    placeholder="What should happen after they read the email?"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                />
                            </AIFieldGroup>
                        </AISectionCard>

                        <TouchableOpacity
                            className={`min-h-[56px] items-center justify-center rounded-3xl bg-emerald-500 px-4 py-4 ${
                                loading ? 'opacity-70' : 'active:opacity-90'
                            }`}
                            onPress={handleGenerate}
                            disabled={loading}
                        >
                            <Text className="text-base font-bold text-white">
                                {result ? 'Regenerate Email Draft' : 'Generate Email Draft'}
                            </Text>
                        </TouchableOpacity>

                        {!result && !loading && !errorMessage ? (
                            <AIStateCard
                                title="What you will get"
                                description="SME Boost GH will prepare a cleaner email draft with a subject line, email body, and suggested call to action."
                                tone="neutral"
                            />
                        ) : null}

                        {loading ? (
                            <AIStateCard
                                title="Drafting your email"
                                description="The assistant is organizing your email into a professional subject line, body, and next-step CTA."
                                tone="loading"
                            />
                        ) : null}

                        {errorMessage ? (
                            <AIStateCard
                                title="Could not draft the email"
                                description={errorMessage}
                                tone="error"
                            />
                        ) : null}

                        {successMessage && !loading ? (
                            <AIStateCard
                                title="Email workflow updated"
                                description={successMessage}
                                tone="success"
                            />
                        ) : null}

                        {editableResult ? (
                            <>
                                <AISectionCard
                                    title="Structured email"
                                    description="Review each part of the email before you edit or save the full draft."
                                >
                                    <View className="gap-3">
                                        <AIResultSectionCard
                                            title="Subject line"
                                            content={structuredOutput.subjectLine}
                                        />
                                        <AIResultSectionCard
                                            title="Email body"
                                            content={structuredOutput.emailBody}
                                        />
                                        <AIResultSectionCard
                                            title="Suggested CTA"
                                            content={structuredOutput.suggestedCta}
                                        />
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
