import React from 'react';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    X,
    Loader2,
    ChevronDown,
    ToggleLeft,
    ToggleRight,
    Eye,
    EyeOff,
    RotateCcw,
    Filter,
    Calendar,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Tag,
    Building2,
    User,
    Heart,
    MessageSquare,
    Share2
} from 'lucide-react';
import { productService } from '../services/productService';
import { companyService } from '../services/companyService';
import { categoryService } from '../services/categoryService';
import { Product, Company, Category } from '../types/api';
import { displayBilingual, formatCurrency } from '../utils/ui';

// Helper to extract nested json:api fields or fallback to flat struct
const getProductData = (item: any) => {
    const p = item as any;
    const attrs = p.attributes || p;
    const rels = p.relationships || {};
    const meta = p.meta || {};

    const active = attrs.active !== undefined ? attrs.active : (p.active !== undefined ? p.active : true);
    const published = attrs.published !== undefined ? attrs.published : p.published;

    return {
        id: p.id,
        name: attrs.name || p.name || { en: '', ar: '' },
        description: attrs.description || p.description || { en: '', ar: '' },
        image: attrs.profilePhoto || p.profilePhoto || p.image || '',
        active,
        published,
        searchable: attrs.searchable !== undefined ? attrs.searchable : p.searchable,
        createdAt: attrs.createdAt || attrs.created_at || p.created_at || '',
        updatedAt: attrs.updatedAt || attrs.updated_at || p.updated_at || attrs.createdAt || '',
        companyId: rels.company?.id || p.company_id || p.company?.id || '',
        companyName: rels.company?.name || p.company?.name || p.company || 'N/A',
        categoryId: rels.category?.id || p.category_id || p.category?.id || '',
        categoryName: rels.category?.name || p.category?.name || p.category || 'N/A',
        ownerName: rels.owner?.name || p.owner?.name || '',
        ownerEmail: rels.owner?.email || p.owner?.email || '',
        tags: (rels.tags || p.tags || []) as Array<{ id: string; name: any }>,
        reviewsCount: meta.reviewsCount ?? p.reviewsCount ?? 0,
        likesCount: meta.likesCount ?? p.likesCount ?? 0,
        views: attrs.views ?? meta.viewsCount ?? p.views ?? 0,
        price: attrs.price ?? p.price ?? null,
        sku: attrs.sku ?? p.sku ?? '',
        premium: attrs.premium ?? p.premium ?? false,
    };
};

const getStatus = (data: ReturnType<typeof getProductData>) => {
    if (data.active && data.published) return { label: 'Approved', dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (data.active && !data.published) return { label: 'Pending', dot: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' };
    if (!data.active && data.published) return { label: 'Suspended', dot: 'bg-slate-400', text: 'text-slate-500', bg: 'bg-slate-50' };
    return { label: 'Rejected', dot: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' };
};

const timeAgo = (dateStr: string) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ROWS_OPTIONS = [10, 25, 50];

const Products = () => {
    const [loading, setLoading] = React.useState(true);
    const [productList, setProductList] = React.useState<Product[]>([]);
    const [totalProducts, setTotalProducts] = React.useState(0);
    const [companies, setCompanies] = React.useState<Company[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);

    // Filters
    const [search, setSearch] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('');
    const [filterCompany, setFilterCompany] = React.useState('');

    // Pagination
    const [page, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    // Selection
    const [selected, setSelected] = React.useState<Set<string>>(new Set());

    // Detail drawer
    const [detailProduct, setDetailProduct] = React.useState<any>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | number | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [togglingId, setTogglingId] = React.useState<string | null>(null);
    const [formData, setFormData] = React.useState({
        name: { en: '', ar: '' },
        description: { en: '', ar: '' },
        company_id: '',
        category_id: '',
        price: '',
        sku: '',
        active: true,
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
            try {
                const prodRes = await productService.getProducts({ per_page: 200 });
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
            } catch (err) { console.error('Error fetching companies:', err); }
            try {
                const catRes = await categoryService.getCategories();
                if (catRes && catRes.data) setCategories(extractCategoriesData(catRes.data));
                else if (Array.isArray(catRes)) setCategories(extractCategoriesData(catRes));
            } catch (err) { console.error('Error fetching categories:', err); }
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => { fetchData(); }, []);

    // Filtering logic
    const filtered = React.useMemo(() => {
        return productList.filter(p => {
            const d = getProductData(p);
            const nameStr = displayBilingual(d.name).toLowerCase();
            const skuStr = (d.sku || '').toLowerCase();
            const searchMatch = !search || nameStr.includes(search.toLowerCase()) || skuStr.includes(search.toLowerCase());
            const catMatch = !filterCategory || String(d.categoryId) === filterCategory;
            const compMatch = !filterCompany || String(d.companyId) === filterCompany;
            const status = getStatus(d);
            const statusMatch = !filterStatus || status.label.toLowerCase() === filterStatus.toLowerCase();
            return searchMatch && catMatch && compMatch && statusMatch;
        });
    }, [productList, search, filterCategory, filterStatus, filterCompany]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const paginatedList = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
                sku: data.sku || '',
                active: data.active,
            });
        } else {
            setEditingId(null);
            setFormData({ name: { en: '', ar: '' }, description: { en: '', ar: '' }, company_id: '', category_id: '', price: '', sku: '', active: true });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await productService.deleteProduct(String(id));
            setProductList(prev => prev.filter(p => p.id !== id));
            setTotalProducts(prev => prev - 1);
        } catch (error) { console.error('Delete failed', error); }
    };

    const handleToggleActive = async (id: string | number) => {
        setTogglingId(`active-${id}`);
        try {
            await productService.toggleActive(String(id));
            setProductList(prev => prev.map((p: any) => {
                if (p.id !== id) return p;
                const attrs = p.attributes ? { ...p.attributes, active: !p.attributes.active } : undefined;
                return attrs ? { ...p, attributes: attrs } : { ...p, active: !p.active };
            }));
        } catch (error) { console.error('Toggle active failed', error); }
        finally { setTogglingId(null); }
    };

    const handleTogglePublished = async (id: string | number) => {
        setTogglingId(`pub-${id}`);
        try {
            await productService.togglePublished(String(id));
            setProductList(prev => prev.map((p: any) => {
                if (p.id !== id) return p;
                const attrs = p.attributes ? { ...p.attributes, published: !p.attributes.published } : undefined;
                return attrs ? { ...p, attributes: attrs } : { ...p, published: !p.published };
            }));
        } catch (error) { console.error('Toggle published failed', error); }
        finally { setTogglingId(null); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            if (editingId) await productService.updateProduct(String(editingId), formData);
            await fetchData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save product');
        } finally { setFormSaving(false); }
    };

    const updateBilingual = (field: string, lang: 'en' | 'ar', val: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: { ...(prev[field] || {}), [lang]: val } }));
    };

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === paginatedList.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(paginatedList.map((p: any) => String(p.id))));
        }
    };

    const activeCount = productList.filter(p => getProductData(p).active).length;
    const publishedCount = productList.filter(p => getProductData(p).published).length;
    const pendingCount = productList.filter(p => { const d = getProductData(p); return d.active && !d.published; }).length;

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

    const pageNumbers = () => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push('...');
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
            if (page < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="space-y-5 pb-12">
            {/* Page Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Products Management</h2>
                    <p className="text-slate-500 text-sm mt-1">{totalProducts.toLocaleString()} total products registered in the platform</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#008080] rounded-xl text-sm font-semibold text-white hover:bg-[#006666] transition-all shadow-sm"
                >
                    <Plus size={16} />
                    <span>Add Product</span>
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Filter by product name, SKU..."
                            className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
                        />
                    </div>

                    {/* Category filter */}
                    <div className="relative">
                        <select
                            value={filterCategory}
                            onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
                            className="h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-medium appearance-none focus:outline-none focus:border-teal-400 cursor-pointer"
                        >
                            <option value="">Category</option>
                            {categories.map((c: any) => <option key={c.id} value={String(c.id)}>{displayBilingual(c.name)}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                            className="h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-medium appearance-none focus:outline-none focus:border-teal-400 cursor-pointer"
                        >
                            <option value="">Status</option>
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>

                    {/* Company filter */}
                    <div className="relative">
                        <select
                            value={filterCompany}
                            onChange={e => { setFilterCompany(e.target.value); setPage(1); }}
                            className="h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-medium appearance-none focus:outline-none focus:border-teal-400 cursor-pointer"
                        >
                            <option value="">Company</option>
                            {companies.map((c: any) => <option key={c.id} value={String(c.id)}>{displayBilingual(c.name)}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>

                    {/* Date placeholder */}
                    <button className="h-9 px-3 flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-500 hover:border-slate-300 transition-colors">
                        <Calendar size={14} />
                        <span>Date</span>
                    </button>

                    {/* Refresh */}
                    <button onClick={fetchData} title="Refresh" className="h-9 w-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-colors">
                        <RotateCcw size={15} />
                    </button>

                    {/* Bulk Actions */}
                    {selected.size > 0 && (
                        <div className="ml-auto flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500">{selected.size} selected</span>
                            <button className="h-9 px-4 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                                Bulk Actions <ChevronDown size={13} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/60">
                                <th className="pl-5 pr-3 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={paginatedList.length > 0 && selected.size === paginatedList.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                    />
                                </th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Company</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Views</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Price</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Updated</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedList.map((p: any) => {
                                const data = getProductData(p);
                                const status = getStatus(data);
                                const isSelected = selected.has(String(p.id));
                                return (
                                    <tr key={p.id} className={`transition-colors ${isSelected ? 'bg-teal-50/40' : 'hover:bg-slate-50/60'}`}>
                                        <td className="pl-5 pr-3 py-4">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(String(p.id))}
                                                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                            />
                                        </td>
                                        {/* Product */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-100">
                                                    <img
                                                        src={data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayBilingual(data.name))}&background=1e293b&color=94a3b8&size=44`}
                                                        alt={displayBilingual(data.name)}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-[13.5px] font-semibold text-slate-800 truncate max-w-[160px]">{displayBilingual(data.name)}</span>
                                                        {data.premium && (
                                                            <span className="text-[9px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded uppercase tracking-tight shrink-0">Premium</span>
                                                        )}
                                                    </div>
                                                    {data.sku && (
                                                        <p className="text-[11px] text-slate-400 mt-0.5">SKU: {data.sku}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Company */}
                                        <td className="px-4 py-4">
                                            <span className="text-[13px] font-semibold text-[#008080]">{displayBilingual(data.companyName)}</span>
                                        </td>
                                        {/* Category */}
                                        <td className="px-4 py-4">
                                            <span className="text-[13px] text-slate-600">{displayBilingual(data.categoryName)}</span>
                                        </td>
                                        {/* Status */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`}></span>
                                                <span className={`text-[13px] font-semibold ${status.text}`}>{status.label}</span>
                                            </div>
                                        </td>
                                        {/* Views */}
                                        <td className="px-4 py-4 text-right">
                                            <span className="text-[13px] font-medium text-slate-600">{data.views > 0 ? data.views.toLocaleString() : '—'}</span>
                                        </td>
                                        {/* Price */}
                                        <td className="px-4 py-4 text-right">
                                            <span className="text-[13px] font-semibold text-slate-800">
                                                {data.price !== null && data.price !== '' && data.price !== undefined
                                                    ? formatCurrency(data.price)
                                                    : '—'}
                                            </span>
                                        </td>
                                        {/* Updated */}
                                        <td className="px-4 py-4">
                                            <span className="text-[12px] text-slate-400">{timeAgo(data.updatedAt || data.createdAt)}</span>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-0.5">
                                                {/* View Details */}
                                                <button
                                                    title="View Details"
                                                    onClick={() => setDetailProduct(p)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                                                >
                                                    <ExternalLink size={15} />
                                                </button>
                                                <button
                                                    title={data.active ? 'Deactivate' : 'Activate'}
                                                    onClick={() => handleToggleActive(p.id)}
                                                    disabled={togglingId === `active-${p.id}`}
                                                    className={`p-1.5 rounded-lg transition-colors ${data.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
                                                >
                                                    {togglingId === `active-${p.id}` ? <Loader2 size={15} className="animate-spin" /> : data.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                                                </button>
                                                <button
                                                    title={data.published ? 'Unpublish' : 'Publish'}
                                                    onClick={() => handleTogglePublished(p.id)}
                                                    disabled={togglingId === `pub-${p.id}`}
                                                    className={`p-1.5 rounded-lg transition-colors ${data.published ? 'text-sky-500 hover:bg-sky-50' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
                                                >
                                                    {togglingId === `pub-${p.id}` ? <Loader2 size={15} className="animate-spin" /> : data.published ? <Eye size={15} /> : <EyeOff size={15} />}
                                                </button>
                                                <button
                                                    title="Edit"
                                                    onClick={() => handleOpenModal(p)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                >
                                                    <Edit size={15} />
                                                </button>
                                                <button
                                                    title="Delete"
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {paginatedList.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                <Search size={18} />
                                            </div>
                                            <p className="text-sm font-medium text-slate-500">No products found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <p className="text-xs text-slate-500">
                            Showing <span className="font-semibold text-slate-700">{filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}-{Math.min(page * rowsPerPage, filtered.length)}</span> of <span className="font-semibold text-slate-700">{filtered.length.toLocaleString()}</span> products
                        </p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Rows:</span>
                            {ROWS_OPTIONS.map(n => (
                                <button
                                    key={n}
                                    onClick={() => { setRowsPerPage(n); setPage(1); }}
                                    className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${rowsPerPage === n ? 'bg-teal-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={15} />
                        </button>
                        {pageNumbers().map((pg, i) =>
                            pg === '...'
                                ? <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">...</span>
                                : <button
                                    key={pg}
                                    onClick={() => setPage(pg as number)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${page === pg ? 'bg-[#008080] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {pg}
                                </button>
                        )}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <CheckCircle className="text-teal-600" size={22} />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Products</p>
                        <div className="flex items-end gap-2 mt-0.5">
                            <h3 className="text-2xl font-bold text-slate-900">{activeCount.toLocaleString()}</h3>
                            <span className="text-[11px] font-bold text-teal-600 flex items-center gap-0.5 pb-0.5">
                                <TrendingUp size={11} /> Live
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <AlertTriangle className="text-amber-500" size={22} />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Review</p>
                        <div className="flex items-end gap-2 mt-0.5">
                            <h3 className="text-2xl font-bold text-slate-900">{pendingCount.toLocaleString()}</h3>
                            <span className="text-[11px] font-semibold text-amber-500 pb-0.5">Active + Unpublished</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                        <Eye className="text-sky-500" size={22} />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Published</p>
                        <div className="flex items-end gap-2 mt-0.5">
                            <h3 className="text-2xl font-bold text-slate-900">{publishedCount.toLocaleString()}</h3>
                            <span className="text-[11px] font-semibold text-sky-500 pb-0.5">Visible to users</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh]">
                            <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">English Name</label>
                                        <input required className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none" value={formData.name.en} onChange={e => updateBilingual('name', 'en', e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right block">الإسم بالعربية</label>
                                        <input dir="rtl" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none" value={formData.name.ar} onChange={e => updateBilingual('name', 'ar', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                                        <div className="relative">
                                            <select className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium appearance-none outline-none focus:border-teal-500 transition-all" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                                <option value="">Select Category...</option>
                                                {categories.map((c: any) => <option key={c.id} value={String(c.id)}>{displayBilingual(c.name)}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Company</label>
                                        <div className="relative">
                                            <select className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium appearance-none outline-none focus:border-teal-500 transition-all" value={formData.company_id} onChange={e => setFormData({ ...formData, company_id: e.target.value })}>
                                                <option value="">Select Company...</option>
                                                {companies.map((c: any) => <option key={c.id} value={String(c.id)}>{displayBilingual(c.name)}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Price (USD)</label>
                                        <input type="number" step="0.01" min="0" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">SKU</label>
                                        <input className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                                    </div>
                                </div>
                                {editingId && (
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                                            <span className="text-sm font-semibold text-slate-700">Mark as Active</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                                <button type="button" className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-8 py-2 bg-teal-600 rounded-xl text-sm font-bold text-white hover:bg-teal-700 transition-all flex items-center gap-2">
                                    {formSaving && <Loader2 className="animate-spin" size={15} />}
                                    {editingId ? 'Save Changes' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ────── Detail Drawer ────── */}
            {detailProduct && (() => {
                const d = getProductData(detailProduct);
                const status = getStatus(d);
                return (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-[50] bg-slate-900/30 backdrop-blur-[2px] transition-opacity"
                            onClick={() => setDetailProduct(null)}
                        />
                        {/* Panel */}
                        <div className="fixed top-0 right-0 h-full z-[60] w-[460px] bg-white shadow-2xl flex flex-col overflow-hidden"
                            style={{ animation: 'slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)' }}
                        >
                            {/* Banner image */}
                            <div className="relative h-52 bg-slate-800 shrink-0 overflow-hidden">
                                <img
                                    src={d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayBilingual(d.name))}&background=1e293b&color=94a3b8&size=460`}
                                    alt={displayBilingual(d.name)}
                                    className="w-full h-full object-cover opacity-90"
                                />
                                {/* Header actions */}
                                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${status.bg} ${status.text} border border-white/20`}>
                                            {status.label === 'Pending' ? 'Pending Moderation' : status.label}
                                        </span>
                                        {d.categoryName && d.categoryName !== 'N/A' && (
                                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide bg-slate-700/70 text-white border border-white/20">
                                                {displayBilingual(d.categoryName)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                                            <Share2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => setDetailProduct(null)}
                                            className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto">
                                {/* Title block */}
                                <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                                    <h2 className="text-xl font-bold text-slate-900 leading-snug">{displayBilingual(d.name)}</h2>
                                    {d.name?.ar && <p className="text-sm text-slate-400 mt-0.5" dir="rtl">{d.name.ar}</p>}
                                    <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                                        {displayBilingual(d.description) || <span className="italic text-slate-300">No description provided.</span>}
                                    </p>
                                    {d.sku && <p className="text-[11px] text-slate-400 mt-2">SKU: <span className="font-semibold text-slate-600">{d.sku}</span></p>}
                                </div>

                                {/* Stats pills */}
                                <div className="px-6 py-4 flex gap-4 border-b border-slate-100">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Heart size={14} className="text-rose-400" />
                                        <span className="text-sm font-semibold">{d.likesCount}</span>
                                        <span className="text-xs text-slate-400">Likes</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <MessageSquare size={14} className="text-blue-400" />
                                        <span className="text-sm font-semibold">{d.reviewsCount}</span>
                                        <span className="text-xs text-slate-400">Reviews</span>
                                    </div>
                                    {d.price !== null && d.price !== '' && (
                                        <div className="ml-auto">
                                            <span className="text-lg font-bold text-slate-800">{formatCurrency(d.price)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Company card */}
                                <div className="px-6 py-4 border-b border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Company</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                                                <Building2 size={18} className="text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{displayBilingual(d.companyName)}</p>
                                                <p className="text-[11px] text-slate-400">Company partner</p>
                                            </div>
                                        </div>
                                        <button className="text-[12px] font-semibold text-teal-600 hover:text-teal-700 transition-colors">View Profile →</button>
                                    </div>
                                </div>

                                {/* Owner */}
                                {(d.ownerName || d.ownerEmail) && (
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Owner</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                                <User size={16} className="text-slate-400" />
                                            </div>
                                            <div>
                                                {d.ownerName && <p className="text-sm font-bold text-slate-800">{d.ownerName}</p>}
                                                {d.ownerEmail && <p className="text-[11px] text-slate-400">{d.ownerEmail}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tags */}
                                {d.tags.length > 0 && (
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Tags</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {d.tags.map((tag: any) => (
                                                <span key={tag.id} className="flex items-center gap-1 text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-full">
                                                    <Tag size={10} />{displayBilingual(tag.name)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Admin notes field */}
                                <div className="px-6 py-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Admin Notes (Internal Only)</p>
                                    <textarea
                                        rows={3}
                                        placeholder="Add internal notes about this product..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center gap-3">
                                <button
                                    onClick={() => { handleDelete(d.id); setDetailProduct(null); }}
                                    className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-bold hover:bg-rose-50 transition-colors"
                                >
                                    <Trash2 size={15} /> Delete
                                </button>
                                <button
                                    onClick={() => { handleToggleActive(d.id); }}
                                    disabled={togglingId === `active-${d.id}`}
                                    className={`flex-1 h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors border ${d.active
                                        ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                        }`}
                                >
                                    {togglingId === `active-${d.id}` ? <Loader2 size={15} className="animate-spin" /> : d.active ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
                                    {d.active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => { handleTogglePublished(d.id); }}
                                    disabled={togglingId === `pub-${d.id}`}
                                    className={`flex-1 h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors ${d.published
                                        ? 'bg-slate-800 text-white hover:bg-slate-700'
                                        : 'bg-[#008080] text-white hover:bg-[#006666]'
                                        }`}
                                >
                                    {togglingId === `pub-${d.id}` ? <Loader2 size={15} className="animate-spin" /> : d.published ? <EyeOff size={15} /> : <Eye size={15} />}
                                    {d.published ? 'Unpublish' : 'Publish'}
                                </button>
                            </div>
                        </div>

                        <style>{`
                            @keyframes slideInRight {
                                from { transform: translateX(100%); }
                                to   { transform: translateX(0); }
                            }
                        `}</style>
                    </>
                );
            })()}
        </div>
    );
};

export default Products;
