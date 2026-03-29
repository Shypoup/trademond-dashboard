import React from 'react';
import { Loader2, CheckCircle, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { displayBilingual } from '@utils/ui';
import { BilingualText, Tag } from '@data-types/api';
import type { ProductFormData } from '../../utils/productHelpers';

/**
 * Normalizes option ids to strings so Base UI Select matches items with strict equality (`Object.is`).
 */
function selectOptionValue(id: string | number): string {
    return String(id).trim();
}

/**
 * Props for the ProductFormSheet component.
 */
export interface ProductFormSheetProps {
    /** Whether the sheet is open */
    isOpen: boolean;
    /** Callback to change sheet open state */
    onOpenChange: (open: boolean) => void;
    /** ID of the product being edited, or null for creation */
    editingId: string | number | null;
    /** Current form data */
    formData: ProductFormData;
    /** Available categories */
    categories: Array<{ id: string | number; name: BilingualText }>;
    /** Available companies */
    companies: Array<{ id: string | number; name: BilingualText }>;
    /** Available tags */
    allTags: Tag[];
    /** Whether the form is currently saving */
    formSaving: boolean;
    /** Form submit handler */
    onSubmit: (e: React.FormEvent) => void;
    /** Update a bilingual field (name or description) */
    onUpdateBilingual: (field: string, lang: 'en' | 'ar', val: string) => void;
    /** Update a simple form field */
    onFormFieldChange: (field: keyof ProductFormData, value: unknown) => void;
    /** Toggle a tag in/out of the form's tag list */
    onToggleTagSelection: (tagId: string) => void;
}

/**
 * Side sheet for creating or editing a product with bilingual fields,
 * category/company selects, tag picker, and governance toggles.
 */
export const ProductFormSheet: React.FC<ProductFormSheetProps> = ({
    isOpen,
    onOpenChange,
    editingId,
    formData,
    categories,
    companies,
    allTags,
    formSaving,
    onSubmit,
    onUpdateBilingual,
    onFormFieldChange,
    onToggleTagSelection,
}) => {
    const categoryLabel = React.useMemo(() => {
        const v = formData.category_id?.trim();
        if (!v) return undefined;
        const row = categories.find((c) => selectOptionValue(c.id) === v);
        return row ? displayBilingual(row.name) : undefined;
    }, [formData.category_id, categories]);

    const companyLabel = React.useMemo(() => {
        const v = formData.company_id?.trim();
        if (!v) return undefined;
        const row = companies.find((c) => selectOptionValue(c.id) === v);
        return row ? displayBilingual(row.name) : undefined;
    }, [formData.company_id, companies]);

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex !max-w-4xl w-full max-h-screen flex-col overflow-y-auto border-none p-0 shadow-2xl">
                <div className="border-b border-border bg-muted/50 px-8 py-6 backdrop-blur-md">
                    <SheetHeader>
                        <SheetTitle className="font-outfit text-xl font-bold text-foreground">
                            {editingId ? 'Refine Product' : 'List New Product'}
                        </SheetTitle>
                        <div className="mt-4 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">1</span>
                                <span>Basic Information</span>
                            </div>
                            <div className="h-px w-6 bg-border" />
                            <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground">2</span>
                                <span>Technical Data</span>
                            </div>
                            <div className="h-px w-6 bg-border" />
                            <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground">3</span>
                                <span>Governance &amp; Approval</span>
                            </div>
                        </div>
                    </SheetHeader>
                </div>

                <form onSubmit={onSubmit} className="flex flex-1 flex-col">
                    <div className="premium-scrollbar flex-1 space-y-10 overflow-y-auto p-8">
                        <div className="space-y-6">
                            <h3 className="border-b border-primary/20 pb-2 text-xs font-black uppercase tracking-widest text-primary">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Product Name (EN) <span className="text-destructive">*</span></label>
                                    <input required className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" placeholder="e.g. Pro Drill" value={formData.name.en} onChange={e => onUpdateBilingual('name', 'en', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-end text-[11px] font-black uppercase tracking-widest text-muted-foreground">الإسم (بالعربية) <span className="text-destructive">*</span></label>
                                    <input dir="rtl" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-end text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" placeholder="اسم المنتج..." value={formData.name.ar} onChange={e => onUpdateBilingual('name', 'ar', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Description (EN)</label>
                                    <textarea rows={4} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" placeholder="Product details in English..." value={formData.description.en} onChange={e => onUpdateBilingual('description', 'en', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-end text-[11px] font-black uppercase tracking-widest text-muted-foreground">الوصف (بالعربية)</label>
                                    <textarea rows={4} dir="rtl" className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-end text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" placeholder="تفاصيل المنتج بالعربية..." value={formData.description.ar} onChange={e => onUpdateBilingual('description', 'ar', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-6">
                            <h3 className="border-b border-primary/20 pb-2 text-xs font-black uppercase tracking-widest text-primary">Technical Data</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Category <span className="text-destructive">*</span></label>
                                    <Select
                                        value={formData.category_id ? selectOptionValue(formData.category_id) : ''}
                                        onValueChange={(val) => onFormFieldChange('category_id', val ?? '')}
                                    >
                                        <SelectTrigger className="h-12 w-full rounded-xl border-border bg-background px-4 text-sm font-bold">
                                            <SelectValue placeholder="Categorize item...">{categoryLabel}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border shadow-xl">
                                            {categories.map(c => (
                                                <SelectItem key={c.id} value={selectOptionValue(c.id)} className="border-b border-border/50 text-sm last:border-0">{displayBilingual(c.name)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Company <span className="text-destructive">*</span></label>
                                    <Select
                                        value={formData.company_id ? selectOptionValue(formData.company_id) : ''}
                                        onValueChange={(val) => onFormFieldChange('company_id', val ?? '')}
                                    >
                                        <SelectTrigger className="h-12 w-full rounded-xl border-border bg-background px-4 text-sm font-bold">
                                            <SelectValue placeholder="Assign proprietor...">{companyLabel}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border shadow-xl">
                                            {companies.map(c => (
                                                <SelectItem key={c.id} value={selectOptionValue(c.id)} className="border-b border-border/50 text-sm last:border-0">{displayBilingual(c.name)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Base Price (USD)</label>
                                    <div className="relative">
                                        <input type="number" step="0.01" min="0" className="h-12 w-full rounded-xl border border-border bg-background px-4 pe-14 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" placeholder="0.00" value={formData.price} onChange={e => onFormFieldChange('price', e.target.value)} />
                                        <div className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-muted-foreground">EGP</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">SKU Ledger ID</label>
                                    <input className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold uppercase text-foreground outline-none transition-all placeholder:normal-case focus:border-primary focus:ring-2 focus:ring-ring/20" placeholder="e.g. PRO-123" value={formData.sku} onChange={e => onFormFieldChange('sku', e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Market Tags <span className="ms-1 font-bold text-muted-foreground/80">({formData.tags.length}/5)</span></label>
                                <div className="flex min-h-[100px] flex-wrap gap-2 rounded-2xl border border-border bg-muted/40 p-4">
                                    {allTags.map(tag => {
                                        const id = String(tag.id);
                                        const isSelected = formData.tags.includes(id);
                                        const isDisabled = !isSelected && formData.tags.length >= 5;
                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => onToggleTagSelection(id)}
                                                disabled={isDisabled}
                                                className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${isSelected
                                                    ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/15'
                                                    : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
                                                    } ${isDisabled ? 'cursor-not-allowed opacity-30 grayscale' : ''}`}
                                            >
                                                {displayBilingual(tag.name)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-6">
                            <h3 className="border-b border-primary/20 pb-2 text-xs font-black uppercase tracking-widest text-primary">Governance & Approval</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className="space-y-0.5 text-start">
                                            <p className="text-sm font-bold text-foreground">Active Listing</p>
                                            <p className="text-[11px] font-medium text-muted-foreground">Mark as approved and ready for transactions.</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex scale-90 cursor-pointer items-center">
                                        <input type="checkbox" checked={formData.active} onChange={e => onFormFieldChange('active', e.target.checked)} className="peer sr-only" id="active-toggle" />
                                        <div className="h-6 w-11 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-transparent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring/40" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-chart-2">
                                            <Eye size={18} />
                                        </div>
                                        <div className="space-y-0.5 text-start">
                                            <p className="text-sm font-bold text-foreground">Public Visibility</p>
                                            <p className="text-[11px] font-medium text-muted-foreground">Toggle whether this item is indexed in search.</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex scale-90 cursor-pointer items-center">
                                        <input type="checkbox" checked={formData.published} onChange={e => onFormFieldChange('published', e.target.checked)} className="peer sr-only" id="pub-toggle" />
                                        <div className="h-6 w-11 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-transparent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring/40" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border bg-muted/50 px-8 py-6 backdrop-blur-md">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl px-6 font-bold text-muted-foreground transition-all hover:bg-muted">
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={formSaving}
                            className="h-12 rounded-xl bg-primary px-10 font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
                        >
                            {formSaving && <Loader2 className="me-2 animate-spin" size={16} />}
                            {editingId ? 'Update Listing' : 'Publish Product'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
};
