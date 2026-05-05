import React from 'react';
import { LucideIcon } from 'lucide-react-native';
import { AppStateCard } from '../ui/AppStateCard';

type Tone = 'neutral' | 'loading' | 'error' | 'success';

interface AIStateCardProps {
    title: string;
    description: string;
    tone?: Tone;
    actionLabel?: string;
    actionHref?: string;
    icon?: LucideIcon;
}

export const AIStateCard: React.FC<AIStateCardProps> = ({
    title,
    description,
    tone = 'neutral',
    actionLabel,
    actionHref,
    icon,
}) => {
    return (
        <AppStateCard
            title={title}
            description={description}
            tone={tone}
            actionLabel={actionLabel}
            actionHref={actionHref}
            icon={icon}
        />
    );
};
