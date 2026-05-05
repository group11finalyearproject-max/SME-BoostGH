export interface StructuredAdvisorReply {
    summary: string;
    actionItems: string[];
    supportPoints: string[];
}

const clean = (value: string) =>
    value
        .replace(/\r/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

export const getStructuredAdvisorReply = (raw: string): StructuredAdvisorReply => {
    const text = clean(raw);
    if (!text) {
        return {
            summary: 'No response available yet.',
            actionItems: [],
            supportPoints: [],
        };
    }

    const paragraphs = text.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
    const lines = text.split('\n').map((item) => item.trim()).filter(Boolean);

    const bulletLines = lines
        .filter((line) => /^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line))
        .map((line) => line.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').trim());

    const summary = paragraphs[0] || lines[0] || text;

    const supportFromParagraphs = paragraphs.slice(1);
    const supportPoints = bulletLines.length > 0
        ? bulletLines.slice(0, 4)
        : supportFromParagraphs.flatMap((paragraph) =>
              paragraph
                  .split(/(?<=[.!?])\s+/)
                  .map((item) => item.trim())
                  .filter(Boolean)
          ).slice(0, 4);

    const actionKeywords = /(next|action|recommend|should|start|focus|follow up|review|improve|send)/i;
    const actionItems = supportPoints.filter((item) => actionKeywords.test(item)).slice(0, 3);
    const remainingSupport = supportPoints.filter((item) => !actionItems.includes(item)).slice(0, 3);

    return {
        summary,
        actionItems,
        supportPoints: remainingSupport,
    };
};
