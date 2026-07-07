import React from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';
import { cn } from '@utils/core/cn';
import type { TransferPreviewAccount, PreviousOwnerAction } from '../../utils/transferHelpers';

/** Visual variant for inline notices. */
export type TransferNoticeKind = 'blocker' | 'warning' | 'info';

/** Props for the {@link TransferNotice} component. */
export interface TransferNoticeProps {
    kind: TransferNoticeKind;
    title?: string;
    children: React.ReactNode;
}

/**
 * Inline notice for blockers, warnings, and informational messages.
 * Uses icon + text so status is not conveyed by color alone.
 */
export const TransferNotice: React.FC<TransferNoticeProps> = ({ kind, title, children }) => {
    const styles: Record<TransferNoticeKind, { wrap: string; icon: string; title: string }> = {
        blocker: {
            wrap: 'border-destructive/30 bg-destructive/10',
            icon: 'text-destructive',
            title: 'text-destructive',
        },
        warning: {
            wrap: 'border-amber-500/30 bg-amber-500/10',
            icon: 'text-amber-600 dark:text-amber-400',
            title: 'text-amber-700 dark:text-amber-300',
        },
        info: {
            wrap: 'border-primary/30 bg-primary/10',
            icon: 'text-primary',
            title: 'text-primary',
        },
    };
    const s = styles[kind];
    const Icon = kind === 'info' ? Info : AlertCircle;

    return (
        <div role="note" className={cn('flex gap-3 rounded-xl border px-4 py-3.5', s.wrap)}>
            <Icon className={cn('mt-0.5 h-[18px] w-[18px] shrink-0', s.icon)} aria-hidden />
            <div className="min-w-0 flex-1">
                {title && (
                    <p className={cn('mb-1 text-xs font-extrabold uppercase tracking-wide', s.title)}>
                        {title}
                    </p>
                )}
                <p className="break-words text-sm leading-relaxed text-foreground">{children}</p>
            </div>
        </div>
    );
};

/** Props for the account identity confirmation card. */
export interface AccountIdentityCardProps {
    account: TransferPreviewAccount;
    eligible: boolean;
    activeLabel: string;
    inactiveLabel: string;
}

/** Renders the resolved account identity card shown before transfer. */
export const AccountIdentityCard: React.FC<AccountIdentityCardProps> = ({
    account,
    eligible,
    activeLabel,
    inactiveLabel,
}) => {
    const initials = account.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div
            className={cn(
                'overflow-hidden rounded-2xl border bg-card',
                eligible ? 'border-primary/30' : 'border-destructive/30',
            )}
        >
            <div className="flex items-center gap-4 border-b border-border px-5 py-5 sm:gap-5 sm:px-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-extrabold text-primary-foreground sm:h-16 sm:w-16">
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="break-words font-outfit text-lg font-extrabold text-foreground sm:text-xl">
                        {account.name}
                    </p>
                    <p dir="ltr" className="mt-1 break-all text-sm text-muted-foreground">
                        {account.email}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <span
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold',
                                account.active
                                    ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                    : 'border-border bg-muted text-muted-foreground',
                            )}
                        >
                            {account.active ? <Check size={12} /> : <X size={11} />}
                            {account.active ? activeLabel : inactiveLabel}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/** Props for the previous-owner disposition radio group. */
export interface DispositionRadiosProps {
    options: { id: PreviousOwnerAction; label: string }[];
    value: PreviousOwnerAction;
    onChange: (v: PreviousOwnerAction) => void;
    groupLabel: string;
    disabled?: boolean;
}

/** Single-select radio group for previous-owner handling. */
export const DispositionRadios: React.FC<DispositionRadiosProps> = ({
    options,
    value,
    onChange,
    groupLabel,
    disabled,
}) => (
    <div className="mt-6" role="radiogroup" aria-label={groupLabel}>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {groupLabel}
        </p>
        <div className="flex flex-col gap-2.5">
            {options.map((opt) => {
                const selected = value === opt.id;
                return (
                    <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={disabled}
                        onClick={() => onChange(opt.id)}
                        onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                onChange(opt.id);
                            }
                        }}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border px-4 py-3.5 text-start transition-all',
                            selected
                                ? 'border-primary/40 bg-primary/10'
                                : 'border-border bg-muted/40 hover:bg-muted',
                            disabled && 'cursor-not-allowed opacity-60',
                        )}
                    >
                        <span
                            className={cn(
                                'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2',
                                selected ? 'border-primary' : 'border-border',
                            )}
                        >
                            {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </span>
                        <span
                            className={cn(
                                'break-words text-sm',
                                selected ? 'font-bold text-foreground' : 'font-medium text-muted-foreground',
                            )}
                        >
                            {opt.label}
                        </span>
                    </button>
                );
            })}
        </div>
    </div>
);

/** Props for the consequences summary list. */
export interface ConsequencesListProps {
    title: string;
    items: string[];
}

/** Lists the consequences of confirming the transfer. */
export const ConsequencesList: React.FC<ConsequencesListProps> = ({ title, items }) => (
    <div className="mt-6 rounded-2xl border border-border bg-muted/40 px-5 py-5">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {title}
        </p>
        <ul className="space-y-3">
            {items.map((item) => (
                <li key={item} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span className="break-words text-sm leading-relaxed text-foreground">{item}</span>
                </li>
            ))}
        </ul>
    </div>
);
