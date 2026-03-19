import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Tag as TagIcon } from 'lucide-react';
import { Tag } from '@data-types/api';
import { displayBilingual } from '@utils/ui';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import type { CompanyFormData } from '../../utils/companyHelpers';

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
    /** The logged-in user's id, used as default owner for new companies. */
    loginOwnerId: string;
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
    loginOwnerId,
}) => {
    const { t } = useTranslation();

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
                <div className="p-6 border-b bg-slate-50">
                    <div className="flex items-center justify-between">
                        <SheetHeader className="!p-0 !m-0">
                            <SheetTitle className="text-xl font-bold font-outfit text-slate-900">
                                {editingId ? t('companies.editCompany') : t('companies.registerCompany')}
                            </SheetTitle>
                        </SheetHeader>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                                1
                            </span>
                            <span>{t('companies.identity')}</span>
                        </div>
                        <div className="h-px w-6 bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">
                                2
                            </span>
                            <span>{t('companies.locationMeta')}</span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="flex flex-col flex-1">
                    <div className="p-8 space-y-8 overflow-y-auto premium-scrollbar flex-1">
                        {/* Identity */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        {t('companies.englishName')}
                                    </label>
                                    <input
                                        required
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none"
                                        value={formData.name.en}
                                        onChange={e => updateBilingual('name', 'en', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-end block">
                                        {t('companies.arabicName')}
                                    </label>
                                    <input
                                        required
                                        dir="rtl"
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none text-end"
                                        value={formData.name.ar}
                                        onChange={e => updateBilingual('name', 'ar', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        {t('companies.sloganEn')}
                                    </label>
                                    <input
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none"
                                        value={formData.slogan.en}
                                        onChange={e => setFormData(prev => ({ ...prev, slogan: { ...prev.slogan, en: e.target.value } }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-end block">
                                        {t('companies.sloganAr')}
                                    </label>
                                    <input
                                        dir="rtl"
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none text-end"
                                        value={formData.slogan.ar}
                                        onChange={e => setFormData(prev => ({ ...prev, slogan: { ...prev.slogan, ar: e.target.value } }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        {t('companies.acronym')}
                                    </label>
                                    <input
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none uppercase placeholder:lowercase"
                                        value={formData.acronym}
                                        onChange={e => setFormData(prev => ({ ...prev, acronym: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        {t('companies.handle')}
                                    </label>
                                    <input
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none"
                                        placeholder="@handle"
                                        value={formData.handle}
                                        onChange={e => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        {t('companies.establishedYear')}
                                    </label>
                                    <input
                                        type="number"
                                        min="1800"
                                        max={new Date().getFullYear()}
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none"
                                        value={formData.established}
                                        onChange={e => setFormData(prev => ({ ...prev, established: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Meta & taxonomy */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        {t('companies.ownerUlid')}
                                    </label>
                                    <input
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono focus:bg-white focus:border-teal-500 transition-all outline-none"
                                        value={formData.owner_id}
                                        readOnly={Boolean(loginOwnerId) && editingId === null}
                                        onChange={e => setFormData(prev => ({ ...prev, owner_id: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        {t('companies.industryUlid')}
                                    </label>
                                    <input
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono focus:bg-white focus:border-teal-500 transition-all outline-none"
                                        value={formData.industry_id}
                                        onChange={e => setFormData(prev => ({ ...prev, industry_id: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    {t('companies.expertises')}
                                    <span className="text-slate-300 font-bold ms-1">
                                        ({formData.expertise_ids.length})
                                    </span>
                                </label>
                                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[90px]">
                                    {allExpertises.map(tag => {
                                        const id = String(tag.id);
                                        const isSelected = formData.expertise_ids.includes(id);
                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => toggleExpertise(id)}
                                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                                                    isSelected
                                                        ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/10'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600'
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
                                        <p className="text-xs text-slate-400 italic">
                                            {t('companies.noExpertises')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Governance */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-teal-600 uppercase tracking-widest">
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
                    <div className="p-6 border-t border-slate-100 flex justify-end gap-4 bg-slate-50">
                        <button
                            type="button"
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all"
                            onClick={() => onOpenChange(false)}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={formSaving}
                            className="px-10 py-2.5 bg-teal-600 rounded-xl text-sm font-black text-white hover:bg-teal-700 transition-all flex items-center gap-2"
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
 */
const GovernanceToggle: React.FC<GovernanceToggleProps> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
        <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-800">{label}</p>
            <p className="text-[10px] text-slate-400 font-medium">{description}</p>
        </div>
        <div className="relative inline-flex items-center cursor-pointer scale-90">
            <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
        </div>
    </div>
);
