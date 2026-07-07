import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import type { PreviousOwnerAction } from '../../utils/transferHelpers';

/** Summary row shown in the confirmation dialog. */
export interface TransferConfirmRow {
    label: string;
    value: string;
}

/** Props for the {@link TransferConfirmDialog} component. */
export interface TransferConfirmDialogProps {
    /** Whether the dialog is visible. */
    isOpen: boolean;
    /** Callback when the dialog should close. */
    onClose: () => void;
    /** Callback when the admin confirms the transfer. */
    onConfirm: () => void;
    /** Whether the transfer request is in flight. */
    isCommitting?: boolean;
    /** New owner's display name for the title. */
    newOwnerName: string;
    /** Rows summarizing the transfer consequences. */
    rows: TransferConfirmRow[];
}

/**
 * Final confirmation dialog before committing an ownership transfer.
 * Lists company, from/to, effect, and timing with an irreversibility warning.
 */
export const TransferConfirmDialog: React.FC<TransferConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isCommitting = false,
    newOwnerName,
    rows,
}) => {
    const { t } = useTranslation();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isCommitting && onClose()}>
            <DialogContent className="sm:!max-w-lg">
                <DialogHeader>
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <DialogTitle className="text-base font-bold text-foreground leading-snug">
                            {t('companies.transfer.confirmDialogTitle', { name: newOwnerName })}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="mt-2 space-y-3">
                    {rows.map((row) => (
                        <div key={row.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                            <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:w-24">
                                {row.label}
                            </span>
                            <span className="break-words text-sm font-medium text-foreground">
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="mt-3 rounded-xl border border-amber-200/60 bg-amber-50/80 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                    {t('companies.transfer.confirmDialogWarning')}
                </p>

                <DialogFooter className="mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isCommitting}
                        className="font-semibold"
                    >
                        {t('companies.transfer.cancel')}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isCommitting}
                        className="font-semibold"
                    >
                        {isCommitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                        {t('companies.transfer.confirmDialogYes')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

/**
 * Builds the confirmation dialog rows from transfer context.
 *
 * @param options - Transfer context values.
 */
export function buildTransferConfirmRows(options: {
    t: (key: string, params?: Record<string, string>) => string;
    companyName: string;
    fromLabel: string;
    toName: string;
    toEmail: string;
    fateText: string;
}): TransferConfirmRow[] {
    const { t, companyName, fromLabel, toName, toEmail, fateText } = options;
    return [
        { label: t('companies.transfer.confirmDialogCompany'), value: companyName },
        { label: t('companies.transfer.confirmDialogFrom'), value: fromLabel },
        { label: t('companies.transfer.confirmDialogTo'), value: `${toName} — ${toEmail}` },
        { label: t('companies.transfer.confirmDialogEffect'), value: fateText },
        { label: t('companies.transfer.confirmDialogTiming'), value: t('companies.transfer.confirmDialogTimingValue') },
    ];
}

/**
 * Resolves the fate text for the previous owner based on disposition choice.
 *
 * @param options - Disposition context.
 */
export function resolvePreviousOwnerFateText(options: {
    t: (key: string, params?: Record<string, string>) => string;
    ownerIsRealUser: boolean;
    ownerName: string;
    disposition: PreviousOwnerAction;
}): string {
    const { t, ownerIsRealUser, ownerName, disposition } = options;
    if (!ownerIsRealUser) {
        return t('companies.transfer.fateNoPrevious');
    }
    if (disposition === 'remove') {
        return t('companies.transfer.fateRemove', { name: ownerName });
    }
    if (disposition === 'keep_as_admin') {
        return t('companies.transfer.fateKeepAdmin', { name: ownerName });
    }
    return t('companies.transfer.fateKeepMember', { name: ownerName });
}
