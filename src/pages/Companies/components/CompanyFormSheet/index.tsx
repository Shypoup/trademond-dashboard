import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Tag as TagIcon, ChevronDown, Search, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { Tag, User } from '@data-types/api';
import { displayBilingual } from '@utils/ui';
import type { AdminIndustry } from '@services/taxonomyService';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import type { CompanyFormData } from '../../utils/companyHelpers';
import { isArabicUiLanguage, getCompanyData } from '../../utils/companyHelpers';
import type { Company } from '@data-types/api';

/** Props for the {@link CompanyFormSheet} component. */
export interface CompanyFormSheetProps {
    /** Whether the sheet is open. */
    isOpen: boolean;
    /** Callback to toggle sheet visibility. */
    onOpenChange: (open: boolean) => void;
    /** Non-null when editing an existing company; null when creating. */
    editingId: string | number | null;
    /** Current form state. */
    formData: CompanyFormData;
    /** State setter for the form data. */
    setFormData: React.Dispatch<React.SetStateAction<CompanyFormData>>;
    /** Form submission handler. */
    onSubmit: (e: React.FormEvent) => void;
    /** Whether the form is currently saving. */
    formSaving: boolean;
    /** Available expertise tags to display in the picker. */
    allExpertises: Tag[];
    /** Available users to pick from as company owner. */
    allUsers: User[];
    /** Industries from `/admin/industries` for the industry select (value = id). */
    allIndustries: AdminIndustry[];
    /** The logged-in user's id, used as default owner for new companies. */
    loginOwnerId: string;
    /** Full company record when editing (for ownership section). */
    editingCompany?: Company | null;
    /** Opens the ownership transfer flow for the company being edited. */
    onTransfer?: (company: Company) => void;
}

/**
 * Side-sheet form for creating or editing a company.
 * Handles identity fields, taxonomy / meta, and governance toggles.
 */
export const CompanyFormSheet: React.FC<CompanyFormSheetProps> = ({
    isOpen,
    onOpenChange,
    editingId,
    formData,
    setFormData,
    onSubmit,
    formSaving,
    allExpertises,
    allUsers,
    allIndustries,
    loginOwnerId,
    editingCompany = null,
    onTransfer,
}) => {
    const { t, i18n } = useTranslation();

    const isEditMode = editingId !== null;
    const editCompanyData = editingCompany ? getCompanyData(editingCompany) : null;
    const arabicUi = isArabicUiLanguage(i18n.language);
    /** When editing, the “other” locale’s company name is optional (validated per UI language). */
    const englishNameOptional = isEditMode && arabicUi;
    const arabicNameOptional = isEditMode && !arabicUi;
    const [ownerSearch, setOwnerSearch] = React.useState('');
    const [ownerDropdownOpen, setOwnerDropdownOpen] = React.useState(false);
    const ownerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setOwnerSearch('');
        setOwnerDropdownOpen(false);
    }, [isOpen]);

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ownerRef.current && !ownerRef.current.contains(e.target as Node)) {
                setOwnerDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredUsers = React.useMemo(() => {
        if (!ownerSearch.trim()) return allUsers;
        const q = ownerSearch.toLowerCase();
        return allUsers.filter(
            (u) =>
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.id?.toLowerCase().includes(q),
        );
    }, [allUsers, ownerSearch]);

    const selectedUser = React.useMemo(
        () => allUsers.find((u) => String(u.id) === formData.owner_id),
        [allUsers, formData.owner_id],
    );

    /** True when the saved company references an industry id not present in the loaded list (e.g. stale data). */
    const industryMissingFromList = Boolean(
        formData.industry_id && !allIndustries.some((i) => i.id === formData.industry_id),
    );

    /** Updates a single language key inside a bilingual field. */
    const updateBilingual = (field: keyof Pick<CompanyFormData, 'name' | 'slogan'>, lang: 'en' | 'ar', val: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...prev[field], [lang]: val },
        }));
    };

    /** Toggles an expertise id in / out of the selected list. */
    const toggleExpertise = (id: string) => {
        setFormData(prev => ({
            ...prev,
            expertise_ids: prev.expertise_ids.includes(id)
                ? prev.expertise_ids.filter(tid => tid !== id)
                : [...prev.expertise_ids, id],
        }));
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="p-0 !max-w-3xl w-full max-h-screen overflow-y-auto border-none shadow-2xl flex flex-col">
                {/* Header */}
                <div className="border-b border-border bg-muted/50 p-6">
                    <div className="flex items-center justify-between">
                        <SheetHeader className="!p-0 !m-0">
                            <SheetTitle className="font-outfit text-xl font-bold text-foreground">
                                {editingId ? t('companies.editCompany') : t('companies.registerCompany')}
                            </SheetTitle>
                        </SheetHeader>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                1
                            </span>
                            <span>{t('companies.identity')}</span>
                        </div>
                        <div className="h-px w-6 bg-border" />
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground">
                                2
                            </span>
                            <span>{t('companies.locationMeta')}</span>
                        </div>
                        <div className="h-px w-6 bg-border" />
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground">
                                3
                            </span>
                            <span>{t('companies.ownershipStatus')}</span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form noValidate onSubmit={onSubmit} className="flex flex-col flex-1">
                    <div className="p-8 space-y-8 overflow-y-auto premium-scrollbar flex-1">
                        {/* Identity */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                        {t('companies.englishName')}
                                        {englishNameOptional ? (
                                            <span className="ms-1 font-medium normal-case text-muted-foreground">
                                                ({t('companies.optional')})
                                            </span>
                                        ) : null}
                                    </label>
                                    <input
                                        aria-required={isEditMode && !arabicUi}
                                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                                        value={formData.name.en}
                                        onChange={e => updateBilingual('name', 'en', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground text-end block">
                                        {t('companies.arabicName')}
                                        {arabicNameOptional ? (
                                            <span className="me-1 font-medium normal-case text-muted-foreground">
                                                ({t('companies.optional')})
                                            </span>
                                        ) : null}
                                    </label>
                                    <input
                                        aria-required={isEditMode && arabicUi}
                                        dir="rtl"
                                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-end text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                                        value={formData.name.ar}
                                        onChange={e => updateBilingual('name', 'ar', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                        {t('companies.sloganEn')}
                                    </label>
                                    <input
                                        aria-required={Boolean(editingId)}
                                        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                                        value={formData.slogan.en}
                                        onChange={e => setFormData(prev => ({ ...prev, slogan: { ...prev.slogan, en: e.target.value } }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground text-end block">
                                        {t('companies.sloganAr')}
                                    </label>
                                    <input
                                        aria-required={Boolean(editingId)}
                                        dir="rtl"
                                        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-end text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                                        value={formData.slogan.ar}
                                        onChange={e => setFormData(prev => ({ ...prev, slogan: { ...prev.slogan, ar: e.target.value } }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                        {t('companies.acronym')}
                                    </label>
                                    <input
                                        aria-required={Boolean(editingId)}
                                        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold uppercase text-foreground outline-none transition-all placeholder:lowercase focus:border-primary focus:ring-2 focus:ring-ring/20"
                                        value={formData.acronym}
                                        onChange={e => setFormData(prev => ({ ...prev, acronym: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                        {t('companies.handle')}
                                    </label>
                                    <input
                                        aria-required={Boolean(editingId)}
                                        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                                        placeholder="@handle"
                                        value={formData.handle}
                                        onChange={e => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                        {t('companies.establishedYear')}
                                    </label>
                                    <input
                                        aria-required={Boolean(editingId)}
                                        type="number"
                                        min="1800"
                                        max={new Date().getFullYear()}
                                        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                                        value={formData.established}
                                        onChange={e => setFormData(prev => ({ ...prev, established: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Meta & taxonomy */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2" ref={ownerRef}>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                        {t('companies.owner')}
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setOwnerDropdownOpen((prev) => !prev)}
                                            className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 text-start text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                                        >
                                            <span className={selectedUser ? 'font-bold text-foreground' : 'text-muted-foreground'}>
                                                {selectedUser
                                                    ? `${selectedUser.name} (${selectedUser.email})`
                                                    : t('companies.selectOwner')}
                                            </span>
                                            <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
                                        </button>
                                        {ownerDropdownOpen && (
                                            <div className="absolute z-50 mt-1 flex max-h-64 w-full flex-col overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
                                                <div className="p-2 border-b border-border">
                                                    <div className="relative">
                                                        <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                        <input
                                                            type="text"
                                                            value={ownerSearch}
                                                            onChange={(e) => setOwnerSearch(e.target.value)}
                                                            placeholder={t('companies.searchUsers')}
                                                            className="h-8 w-full rounded-lg border border-border bg-muted/50 ps-8 pe-3 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring/30"
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                                <div className="overflow-y-auto flex-1">
                                                    {filteredUsers.map((u) => (
                                                        <button
                                                            key={u.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData((prev) => ({ ...prev, owner_id: String(u.id) }));
                                                                setOwnerDropdownOpen(false);
                                                                setOwnerSearch('');
                                                            }}
                                                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-start transition-colors hover:bg-muted ${
                                                                String(u.id) === formData.owner_id ? 'bg-primary/10' : ''
                                                            }`}
                                                        >
                                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-bold uppercase text-muted-foreground">
                                                                {u.name?.charAt(0) || '?'}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-xs font-bold text-foreground">{u.name}</p>
                                                                <p className="truncate text-[10px] text-muted-foreground">{u.email}</p>
                                                            </div>
                                                            {String(u.id) === formData.owner_id && (
                                                                <span className="shrink-0 text-[10px] font-bold text-primary">&#10003;</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                    {filteredUsers.length === 0 && (
                                                        <p className="px-4 py-3 text-center text-xs text-muted-foreground">
                                                            {t('companies.noUsersFound')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                        {t('companies.industry')}
                                    </label>
                                    <select
                                        aria-required={Boolean(editingId)}
                                        value={formData.industry_id}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, industry_id: e.target.value }))
                                        }
                                        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                                    >
                                        <option value="">{t('companies.selectIndustry')}</option>
                                        {industryMissingFromList && (
                                            <option value={formData.industry_id}>
                                                {t('companies.unknownIndustryOption', { id: formData.industry_id })}
                                            </option>
                                        )}
                                        {allIndustries.map((ind) => (
                                            <option key={ind.id} value={ind.id}>
                                                {displayBilingual(ind.name)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                    {t('companies.expertises')}
                                    <span className="ms-1 font-bold text-muted-foreground">
                                        ({formData.expertise_ids.length})
                                    </span>
                                </label>
                                <div className="flex min-h-[90px] flex-wrap gap-2 rounded-2xl border border-border bg-muted/40 p-4">
                                    {allExpertises.map(tag => {
                                        const id = String(tag.id);
                                        const isSelected = formData.expertise_ids.includes(id);
                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => toggleExpertise(id)}
                                                className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${
                                                    isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/10'
                                                        : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
                                                }`}
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    <TagIcon size={11} className="opacity-60" />
                                                    {displayBilingual(tag.name)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                    {allExpertises.length === 0 && (
                                        <p className="text-xs italic text-muted-foreground">
                                            {t('companies.noExpertises')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Ownership & status (edit mode only) */}
                        {isEditMode && editCompanyData && editingCompany && (
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">
                                    {t('companies.ownershipStatus')}
                                </h4>
                                <div
                                    className={`rounded-2xl border p-5 sm:p-6 ${
                                        editCompanyData.claimed
                                            ? 'border-primary/25 bg-primary/5'
                                            : 'border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20'
                                    }`}
                                >
                                    {editCompanyData.claimed ? (
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0 space-y-2">
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    {t('companies.claimedOwnerLabel')}
                                                </p>
                                                <p className="break-words text-sm font-bold text-foreground">
                                                    {editCompanyData.ownerName}
                                                </p>
                                                {editCompanyData.ownerEmail && (
                                                    <p dir="ltr" className="break-all text-xs text-muted-foreground">
                                                        {editCompanyData.ownerEmail}
                                                    </p>
                                                )}
                                                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                                                    <CheckCircle2 size={11} />
                                                    {t('companies.claimed')}
                                                </span>
                                            </div>
                                            {onTransfer && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onOpenChange(false);
                                                        setTimeout(() => onTransfer(editingCompany), 80);
                                                    }}
                                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted"
                                                >
                                                    <ArrowRightLeft size={15} />
                                                    {t('companies.transferOwnership')}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0 space-y-2">
                                                <p className="text-sm leading-relaxed text-muted-foreground">
                                                    {t('companies.unclaimedHint')}
                                                </p>
                                                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                                                    {t('companies.unclaimed')}
                                                </span>
                                            </div>
                                            {onTransfer && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onOpenChange(false);
                                                        setTimeout(() => onTransfer(editingCompany), 80);
                                                    }}
                                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                                                >
                                                    <ArrowRightLeft size={15} />
                                                    {t('companies.assignOwner')}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Governance */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">
                                {t('companies.governance')}
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                <GovernanceToggle
                                    label={t('companies.searchable')}
                                    description={t('companies.searchableDesc')}
                                    checked={formData.searchable}
                                    onChange={val => setFormData(prev => ({ ...prev, searchable: val }))}
                                />
                                <GovernanceToggle
                                    label={t('common.active')}
                                    description={t('companies.activeDesc')}
                                    checked={formData.active}
                                    onChange={val => setFormData(prev => ({ ...prev, active: val }))}
                                />
                                <GovernanceToggle
                                    label={t('common.published')}
                                    description={t('companies.publishedDesc')}
                                    checked={formData.published}
                                    onChange={val => setFormData(prev => ({ ...prev, published: val }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-4 border-t border-border bg-muted/50 p-6">
                        <button
                            type="button"
                            className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted"
                            onClick={() => onOpenChange(false)}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={formSaving}
                            className="flex items-center gap-2 rounded-xl bg-primary px-10 py-2.5 text-sm font-black text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                        >
                            {formSaving && <Loader2 className="animate-spin" size={16} />}
                            {t('companies.saveCompany')}
                        </button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
};

// ---------------------------------------------------------------------------
// Internal sub-component
// ---------------------------------------------------------------------------

/** Props for the toggle card used in the governance section. */
interface GovernanceToggleProps {
    label: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}

/**
 * Small toggle card used in the governance & visibility section of the form.
 *
 * The checkbox is visually hidden (`sr-only`); the switch track is decorative only.
 * A {@link HTMLLabelElement} associates clicks on the track with the input so toggling works reliably.
 */
const GovernanceToggle: React.FC<GovernanceToggleProps> = ({ label, description, checked, onChange }) => {
    const inputId = React.useId();
    return (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-sm">
            <div className="space-y-0.5 min-w-0 pe-2">
                <p className="text-xs font-bold text-foreground">{label}</p>
                <p className="text-[10px] font-medium text-muted-foreground">{description}</p>
            </div>
            <label htmlFor={inputId} className="relative inline-flex shrink-0 scale-90 cursor-pointer items-center">
                <input
                    id={inputId}
                    type="checkbox"
                    role="switch"
                    checked={checked}
                    onChange={e => onChange(e.target.checked)}
                    className="peer sr-only"
                />
                <span
                    aria-hidden
                    className="relative inline-block h-5 w-10 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-transparent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring/40"
                />
            </label>
        </div>
    );
};
