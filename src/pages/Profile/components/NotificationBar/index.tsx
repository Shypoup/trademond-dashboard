import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils/core/cn';
import type { NotificationBarProps } from '../../utils/types';

/**
 * Animated notification bar for success/error feedback messages.
 */
export const NotificationBar: React.FC<NotificationBarProps> = ({ message, onDismiss }) => {
    const { t } = useTranslation();
    const isSuccess = message.type === 'success';

    return (
        <div className={cn(
            "p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 shadow-xl border-l-[6px]",
            isSuccess
                ? "bg-white text-emerald-800 border-emerald-500"
                : "bg-white text-rose-800 border-rose-500"
        )}>
            <div className={cn("p-2 rounded-full", isSuccess ? "bg-emerald-100" : "bg-rose-100")}>
                {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-wider mb-0.5">
                    {isSuccess ? t('common.success') : t('common.error')}
                </p>
                <p className="text-[13px] font-bold text-slate-600 leading-tight">{message.text}</p>
            </div>
            <button onClick={onDismiss} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};
