import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils/core/cn';

/** Props for the StatusBadge component */
interface StatusBadgeProps {
    published?: boolean;
}

/**
 * Displays a published/draft status badge with contextual color styling.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ published }) => {
    const { t } = useTranslation();

    return (
        <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
            published
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-amber-50 text-amber-600 border-amber-100"
        )}>
            {published ? t('profile.publish') : t('profile.draft')}
        </span>
    );
};
