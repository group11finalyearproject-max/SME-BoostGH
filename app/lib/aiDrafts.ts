import { Draft, DraftType } from '../services/drafts';

export const getDraftRoute = (type: DraftType) => {
    switch (type) {
        case 'business_plan':
            return '/ai-tools/business-plan';
        case 'marketing':
            return '/ai-tools/marketing';
        case 'email':
            return '/ai-tools/email';
        default:
            return '/ai-tools';
    }
};

export const getDraftContinueLabel = (type: DraftType) => {
    switch (type) {
        case 'business_plan':
            return 'Continue business plan';
        case 'marketing':
            return 'Continue marketing draft';
        case 'email':
            return 'Continue email draft';
        default:
            return 'Continue work';
    }
};

export const getDraftPreview = (draft: Draft) => {
    const content = draft.content.replace(/\s+/g, ' ').trim();
    if (!content) return 'No preview available.';

    if (draft.type === 'email') {
        const subjectMatch = content.match(/Subject line:\s*([\s\S]*?)(?:Email body:|$)/i);
        const bodyMatch = content.match(/Email body:\s*([\s\S]*?)(?:Suggested CTA:|$)/i);
        return [subjectMatch?.[1]?.trim(), bodyMatch?.[1]?.trim()]
            .filter(Boolean)
            .join(' - ')
            .slice(0, 180);
    }

    return content.slice(0, 180);
};

export const groupDraftsByType = (drafts: Draft[]) => {
    const grouped: Record<DraftType, Draft[]> = {
        business_plan: [],
        marketing: [],
        email: [],
    };

    drafts.forEach((draft) => {
        grouped[draft.type].push(draft);
    });

    return grouped;
};
