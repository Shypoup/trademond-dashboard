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
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="p-0 !max-w-4xl w-full max-h-screen overflow-y-auto border-none shadow-2xl flex flex-col">
                <div className="px-8 py-6 bg-slate-50/80 backdrop-blur-md border-b">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold text-slate-900 font-outfit">
                            {editingId ? 'Refine Product' : 'List New Product'}
                        </SheetTitle>
                        <div className="mt-4 flex items-center gap-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">1</span>
                                <span>Basic Information</span>
                            </div>
                            <div className="h-px w-6 bg-slate-200" />
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">2</span>
                                <span>Technical Data</span>
                            </div>
                            <div className="h-px w-6 bg-slate-200" />
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">3</span>
                                <span>Governance &amp; Approval</span>
                            </div>
                        </div>
                    </SheetHeader>
                </div>

                <form onSubmit={onSubmit} className="flex flex-col flex-1">
                    <div className="p-8 space-y-10 flex-1 overflow-y-auto premium-scrollbar">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-teal-600 uppercase tracking-widest border-b border-teal-100 pb-2">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Product Name (EN) <span className="text-rose-500">*</span></label>
                                    <input required className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold focus:border-teal-500 transition-all outline-none" placeholder="e.g. Pro Drill" value={formData.name.en} onChange={e => onUpdateBilingual('name', 'en', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block">الإسم (بالعربية) <span className="text-rose-500">*</span></label>
                                    <input dir="rtl" className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold focus:border-teal-500 transition-all outline-none text-right" placeholder="اسم المنتج..." value={formData.name.ar} onChange={e => onUpdateBilingual('name', 'ar', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Description (EN)</label>
                                    <textarea rows={4} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-teal-500 transition-all outline-none resize-none" placeholder="Product details in English..." value={formData.description.en} onChange={e => onUpdateBilingual('description', 'en', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block">الوصف (بالعربية)</label>
                                    <textarea rows={4} dir="rtl" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-teal-500 transition-all outline-none resize-none text-right" placeholder="تفاصيل المنتج بالعربية..." value={formData.description.ar} onChange={e => onUpdateBilingual('description', 'ar', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-teal-600 uppercase tracking-widest border-b border-teal-100 pb-2">Technical Data</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Category <span className="text-rose-500">*</span></label>
                                    <Select value={formData.category_id} onValueChange={(val) => onFormFieldChange('category_id', val ?? '')}>
                                        <SelectTrigger className="w-full h-12 bg-white border-slate-200 rounded-xl px-4 text-sm font-bold">
                                            <SelectValue placeholder="Categorize item..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-xl border-slate-200">
                                            {categories.map(c => (
                                                <SelectItem key={c.id} value={String(c.id)} className="text-sm border-b border-slate-50 last:border-0">{displayBilingual(c.name)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Company <span className="text-rose-500">*</span></label>
                                    <Select value={formData.company_id} onValueChange={(val) => onFormFieldChange('company_id', val ?? '')}>
                                        <SelectTrigger className="w-full h-12 bg-white border-slate-200 rounded-xl px-4 text-sm font-bold">
                                            <SelectValue placeholder="Assign proprietor..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-xl border-slate-200">
                                            {companies.map(c => (
                                                <SelectItem key={c.id} value={String(c.id)} className="text-sm border-b border-slate-50 last:border-0">{displayBilingual(c.name)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Base Price (USD)</label>
                                    <div className="relative">
                                        <input type="number" step="0.01" min="0" className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold focus:border-teal-500 transition-all outline-none" placeholder="0.00" value={formData.price} onChange={e => onFormFieldChange('price', e.target.value)} />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">EGP</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">SKU Ledger ID</label>
                                    <input className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold focus:border-teal-500 transition-all outline-none uppercase placeholder:lowercase" placeholder="e.g. PRO-123" value={formData.sku} onChange={e => onFormFieldChange('sku', e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Market Tags <span className="text-slate-300 font-bold ml-1">({formData.tags.length}/5)</span></label>
                                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[100px]">
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
                                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${isSelected
                                                    ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/10'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600'
                                                    } ${isDisabled ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
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
                            <h3 className="text-xs font-black text-teal-600 uppercase tracking-widest border-b border-teal-100 pb-2">Governance & Approval</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className="space-y-0.5 text-left">
                                            <p className="text-sm font-bold text-slate-800">Active Listing</p>
                                            <p className="text-[11px] text-slate-400 font-medium">Mark as approved and ready for transactions.</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer scale-90">
                                        <input type="checkbox" checked={formData.active} onChange={e => onFormFieldChange('active', e.target.checked)} className="sr-only peer" id="active-toggle" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                                            <Eye size={18} />
                                        </div>
                                        <div className="space-y-0.5 text-left">
                                            <p className="text-sm font-bold text-slate-800">Public Visibility</p>
                                            <p className="text-[11px] text-slate-400 font-medium">Toggle whether this item is indexed in search.</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer scale-90">
                                        <input type="checkbox" checked={formData.published} onChange={e => onFormFieldChange('published', e.target.checked)} className="sr-only peer" id="pub-toggle" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-slate-50/80 backdrop-blur-md border-t flex items-center justify-between">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="px-6 rounded-xl font-bold text-slate-500 hover:bg-slate-200/50 transition-all">
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={formSaving}
                            className="h-12 px-10 bg-teal-600 hover:bg-teal-700 rounded-xl font-black text-white shadow-lg shadow-teal-600/20 transition-all active:scale-95"
                        >
                            {formSaving && <Loader2 className="animate-spin mr-2" size={16} />}
                            {editingId ? 'Update Listing' : 'Publish Product'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
};
