export interface MarketingVariant {
    id: string;
    title: string;
    description: string;
    content: string;
}

const cleanText = (value: string) =>
    value
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const fallbackTitles = [
    { title: 'Primary Version', description: 'A balanced version ready to use or adapt.' },
    { title: 'Short Version', description: 'A shorter version for quick posts or messages.' },
    { title: 'Promotional Version', description: 'A stronger sales-focused variation.' },
];

const splitByVariantHeadings = (raw: string) => {
    const sections = cleanText(raw).split(/\n(?=(?:variant|version|\d+\.)\s*)/i);

    return sections
        .map((section) => section.trim())
        .filter(Boolean)
        .map((section, index) => {
            const lines = section.split('\n');
            const firstLine = lines[0]?.trim() ?? '';
            const rest = lines.slice(1).join('\n').trim() || section;
            const headingMatch = firstLine.match(/^(?:variant|version|\d+\.)\s*[:.-]?\s*(.*)$/i);
            const title =
                headingMatch?.[1]?.trim() ||
                fallbackTitles[index]?.title ||
                `Version ${index + 1}`;

            return {
                id: `variant_${index + 1}`,
                title,
                description:
                    fallbackTitles[index]?.description ||
                    'A reusable marketing draft generated from your inputs.',
                content: rest,
            };
        });
};

const splitByParagraphs = (raw: string) =>
    cleanText(raw)
        .split(/\n\s*\n/)
        .map((item) => item.trim())
        .filter(Boolean);

export const getMarketingVariants = (raw: string): MarketingVariant[] => {
    const text = cleanText(raw);
    if (!text) return [];

    const headingVariants = splitByVariantHeadings(text).filter((item) => item.content.trim());
    if (headingVariants.length >= 2) {
        return headingVariants.slice(0, 3);
    }

    const paragraphs = splitByParagraphs(text);
    if (paragraphs.length >= 2) {
        return paragraphs.slice(0, 3).map((paragraph, index) => ({
            id: `variant_${index + 1}`,
            title: fallbackTitles[index]?.title || `Version ${index + 1}`,
            description:
                fallbackTitles[index]?.description ||
                'A reusable marketing draft generated from your inputs.',
            content: paragraph,
        }));
    }

    return fallbackTitles.map((meta, index) => ({
        id: `variant_${index + 1}`,
        title: meta.title,
        description: meta.description,
        content: text,
    }));
};
