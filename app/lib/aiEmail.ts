export interface StructuredEmailOutput {
    subjectLine: string;
    emailBody: string;
    suggestedCta: string;
}

const cleanText = (value: string) =>
    value
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const readSection = (raw: string, patterns: RegExp[]) => {
    for (const pattern of patterns) {
        const match = raw.match(pattern);
        if (match?.[1]?.trim()) return match[1].trim();
    }
    return '';
};

export const getStructuredEmailOutput = (
    raw: string,
    fallback: {
        emailType: string;
        recipient: string;
        desiredOutcome: string;
    }
): StructuredEmailOutput => {
    const text = cleanText(raw);

    const subjectLine = readSection(text, [
        /subject(?:\s*line)?\s*:\s*([\s\S]*?)(?=\n(?:email body|body|suggested cta|cta)\s*:|$)/i,
    ]);

    const emailBody = readSection(text, [
        /(?:email body|body)\s*:\s*([\s\S]*?)(?=\n(?:suggested cta|cta|subject(?:\s*line)?)\s*:|$)/i,
    ]);

    const suggestedCta = readSection(text, [
        /(?:suggested cta|cta)\s*:\s*([\s\S]*?)(?=\n(?:subject(?:\s*line)?|email body|body)\s*:|$)/i,
    ]);

    return {
        subjectLine:
            subjectLine ||
            `${fallback.emailType} for ${fallback.recipient || 'your contact'}`,
        emailBody: emailBody || text,
        suggestedCta:
            suggestedCta ||
            fallback.desiredOutcome ||
            'Invite the recipient to reply or confirm the next step.',
    };
};

export const formatStructuredEmailForEditing = (email: StructuredEmailOutput) => {
    return `Subject line:\n${email.subjectLine}\n\nEmail body:\n${email.emailBody}\n\nSuggested CTA:\n${email.suggestedCta}`;
};
