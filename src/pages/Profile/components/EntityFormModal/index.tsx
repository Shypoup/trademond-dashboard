import React from 'react';
import { X, Loader2, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { EntityFormModalProps } from '../../utils/types';

/**
 * Modal dialog for creating or editing a company, product, or service entity.
 * Contains bilingual name/description fields and category/company selectors.
 */
export const EntityFormModal: React.FC<EntityFormModalProps> = ({
    modal,
    companies,
    products,
    services,
    categories,
    selectedCompanyId,
    formSaving,
    onClose,
    onSubmit,
}) => {
    const { t } = useTranslation();

    if (!modal.isOpen) return null;

    const isEditing = !!modal.editingId;
    const title = isEditing
        ? t('profile.modalEditTitle', { type: modal.type })
        : t('profile.modalAddTitle', { type: modal.type });

    const getInitialData = (): Record<string, unknown> => {
        if (isEditing) {
            let found: Record<string, unknown> | undefined;
            if (modal.type === 'company') found = companies.find(c => c.id === modal.editingId) as unknown as Record<string, unknown>;
            if (modal.type === 'product') found = products.find(p => p.id === modal.editingId) as unknown as Record<string, unknown>;
            if (modal.type === 'service') found = services.find(s => s.id === modal.editingId) as unknown as Record<string, unknown>;
            if (found) return { ...found };
        }
        return {
            name: { en: '', ar: '' },
            description: { en: '', ar: '' },
            company_id: selectedCompanyId,
            category_id: categories[0]?.id || '',
        };
    };

    return (
        <EntityFormModalInner
            title={title}
            modal={modal}
            isEditing={isEditing}
            initialData={getInitialData()}
            companies={companies}
            categories={categories}
            formSaving={formSaving}
            onClose={onClose}
            onSubmit={onSubmit}
            t={t}
        />
    );
};

/** Props for the inner modal component that holds local form state */
interface InnerProps {
    title: string;
    modal: EntityFormModalProps['modal'];
    isEditing: boolean;
    initialData: Record<string, unknown> | undefined;
    companies: EntityFormModalProps['companies'];
    categories: EntityFormModalProps['categories'];
    formSaving: boolean;
    onClose: () => void;
    onSubmit: EntityFormModalProps['onSubmit'];
    t: (key: string, opts?: Record<string, string>) => string;
}

/**
 * Inner form component that manages its own local state,
 * separated to allow proper React state initialization.
 */
const EntityFormModalInner: React.FC<InnerProps> = ({
    title,
    modal,
    isEditing,
    initialData,
    companies,
    categories,
    formSaving,
    onClose,
    onSubmit,
    t,
}) => {
    const [localForm, setLocalForm] = React.useState<Record<string, unknown>>(
        () => (initialData || { name: { en: '', ar: '' }, description: { en: '', ar: '' } }) as Record<string, unknown>
    );

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(modal.type, isEditing, localForm);
    };

    const updateBilingual = (field: string, lang: 'en' | 'ar', val: string) => {
        setLocalForm((prev) => ({
            ...prev,
            [field]: { ...((prev[field] as Record<string, string>) || {}), [lang]: val },
        }));
    };

    const nameValue = localForm.name as string | Record<string, string> | undefined;
    const descValue = localForm.description as string | Record<string, string> | undefined;
    const aboutValue = localForm.about as Record<string, string> | undefined;
    const descField = modal.type === 'company' ? 'about' : 'description';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                    <div>
                        <h3 className="text-xl font-bold font-outfit text-slate-900">{title}</h3>
                        <p className="text-xs text-slate-500 font-medium">
                            {t('profile.modalSubtitle')}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto premium-scrollbar">
                    {/* Bilingual name fields */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                {t('profile.englishName')}
                            </label>
                            <input
                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none"
                                value={typeof nameValue === 'string' ? nameValue : (nameValue as Record<string, string>)?.en || ''}
                                onChange={(e) => updateBilingual('name', 'en', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block">
                                {t('profile.arabicName')}
                            </label>
                            <input
                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none text-right"
                                value={(nameValue as Record<string, string>)?.ar || ''}
                                onChange={(e) => updateBilingual('name', 'ar', e.target.value)}
                                dir="rtl"
                                required
                            />
                        </div>
                    </div>

                    {/* Category & Company selectors for products/services */}
                    {(modal.type === 'product' || modal.type === 'service') && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    {t('products.category')}
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-teal-500 transition-all"
                                        value={(localForm.category_id as string) || ''}
                                        onChange={(e) => setLocalForm({ ...localForm, category_id: e.target.value })}
                                        required
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {typeof cat.name === 'string' ? cat.name : cat.name.en}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    {t('products.company')}
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-teal-500 transition-all"
                                        value={(localForm.company_id as string) || ''}
                                        onChange={(e) => setLocalForm({ ...localForm, company_id: e.target.value })}
                                        required
                                        disabled={!!localForm.company_id && !isEditing}
                                    >
                                        {companies.map(comp => (
                                            <option key={comp.id} value={comp.id}>
                                                {typeof comp.name === 'string' ? comp.name : comp.name.en}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* English description */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            {t('profile.descriptionEn')}
                        </label>
                        <textarea
                            className="w-full min-h-[100px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none"
                            value={typeof descValue === 'string' ? descValue : (descValue as Record<string, string>)?.en || aboutValue?.en || ''}
                            onChange={(e) => updateBilingual(descField, 'en', e.target.value)}
                            placeholder={t('profile.descriptionPlaceholder')}
                        />
                    </div>

                    {/* Arabic description */}
                    <div className="space-y-2 text-right">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            {t('profile.descriptionAr')}
                        </label>
                        <textarea
                            className="w-full min-h-[100px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none text-right"
                            value={(descValue as Record<string, string>)?.ar || aboutValue?.ar || ''}
                            onChange={(e) => updateBilingual(descField, 'ar', e.target.value)}
                            placeholder={t('profile.descriptionPlaceholderAr')}
                            dir="rtl"
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="pt-8 border-t flex justify-end gap-4">
                        <button
                            type="button"
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
                            onClick={onClose}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={formSaving}
                            className="px-10 py-2.5 bg-slate-900 rounded-xl text-sm font-black text-white hover:bg-teal-600 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {formSaving && <Loader2 className="animate-spin" size={16} />}
                            {isEditing ? t('profile.saveChanges') : t('profile.addEntity', { type: modal.type })}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
