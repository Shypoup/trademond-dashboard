import React from 'react';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    CheckCircle2,
    Clock,
    TrendingUp,
    ShieldAlert,
    X,
    Loader2,
    ChevronDown
} from 'lucide-react';
import { productService } from '../services/productService';
import { companyService } from '../services/companyService';
import { categoryService } from '../services/categoryService';
import { Product, Company, Category } from '../types/api';
import { displayBilingual, formatCurrency, getStatusStyles } from '../utils/ui';

// Helper to extract nested json:api fields or fallback to flat struct
const getProductData = (item: any) => {
    const p = item as any;
    const attrs = p.attributes || p;
    const rels = p.relationships || {};
    const meta = p.meta || {};

    return {
        id: p.id,
        name: attrs.name || p.name || { en: '', ar: '' },
        description: attrs.description || p.description || { en: '', ar: '' },
        image: attrs.profilePhoto || p.profilePhoto || p.image || '',
        active: attrs.active !== undefined ? attrs.active : (p.active !== undefined ? p.active : true),
        published: attrs.published !== undefined ? attrs.published : p.published,
        createdAt: attrs.createdAt || attrs.created_at || p.created_at || '',
        companyId: rels.company?.id || p.company_id || p.company?.id || '',
        companyName: rels.company?.name || p.company?.name || p.company || 'N/A',
        categoryId: rels.category?.id || p.category_id || p.category?.id || '',
        categoryName: rels.category?.name || p.category?.name || p.category || 'N/A',
        ownerName: rels.owner?.name || p.owner?.name || '',
        ownerEmail: rels.owner?.email || p.owner?.email || '',
        tags: (rels.tags || p.tags || []) as Array<{ id: string; name: any }>,
        reviewsCount: meta.reviewsCount ?? p.reviewsCount ?? 0,
        likesCount: meta.likesCount ?? p.likesCount ?? 0,
        price: attrs.price ?? p.price ?? '',
        sku: attrs.sku ?? p.sku ?? '',
    };
};

const Products = () => {
    const [loading, setLoading] = React.useState(true);
    const [productList, setProductList] = React.useState<Product[]>([]);
    const [totalProducts, setTotalProducts] = React.useState(0);
    const [companies, setCompanies] = React.useState<Company[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | number | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: { en: '', ar: '' },
        description: { en: '', ar: '' },
        company_id: '',
        category_id: '',
        price: '',
        sku: ''
    });

    const extractCompaniesData = (data: any[]) => {
        if (!Array.isArray(data)) return [];
        return data.map(c => {
            const attrs = c.attributes || c;
            return { id: c.id || attrs.id, name: attrs.name || c.name || '' };
        });
    };

    const extractCategoriesData = (data: any[]) => {
        if (!Array.isArray(data)) return [];
        return data.map(c => {
            const attrs = c.attributes || c;
            return { id: c.id || attrs.id, name: attrs.name || c.name || '' };
        });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Uncouple requests so products render even if companies fail
            try {
                const prodRes = await productService.getProducts();
                if (prodRes && prodRes.data) {
                    const dataArr = (Array.isArray(prodRes.data) ? prodRes.data : Object.values(prodRes.data)) as Product[];
                    setProductList(dataArr);
                    setTotalProducts(prodRes.meta?.total || dataArr.length);
                } else if (Array.isArray(prodRes)) {
                    setProductList(prodRes);
                    setTotalProducts(prodRes.length);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
            }

            try {
                const compRes = await companyService.getCompanies();
                if (compRes && compRes.data) setCompanies(extractCompaniesData(compRes.data));
                else if (Array.isArray(compRes)) setCompanies(extractCompaniesData(compRes));
            } catch (err) {
                console.error('Error fetching companies:', err);
            }

            try {
                const catRes = await categoryService.getCategories();
                if (catRes && catRes.data) setCategories(extractCategoriesData(catRes.data));
                else if (Array.isArray(catRes)) setCategories(extractCategoriesData(catRes));
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (product?: Product) => {
        if (product) {
            const data = getProductData(product);
            setEditingId(data.id);
            setFormData({
                name: typeof data.name === 'string' ? { en: data.name, ar: '' } : data.name,
                description: typeof data.description === 'string' ? { en: data.description, ar: '' } : data.description,
                company_id: String(data.companyId),
                category_id: String(data.categoryId),
                price: String(data.price || ''),
                sku: data.sku || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                name: { en: '', ar: '' },
                description: { en: '', ar: '' },
                company_id: String(companies[0]?.id || ''),
                category_id: String(categories[0]?.id || ''),
                price: '',
                sku: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await productService.deleteProduct(String(id));
            setProductList(prev => prev.filter(p => p.id !== id));
            setTotalProducts(prev => prev - 1);
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            if (editingId) {
                await productService.updateProduct(String(editingId), formData);
            } else {
                await productService.updateProduct('', formData);
            }
            await fetchData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save product');
        } finally {
            setFormSaving(false);
        }
    };

    const updateBilingual = (field: string, lang: 'en' | 'ar', val: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: { ...(prev[field] || {}), [lang]: val }
        }));
    };

    if (loading && productList.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold animate-pulse text-sm">Loading Product Catalog...</p>
                </div>
            </div>
        );
    }

    const activeCount = productList.filter(p => getProductData(p).active).length;
    const publishedCount = productList.filter(p => getProductData(p).published).length;
    const inactiveCount = productList.filter(p => !getProductData(p).active).length;

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Products Management</h2>
                    <p className="text-slate-500 text-sm mt-1">{totalProducts.toLocaleString()} total products registered in the platform</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-lg hover:shadow-teal-100"
                >
                    <Plus size={18} />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="premium-card overflow-hidden bg-white">
                <div className="p-4 border-b border-slate-50 flex flex-wrap items-center gap-4 bg-slate-50/30">
                    <div className="flex-1 min-w-[300px] relative group">
                        <Search className="absolute inset-y-0 left-4 flex items-center mt-3 text-slate-400 group-focus-within:text-teal-500 transition-colors pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Filter by product name, SKU..."
                            className="w-full h-11 pl-12 pr-4 bg-white border border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-50 rounded-xl text-sm transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tags</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Owner</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {productList.map((p) => {
                                const data = getProductData(p);
                                return (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                        {/* Product */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 shrink-0 group-hover:scale-105 transition-transform duration-300">
                                                    <img src={data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayBilingual(data.name))}&background=008080&color=fff`} alt={displayBilingual(data.name)} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h5 className="text-[13px] font-bold text-slate-800 truncate max-w-[170px]">{displayBilingual(data.name)}</h5>
                                                    <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[170px]">{displayBilingual(data.description) || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Company */}
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold text-teal-600 whitespace-nowrap">
                                                {displayBilingual(data.companyName)}
                                            </span>
                                        </td>
                                        {/* Category */}
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
                                                {displayBilingual(data.categoryName)}
                                            </span>
                                        </td>
                                        {/* Tags */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                {data.tags.slice(0, 2).map((tag: any) => (
                                                    <span key={tag.id} className="text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        {displayBilingual(tag.name)}
                                                    </span>
                                                ))}
                                                {data.tags.length > 2 && (
                                                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">+{data.tags.length - 2}</span>
                                                )}
                                                {data.tags.length === 0 && <span className="text-[11px] text-slate-300">—</span>}
                                            </div>
                                        </td>
                                        {/* Owner */}
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="text-[12px] font-bold text-slate-700">{data.ownerName || '—'}</p>
                                                {data.ownerEmail && <p className="text-[11px] text-slate-400 mt-0.5">{data.ownerEmail}</p>}
                                            </div>
                                        </td>
                                        {/* Status */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${data.active
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-rose-50 text-rose-600 border-rose-100'
                                                    }`}>
                                                    {data.active ? 'Active' : 'Inactive'}
                                                </span>
                                                {data.published && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-sky-50 text-sky-600 border-sky-100 w-fit">Published</span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Created */}
                                        <td className="px-6 py-5">
                                            <span className="text-[11px] text-slate-400 whitespace-nowrap">
                                                {data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </span>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-5 pr-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleOpenModal(p)} className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {productList.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">No products found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
                    <p className="text-xs font-semibold text-slate-400">
                        Showing total <span className="text-slate-900 font-bold">{totalProducts.toLocaleString()}</span> products
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card p-6 border-l-4 border-teal-500 bg-gradient-to-br from-white to-teal-50/20">
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-teal-50 rounded-xl text-teal-600"><CheckCircle2 size={22} /></div>
                        <div className="text-[11px] font-bold text-teal-600 bg-teal-50/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <TrendingUp size={12} />
                            <span>Live</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-slate-500 text-[13px] font-medium uppercase tracking-wider">Active Products</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1 font-outfit">{activeCount}</h3>
                    </div>
                </div>

                <div className="premium-card p-6 border-l-4 border-amber-500 bg-gradient-to-br from-white to-amber-50/20">
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 w-fit"><Clock size={22} /></div>
                    <div className="mt-4">
                        <p className="text-slate-500 text-[13px] font-medium uppercase tracking-wider">Published</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1 font-outfit">{publishedCount}</h3>
                    </div>
                </div>

                <div className="premium-card p-6 border-l-4 border-rose-500 bg-gradient-to-br from-white to-rose-50/20">
                    <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 w-fit"><ShieldAlert size={22} /></div>
                    <div className="mt-4">
                        <p className="text-slate-500 text-[13px] font-medium uppercase tracking-wider">Inactive</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1 font-outfit">{inactiveCount}</h3>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-slate-900">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh]">
                            <div className="p-8 space-y-6 overflow-y-auto premium-scrollbar flex-1">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">English Name</label>
                                        <input required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none" value={formData.name.en} onChange={e => updateBilingual('name', 'en', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block">الإسم بالعربية</label>
                                        <input required dir="rtl" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none text-right" value={formData.name.ar} onChange={e => updateBilingual('name', 'ar', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                                        <div className="relative">
                                            <select required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-teal-500 transition-all" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                                <option value="">Select Category...</option>
                                                {categories.map(c => <option key={c.id} value={String(c.id)}>{displayBilingual(c.name)}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Company</label>
                                        <div className="relative">
                                            <select required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-teal-500 transition-all" value={formData.company_id} onChange={e => setFormData({ ...formData, company_id: e.target.value })}>
                                                <option value="">Select Company...</option>
                                                {companies.map(c => <option key={c.id} value={String(c.id)}>{displayBilingual(c.name)}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Price (USD)</label>
                                        <input type="number" step="0.01" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">SKU</label>
                                        <input className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-4 bg-slate-50">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-10 py-2.5 bg-teal-600 rounded-xl text-sm font-black text-white hover:bg-teal-700 transition-all flex items-center gap-2">
                                    {formSaving && <Loader2 className="animate-spin" size={16} />} Save Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
