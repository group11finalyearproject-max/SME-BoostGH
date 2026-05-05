export type BusinessPlanSectionKey =
    | 'businessSummary'
    | 'targetMarket'
    | 'revenueModel'
    | 'operations'
    | 'nextActions';

export interface BusinessPlanSection {
    key: BusinessPlanSectionKey;
    title: string;
    content: string;
}

const SECTION_META: Array<{
    key: BusinessPlanSectionKey;
    title: string;
    patterns: RegExp[];
}> = [
    {
        key: 'businessSummary',
        title: 'Business Summary',
        patterns: [/business summary/i, /executive summary/i, /overview/i, /summary/i],
    },
    {
        key: 'targetMarket',
        title: 'Target Market',
        patterns: [/target market/i, /customers/i, /customer segment/i, /audience/i, /market/i],
    },
    {
        key: 'revenueModel',
        title: 'Revenue Model',
        patterns: [/revenue model/i, /revenue/i, /income/i, /pricing/i, /sales/i],
    },
    {
        key: 'operations',
        title: 'Operations',
        patterns: [/operations/i, /how it works/i, /delivery/i, /resources/i, /process/i],
    },
    {
        key: 'nextActions',
        title: 'Next 3 Actions',
        patterns: [/next 3 actions/i, /next steps/i, /action plan/i, /actions/i],
    },
];

const cleanText = (value: string) =>
    value
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const splitByHeadings = (value: string) => {
    const lines = cleanText(value).split('\n');
    const sections: Array<{ heading: string; body: string }> = [];
    let currentHeading = 'Business Summary';
    let currentBody: string[] = [];

    const pushCurrent = () => {
        const body = currentBody.join('\n').trim();
        if (body) {
            sections.push({ heading: currentHeading, body });
        }
    };

    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) {
            currentBody.push('');
            return;
        }

        const looksLikeHeading =
            /^([A-Z][A-Za-z0-9\s/&-]{2,}):?$/.test(trimmed) ||
            /^\d+\.\s+[A-Z]/.test(trimmed) ||
            /^[-*]\s+[A-Z][A-Za-z\s]{2,}:?$/.test(trimmed);

        if (looksLikeHeading) {
            pushCurrent();
            currentHeading = trimmed.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/:$/, '');
            currentBody = [];
            return;
        }

        currentBody.push(trimmed);
    });

    pushCurrent();
    return sections;
};

const mapHeadingToSectionKey = (heading: string): BusinessPlanSectionKey | undefined => {
    const match = SECTION_META.find((section) =>
        section.patterns.some((pattern) => pattern.test(heading))
    );
    return match?.key;
};

const fallbackSections = (raw: string): BusinessPlanSection[] => {
    const paragraphs = cleanText(raw)
        .split(/\n\s*\n/)
        .map((item) => item.trim())
        .filter(Boolean);

    const first = paragraphs[0] ?? raw.trim();
    const second = paragraphs[1] ?? 'Clarify who the business serves and what customer need it solves.';
    const third = paragraphs[2] ?? 'Describe how the business earns money, how it prices its offer, and how sales happen.';
    const fourth = paragraphs[3] ?? 'Explain what is needed to deliver the product or service consistently.';
    const fifth = paragraphs[4] ?? '1. Confirm your offer.\n2. Reach your target customers.\n3. Track sales and improve each week.';

    return [
        { key: 'businessSummary', title: 'Business Summary', content: first },
        { key: 'targetMarket', title: 'Target Market', content: second },
        { key: 'revenueModel', title: 'Revenue Model', content: third },
        { key: 'operations', title: 'Operations', content: fourth },
        { key: 'nextActions', title: 'Next 3 Actions', content: fifth },
    ];
};

export const getStructuredBusinessPlanSections = (raw: string): BusinessPlanSection[] => {
    const text = cleanText(raw);
    if (!text) return fallbackSections('');

    const splitSections = splitByHeadings(text);
    const mapped = new Map<BusinessPlanSectionKey, string>();

    splitSections.forEach((section) => {
        const key = mapHeadingToSectionKey(section.heading);
        if (key && !mapped.has(key)) {
            mapped.set(key, section.body);
        }
    });

    if (mapped.size < 3) {
        return fallbackSections(text);
    }

    return SECTION_META.map((meta) => ({
        key: meta.key,
        title: meta.title,
        content:
            mapped.get(meta.key) ??
            fallbackSections(text).find((item) => item.key === meta.key)?.content ??
            '',
    }));
};
