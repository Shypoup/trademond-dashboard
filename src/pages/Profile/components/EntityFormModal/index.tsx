import React from 'react';
import { X, Loader2, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import type { EntityFormModalProps } from '../../utils/types';

/**
 * Side sheet for creating or editing a company, product, or service entity.
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
        <Sheet open={modal.isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent
                side="right"
                showCloseButton={false}
                className="p-0 !max-w-2xl w-full max-h-screen overflow-y-auto border-none shadow-2xl flex flex-col gap-0 sm:!max-w-2xl"
            >
                {modal.isOpen && (
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
                )}
            </SheetContent>
        </Sheet>
    );
};

/** Props for the inner sheet body that holds local form state. */
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
        <>
            <div className="shrink-0 border-b border-border bg-muted/50 p-6">
                <div className="flex items-center justify-between gap-4">
                    <SheetHeader className="!m-0 !min-w-0 !flex-1 !p-0">
                        <SheetTitle className="font-outfit text-xl font-bold text-foreground">
                            {title}
                        </SheetTitle>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                            {t('profile.modalSubtitle')}
                        </p>
                    </SheetHeader>
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="premium-scrollbar flex-1 space-y-6 overflow-y-auto p-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                {t('profile.englishName')}
                            </label>
                            <input
                                className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                                value={typeof nameValue === 'string' ? nameValue : (nameValue as Record<string, string>)?.en || ''}
                                onChange={(e) => updateBilingual('name', 'en', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-end text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                {t('profile.arabicName')}
                            </label>
                            <input
                                className="h-12 w-full rounded-xl border border-border bg-background px-4 text-end text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                                value={(nameValue as Record<string, string>)?.ar || ''}
                                onChange={(e) => updateBilingual('name', 'ar', e.target.value)}
                                dir="rtl"
                                required
                            />
                        </div>
                    </div>

                    {(modal.type === 'product' || modal.type === 'service') && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    {t('products.category')}
                                </label>
                                <div className="relative">
                                    <select
                                        className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
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
                                    <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    {t('products.company')}
                                </label>
                                <div className="relative">
                                    <select
                                        className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
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
                                    <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                            {t('profile.descriptionEn')}
                        </label>
                        <textarea
                            className="min-h-[100px] w-full resize-none rounded-2xl border border-border bg-background p-4 text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                            value={typeof descValue === 'string' ? descValue : (descValue as Record<string, string>)?.en || aboutValue?.en || ''}
                            onChange={(e) => updateBilingual(descField, 'en', e.target.value)}
                            placeholder={t('profile.descriptionPlaceholder')}
                        />
                    </div>

                    <div className="space-y-2 text-right">
                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                            {t('profile.descriptionAr')}
                        </label>
                        <textarea
                            className="min-h-[100px] w-full resize-none rounded-2xl border border-border bg-background p-4 text-end text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                            value={(descValue as Record<string, string>)?.ar || aboutValue?.ar || ''}
                            onChange={(e) => updateBilingual(descField, 'ar', e.target.value)}
                            placeholder={t('profile.descriptionPlaceholderAr')}
                            dir="rtl"
                        />
                    </div>
                </div>

                <div className="flex shrink-0 justify-end gap-4 border-t border-border bg-muted/50 p-6">
                    <button
                        type="button"
                        className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted"
                        onClick={onClose}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={formSaving}
                        className="flex items-center gap-2 rounded-xl bg-primary px-10 py-2.5 text-sm font-black text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                    >
                        {formSaving && <Loader2 className="animate-spin" size={16} />}
                        {isEditing ? t('profile.saveChanges') : t('profile.addEntity', { type: modal.type })}
                    </button>
                </div>
            </form>
        </>
    );
};
