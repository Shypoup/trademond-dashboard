import React from 'react';
import { Plus, Loader2, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProductsTabProps } from '../../utils/types';
import { StatusBadge } from '../StatusBadge';

/**
 * Products tab listing all products for the selected company,
 * with inline edit and delete actions.
 */
export const ProductsTab: React.FC<ProductsTabProps> = ({
    products,
    companies,
    selectedCompanyId,
    onSelectCompany,
    tabLoading,
    onOpenModal,
    onDelete,
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <h4 className="font-black text-xl text-slate-900 font-outfit tracking-tighter italic">
                        {t('profile.productCatalog')}
                    </h4>
                    <div className="relative">
                        <select
                            value={selectedCompanyId}
                            onChange={(e) => onSelectCompany(e.target.value)}
                            className="bg-slate-100 border-none rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none pr-8 cursor-pointer"
                        >
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>
                                    {typeof c.name === 'string' ? c.name : c.name.en}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                    </div>
                </div>
                <button
                    onClick={() => onOpenModal('product')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-teal-600 transition-all shadow-lg active:scale-95"
                >
                    <Plus size={16} />
                    <span>{t('profile.listProduct')}</span>
                </button>
            </div>

            {tabLoading ? (
                <div className="premium-card p-12 flex items-center justify-center">
                    <Loader2 className="animate-spin text-teal-500" size={32} />
                </div>
            ) : (
                <div className="space-y-4">
                    {products.length === 0 ? (
                        <div className="premium-card p-12 text-center border-dashed border-2">
                            <p className="font-black text-slate-400 text-xs uppercase tracking-widest">
                                {t('profile.noProducts')}
                            </p>
                        </div>
                    ) : products.map((product) => (
                        <div key={product.id} className="premium-card p-4 flex items-center gap-6 hover:shadow-xl transition-all border-l-[6px] border-l-teal-500">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden border">
                                <img
                                    src={product.image || 'https://via.placeholder.com/150'}
                                    className="w-full h-full object-cover"
                                    alt=""
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest mb-1">
                                    {product.category?.name
                                        ? (typeof product.category.name === 'string' ? product.category.name : product.category.name.en)
                                        : t('profile.uncategorized')}
                                </p>
                                <h5 className="font-black text-slate-800 truncate text-lg tracking-tight leading-none mb-1">
                                    {typeof product.name === 'string' ? product.name : product.name.en}
                                </h5>
                                <p className="text-[11px] text-slate-400 font-bold truncate pr-8">
                                    {typeof product.description === 'string'
                                        ? product.description
                                        : product.description?.en || t('profile.noDescription')}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge published={product.published} />
                                <div className="flex items-center bg-slate-50 p-1.5 rounded-xl border">
                                    <button
                                        onClick={() => onOpenModal('product', product.id)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(product.id)}
                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
