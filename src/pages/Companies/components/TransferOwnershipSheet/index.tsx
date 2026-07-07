import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    X,
    Loader2,
    Search,
    ArrowRightLeft,
    CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Company } from '@data-types/api';
import { companyService } from '@services/companyService';
import { displayBilingual } from '@utils/ui';
import { parseError, getUserFriendlyErrorMessage } from '@utils/errorParser';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { getCompanyData } from '../../utils/companyHelpers';
import {
    sanitizeLookupQuery,
    normalizeTransferPreview,
    normalizeTransferResult,
    extractTransferBlockers,
    mapBlockerCode,
    mapWarningCode,
    type TransferPhase,
    type TransferPreviewResult,
    type PreviousOwnerAction,
} from '../../utils/transferHelpers';
import {
    TransferConfirmDialog,
    buildTransferConfirmRows,
    resolvePreviousOwnerFateText,
} from '../TransferConfirmDialog';
import {
    TransferNotice,
    AccountIdentityCard,
    DispositionRadios,
    ConsequencesList,
} from './TransferSheetParts';

/** Props for the {@link TransferOwnershipSheet} component. */
export interface TransferOwnershipSheetProps {
    /** Whether the sheet is open. */
    isOpen: boolean;
    /** Callback to toggle sheet visibility. */
    onOpenChange: (open: boolean) => void;
    /** Company being transferred; null when closed. */
    company: Company | null;
    /** Called after a successful transfer with updated owner info. */
    onTransferred: (
        companyId: string | number,
        owner: { id: string; name: string; email: string },
        warnings: string[],
    ) => void;
}

/**
 * Right-side sheet for the admin ownership transfer flow:
 * look up → confirm identity → commit transfer.
 */
export const TransferOwnershipSheet: React.FC<TransferOwnershipSheetProps> = ({
    isOpen,
    onOpenChange,
    company,
    onTransferred,
}) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    const [query, setQuery] = React.useState('');
    const [phase, setPhase] = React.useState<TransferPhase>('idle');
    const [preview, setPreview] = React.useState<TransferPreviewResult | null>(null);
    const [disposition, setDisposition] = React.useState<PreviousOwnerAction>('keep_as_admin');
    const [commitBlockers, setCommitBlockers] = React.useState<string[]>([]);
    const [successWarnings, setSuccessWarnings] = React.useState<string[]>([]);
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const lookupInFlight = React.useRef(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const cardRef = React.useRef<HTMLDivElement>(null);
    const bodyRef = React.useRef<HTMLDivElement>(null);

    const companyData = company ? getCompanyData(company) : null;
    const companyName = companyData ? displayBilingual(companyData.name) : '';

    React.useEffect(() => {
        if (isOpen) {
            setQuery('');
            setPhase('idle');
            setPreview(null);
            setDisposition('keep_as_admin');
            setCommitBlockers([]);
            setSuccessWarnings([]);
            setConfirmOpen(false);
            lookupInFlight.current = false;
            setTimeout(() => inputRef.current?.focus(), 120);
        }
    }, [isOpen, company?.id]);

    React.useEffect(() => {
        if ((phase === 'resolved' || phase === 'error') && cardRef.current && bodyRef.current) {
            setTimeout(() => {
                cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
        }
    }, [phase, preview]);

    if (!company || !companyData) return null;

    const eligible = Boolean(preview?.checks.eligible && preview.blockers.length === 0 && commitBlockers.length === 0);
    const allBlockers = [...(preview?.blockers ?? []), ...commitBlockers];
    const allWarnings = phase === 'success' ? successWarnings : (preview?.warnings ?? []);
    const confirmDisabled = !eligible || phase === 'committing';
    const showReason = (phase === 'resolved' || phase === 'error') && !eligible && preview;
    const formDisabled = phase === 'committing' || phase === 'success';

    const fateText = resolvePreviousOwnerFateText({
        t,
        ownerIsRealUser: companyData.ownerIsRealUser,
        ownerName: companyData.ownerName,
        disposition,
    });

    const fromLabel = companyData.ownerIsRealUser
        ? companyData.ownerName
        : t('companies.transfer.systemPlaceholder');

    /** Resolves blocker/warning codes to localized strings. */
    const localizeCode = (rawCode: unknown, mapper: (c: string) => string) => {
        const code = typeof rawCode === 'string' ? rawCode : String(rawCode ?? '');
        const key = mapper(code);
        // Unknown codes that look like human-readable server text are shown as-is.
        if (key.endsWith('.generic') && code !== 'generic' && !code.includes('_')) {
            return code;
        }
        return t(key);
    };

    /** Performs the account lookup against the preview endpoint. */
    const handleLookup = async () => {
        const q = sanitizeLookupQuery(query);
        if (!q || lookupInFlight.current) return;

        lookupInFlight.current = true;
        setPhase('looking');
        setPreview(null);
        setCommitBlockers([]);

        try {
            const raw = await companyService.previewTransferOwnership(String(companyData.id), q);
            const normalized = normalizeTransferPreview(raw);
            setPreview(normalized);
            setPhase('resolved');
        } catch (err) {
            const parsed = parseError(err);
            if (parsed.status === 404 || parsed.category === 'notFound') {
                setPhase('notfound');
            } else {
                toast.error(getUserFriendlyErrorMessage(parsed, i18n.language, t));
                setPhase('idle');
            }
        } finally {
            lookupInFlight.current = false;
        }
    };

    /** Opens the final confirmation dialog when eligible. */
    const handleConfirmClick = () => {
        if (!eligible || !preview) return;
        setConfirmOpen(true);
    };

    /** Commits the ownership transfer after dialog confirmation. */
    const handleCommit = async () => {
        if (!preview || !eligible) return;

        setConfirmOpen(false);
        setPhase('committing');
        setCommitBlockers([]);

        try {
            const raw = await companyService.transferOwnership(String(companyData.id), {
                new_owner_id: preview.account.id,
                previous_owner_action: companyData.ownerIsRealUser ? disposition : undefined,
            });
            const result = normalizeTransferResult(raw);
            setSuccessWarnings(result.warnings);
            setPhase('success');
            toast.success(t('companies.transfer.successTitle', { name: result.owner.name }));
            onTransferred(companyData.id, result.owner, result.warnings);
        } catch (err) {
            const parsed = parseError(err);
            const blockers = extractTransferBlockers(err);

            if (blockers.length > 0) {
                setCommitBlockers(blockers);
                setPhase('error');
            } else if (parsed.category === 'unauthorized' || parsed.category === 'forbidden') {
                toast.error(getUserFriendlyErrorMessage(parsed, i18n.language, t));
                setPhase('resolved');
            } else {
                toast.error(t('companies.transfer.transferFailed'));
                setPhase('resolved');
            }
        }
    };

    const confirmRows = preview
        ? buildTransferConfirmRows({
              t,
              companyName,
              fromLabel,
              toName: preview.account.name,
              toEmail: preview.account.email,
              fateText,
          })
        : [];

    const dispositionOptions: { id: PreviousOwnerAction; label: string }[] = [
        { id: 'keep_as_admin', label: t('companies.transfer.dispAdmin', { name: companyData.ownerName }) },
        { id: 'keep_as_member', label: t('companies.transfer.dispMember', { name: companyData.ownerName }) },
        { id: 'remove', label: t('companies.transfer.dispRemove', { name: companyData.ownerName }) },
    ];

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent
                    side={isRtl ? 'left' : 'right'}
                    showCloseButton={false}
                    dir={i18n.dir()}
                    className="flex h-full w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
                    aria-label={t('companies.transfer.title', { name: companyName })}
                >
                    {/* Header */}
                    <div className="shrink-0 border-b border-border bg-muted/40 px-6 py-5 sm:px-8">
                        <div className="flex items-start justify-between gap-4">
                            <SheetHeader className="!m-0 !p-0 text-start">
                                <SheetTitle className="font-outfit text-xl font-extrabold leading-snug text-foreground sm:text-2xl">
                                    {t('companies.transfer.title', { name: companyName })}
                                </SheetTitle>
                                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                                    {t('companies.transfer.explain')}
                                </p>
                            </SheetHeader>
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted"
                                aria-label={t('common.close')}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div
                        ref={bodyRef}
                        className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 premium-scrollbar"
                    >
                        {phase === 'success' && preview ? (
                            <div role="status" aria-live="polite" className="animate-in fade-in duration-300">
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15">
                                    <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="font-outfit text-xl font-extrabold text-foreground sm:text-2xl">
                                    {t('companies.transfer.successTitle', { name: preview.account.name })}
                                </h3>
                                <div className="mt-3">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                        <CheckCircle2 size={13} />
                                        {t('companies.transfer.claimedBadge')}
                                    </span>
                                </div>
                                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                                    {t('companies.transfer.successBody', {
                                        owner: preview.account.name,
                                        company: companyName,
                                    })}
                                </p>
                                {successWarnings.map((w) => (
                                    <div key={w} className="mt-4">
                                        <TransferNotice kind="warning" title={t('companies.transfer.followUp')}>
                                            {localizeCode(w, mapWarningCode)}
                                        </TransferNotice>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {!companyData.ownerIsRealUser && (
                                    <div className="mb-5">
                                        <TransferNotice kind="info">
                                            {t('companies.transfer.sysNote')}
                                        </TransferNotice>
                                    </div>
                                )}

                                <label
                                    htmlFor="transfer-owner-query"
                                    className="mb-2.5 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                                >
                                    {t('companies.transfer.inputLabel')}
                                </label>
                                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                    <input
                                        id="transfer-owner-query"
                                        ref={inputRef}
                                        value={query}
                                        disabled={formDisabled}
                                        autoCapitalize="off"
                                        autoCorrect="off"
                                        spellCheck={false}
                                        dir="ltr"
                                        inputMode="email"
                                        placeholder={t('companies.transfer.placeholder')}
                                        onChange={(e) => {
                                            setQuery(e.target.value);
                                            if (phase === 'notfound') setPhase('idle');
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') void handleLookup();
                                        }}
                                        className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
                                    />
                                    <button
                                        type="button"
                                        disabled={formDisabled || !sanitizeLookupQuery(query)}
                                        onClick={() => void handleLookup()}
                                        className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-bold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {phase === 'looking' ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search size={16} />
                                        )}
                                        {t('companies.transfer.lookup')}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                    {t('companies.transfer.helper')}
                                </p>

                                <div aria-live="polite" role="status" className="mt-5">
                                    {phase === 'looking' && (
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {t('companies.transfer.looking')}
                                        </div>
                                    )}
                                    {phase === 'notfound' && (
                                        <TransferNotice kind="warning">
                                            {t('companies.transfer.notFound')}
                                        </TransferNotice>
                                    )}

                                    {preview && (phase === 'resolved' || phase === 'committing' || phase === 'error') && (
                                        <div ref={cardRef} className="mt-6 animate-in fade-in duration-300">
                                            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                                {t('companies.transfer.aboutTo', { name: companyName })}
                                            </p>

                                            <AccountIdentityCard
                                                account={preview.account}
                                                eligible={eligible}
                                                activeLabel={t('companies.transfer.statusActive')}
                                                inactiveLabel={t('companies.transfer.statusInactive')}
                                            />

                                            <div className="mt-4 flex flex-col gap-3">
                                                {preview.checks.isAlreadyMember &&
                                                    eligible &&
                                                    preview.checks.currentRole && (
                                                        <TransferNotice kind="info">
                                                            {t('companies.transfer.alreadyMember', {
                                                                role: preview.checks.currentRole,
                                                            })}
                                                        </TransferNotice>
                                                    )}
                                                {allBlockers.map((b) => (
                                                    <TransferNotice
                                                        key={b}
                                                        kind="blocker"
                                                        title={t('companies.transfer.cantTransfer')}
                                                    >
                                                        {localizeCode(b, mapBlockerCode)}
                                                    </TransferNotice>
                                                ))}
                                                {phase === 'error' && commitBlockers.length === 0 && (
                                                    <TransferNotice
                                                        kind="blocker"
                                                        title={t('companies.transfer.stateChanged')}
                                                    >
                                                        {t('companies.transfer.stale')}
                                                    </TransferNotice>
                                                )}
                                                {eligible &&
                                                    allWarnings.map((w) => (
                                                        <TransferNotice
                                                            key={w}
                                                            kind="warning"
                                                            title={t('companies.transfer.headsUp')}
                                                        >
                                                            {localizeCode(w, mapWarningCode)}
                                                        </TransferNotice>
                                                    ))}
                                            </div>

                                            {eligible && companyData.ownerIsRealUser && (
                                                <DispositionRadios
                                                    options={dispositionOptions}
                                                    value={disposition}
                                                    onChange={setDisposition}
                                                    groupLabel={t('companies.transfer.dispTitle', {
                                                        name: companyData.ownerName,
                                                    })}
                                                    disabled={formDisabled}
                                                />
                                            )}

                                            {eligible && (
                                                <ConsequencesList
                                                    title={t('companies.transfer.consTitle')}
                                                    items={[
                                                        t('companies.transfer.consMove', {
                                                            owner: preview.account.name,
                                                        }),
                                                        t('companies.transfer.consBilling', {
                                                            company: companyName,
                                                            owner: preview.account.name,
                                                        }),
                                                        fateText,
                                                        t('companies.transfer.consImmediate'),
                                                    ]}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border bg-muted/40 px-6 py-5 sm:px-8">
                        {phase === 'success' ? (
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="ms-auto rounded-xl bg-primary px-8 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                {t('companies.transfer.done')}
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => onOpenChange(false)}
                                    disabled={phase === 'committing'}
                                    className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                                >
                                    {t('companies.transfer.cancel')}
                                </button>
                                <div className="flex items-center gap-3">
                                    {showReason && (
                                        <span
                                            id="xfer-reason"
                                            className="max-w-[200px] text-end text-xs leading-snug text-muted-foreground"
                                        >
                                            {t('companies.transfer.reason')}
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleConfirmClick}
                                        disabled={confirmDisabled}
                                        aria-disabled={confirmDisabled}
                                        aria-describedby={showReason ? 'xfer-reason' : undefined}
                                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45"
                                    >
                                        {phase === 'committing' ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                {t('companies.transfer.transferring')}
                                            </>
                                        ) : (
                                            <>
                                                <ArrowRightLeft size={16} />
                                                {t('companies.transfer.confirm')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            <TransferConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => void handleCommit()}
                isCommitting={phase === 'committing'}
                newOwnerName={preview?.account.name ?? ''}
                rows={confirmRows}
            />
        </>
    );
};
