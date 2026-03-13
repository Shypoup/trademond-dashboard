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
    Tag as TagIcon,
    Building2,
    User,
    Heart,
    MessageSquare,
    Share2
} from 'lucide-react';
import { productService } from '../services/productService';
import { companyService } from '../services/companyService';
import { categoryService } from '../services/categoryService';
import { tagService } from '../services/tagService';
import { Product, Company, Category, Tag } from '../types/api';
import { displayBilingual, formatCurrency } from '../utils/ui';
import { toast } from "sonner";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


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
    const [allTags, setAllTags] = React.useState<Tag[]>([]);

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
    const [editingId, setEditingId] = React.useState<number | null>(null);
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
        published: false,
        tags: [] as string[],
    });
    const [deleteProductId, setDeleteProductId] = React.useState<string | number | null>(null);

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
            try {
                const tagsRes = await tagService.getTags({ per_page: 200 });
                if (tagsRes && tagsRes.data) setAllTags(tagsRes.data as Tag[]);
                else if (Array.isArray(tagsRes)) setAllTags(tagsRes as Tag[]);
            } catch (err) { console.error('Error fetching tags:', err); }
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setSearch('');
        setFilterCategory('all');
        setFilterStatus('all');
        setFilterCompany('all');
        setPage(1);
        fetchData();
        toast.info("Filters reset and data refreshed");
    };

    React.useEffect(() => { fetchData(); }, []);

    // Filtering logic
    const filtered = React.useMemo(() => {
        return productList.filter(p => {
            const d = getProductData(p);
            const nameStr = displayBilingual(d.name).toLowerCase();
            const skuStr = (d.sku || '').toLowerCase();
            const searchMatch = !search || nameStr.includes(search.toLowerCase()) || skuStr.includes(search.toLowerCase());
            const catMatch = !filterCategory || filterCategory === 'all' || String(d.categoryId) === filterCategory;
            const compMatch = !filterCompany || filterCompany === 'all' || String(d.companyId) === filterCompany;
            const status = getStatus(d);
            const statusMatch = !filterStatus || filterStatus === 'all' || status.label.toLowerCase() === filterStatus.toLowerCase();
            return searchMatch && catMatch && compMatch && statusMatch;
        });
    }, [productList, search, filterCategory, filterStatus, filterCompany]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const paginatedList = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const handleOpenModal = (product: any = null) => {
        if (product) {
            setEditingId(product.id);
            const data = getProductData(product);
            setFormData({
                name: { en: data.name.en || '', ar: data.name.ar || '' },
                description: { en: data.description.en || '', ar: data.description.ar || '' },
                category_id: String(data.categoryId || ''),
                company_id: String(data.companyId || ''),
                price: String(data.price || ''),
                sku: data.sku || '',
                active: !!data.active,
                published: !!data.published,
                tags: data.tags ? data.tags.map((t: any) => String(t.id)) : []
            });
        } else {
            setEditingId(null);
            setFormData({
                name: { en: '', ar: '' },
                description: { en: '', ar: '' },
                category_id: '',
                company_id: '',
                price: '',
                sku: '',
                active: true,
                published: true,
                tags: []
            });
        }
        setIsModalOpen(true);
    };


    /**
     * Confirms product deletion from the server and locally updates the list.
     */
    const handleConfirmDeleteProduct = async () => {
        if (!deleteProductId) return;
        const id = deleteProductId;
        try {
            await productService.deleteProduct(String(id));
            setProductList(prev => prev.filter(p => p.id !== id));
            setTotalProducts((prev: number) => Math.max(0, prev - 1));
            setDetailProduct((prev: any) => (prev && getProductData(prev).id === id ? null : prev));
            toast.success('Product deleted');
        } catch (error) {
            console.error('Delete failed', error);
            toast.error('Failed to delete product');
        } finally {
            setDeleteProductId(null);
        }
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
            const basePayload = {
                company_id: formData.company_id,
                category_id: formData.category_id,
                name: formData.name,
                description: formData.description,
                tags: formData.tags,
                locale: 'en',
                searchable: true,
                active: formData.active,
                published: formData.published,
            };

            if (formData.price !== '') {
                (basePayload as any).price = Number(formData.price);
            }
            if (formData.sku) {
                (basePayload as any).sku = formData.sku;
            }

            if (editingId) {
                await productService.updateProduct(String(editingId), basePayload);
            } else {
                await productService.createProduct(basePayload as any);
            }
            await fetchData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            toast.error('Failed to save product', {
                description: 'Please review the form data and try again.',
            });
        } finally { setFormSaving(false); }
    };

    const updateBilingual = (field: string, lang: 'en' | 'ar', val: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: { ...(prev[field] || {}), [lang]: val } }));
    };

    /**
     * Toggles a tag identifier in the form tag list.
     *
     * The API expects `tags` to be an array of tag IDs (strings),
     * matching the contract described in the admin Postman collection.
     */
    const toggleTagSelection = (tagId: string) => {
        setFormData((prev: any) => {
            const current: string[] = prev.tags || [];
            const exists = current.includes(tagId);
            return {
                ...prev,
                tags: exists ? current.filter(id => id !== tagId) : [...current, tagId],
            };
        });
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
                    <Select value={filterCategory} onValueChange={(val: string | null) => { setFilterCategory(val ?? 'all'); setPage(1); }}>
                        <SelectTrigger className="h-9 w-fit min-w-[130px] bg-white border-slate-200 text-slate-600 font-medium px-3">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((c: any) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {displayBilingual(c.name)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status filter */}
                    <Select value={filterStatus} onValueChange={(val:any) => { setFilterStatus(val); setPage(1); }}>
                        <SelectTrigger className="h-9 w-fit min-w-[110px] bg-white border-slate-200 text-slate-600 font-medium px-3">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Suspended">Suspended</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Company filter */}
                    <Select value={filterCompany} onValueChange={(val: string | null) => { setFilterCompany(val ?? 'all'); setPage(1); }}>
                        <SelectTrigger className="h-9 w-fit min-w-[130px] bg-white border-slate-200 text-slate-600 font-medium px-3">
                            <SelectValue placeholder="Company" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Companies</SelectItem>
                            {companies.map((c: any) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {displayBilingual(c.name)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>



                    {/* Refresh */}
                    <button onClick={resetFilters} title="Reset Filters & Refresh" className="h-9 w-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-colors">
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
                                            <Badge variant="outline" className={`${status.bg} ${status.text} border-transparent font-bold text-[11px]`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${status.dot}`} />
                                                {status.label}
                                            </Badge>
                                        </td>
                                        {/* Views */}
                                        <td className="px-4 py-4 text-right">
                                            <span className="text-[13px] font-bold text-slate-700">{data.views > 0 ? data.views.toLocaleString() : '—'}</span>
                                        </td>
                                        {/* Price */}
                                        <td className="px-4 py-4 text-right">
                                            <span className="text-[14px] font-black text-slate-900">
                                                {data.price !== null && data.price !== '' && data.price !== undefined
                                                    ? formatCurrency(data.price)
                                                    : '—'}
                                            </span>
                                        </td>
                                        {/* Updated */}
                                        <td className="px-4 py-4">
                                            <span className="text-[12px] text-slate-400 font-medium">{timeAgo(data.updatedAt || data.createdAt)}</span>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => setDetailProduct(p)}
                                                    className="text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                                                >
                                                    <ExternalLink size={15} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleToggleActive(p.id)}
                                                    disabled={togglingId === `active-${p.id}`}
                                                    className={data.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100'}
                                                >
                                                    {togglingId === `active-${p.id}` ? <Loader2 size={15} className="animate-spin" /> : data.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleTogglePublished(p.id)}
                                                    disabled={togglingId === `pub-${p.id}`}
                                                    className={data.published ? 'text-sky-500 hover:bg-sky-50' : 'text-slate-300 hover:bg-slate-100'}
                                                >
                                                    {togglingId === `pub-${p.id}` ? <Loader2 size={15} className="animate-spin" /> : data.published ? <Eye size={15} /> : <EyeOff size={15} />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleOpenModal(p)}
                                                    className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Edit size={15} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => setDeleteProductId(p.id)}
                                                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 size={15} />
                                                </Button>
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
            </div >

            {/* Stats Cards */}
            < div className="grid grid-cols-1 md:grid-cols-3 gap-4" >
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
            </div >

            {/* Edit / Create Sheet (side panel) */}
            <Sheet open={isModalOpen} onOpenChange={setIsModalOpen} > 
                <SheetContent side="right" className="p-0 !max-w-4xl w-full max-h-screen overflow-y-auto border-none shadow-2xl flex flex-col">
                    <div className="px-8 py-6 bg-slate-50/80 backdrop-blur-md border-b">
                        <SheetHeader>
                            <SheetTitle className="text-xl font-bold text-slate-900 font-outfit">
                                {editingId ? 'Refine Product' : 'List New Product'}
                            </SheetTitle>
                            <div className="mt-4 flex items-center gap-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                                        1
                                    </span>
                                    <span>Basic Information</span>
                                </div>
                                <div className="h-px w-6 bg-slate-200" />
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">
                                        2
                                    </span>
                                    <span>Technical Data</span>
                                </div>
                                <div className="h-px w-6 bg-slate-200" />
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">
                                        3
                                    </span>
                                    <span>Governance &amp; Approval</span>
                                </div>
                            </div>
                        </SheetHeader>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                        <div className="p-8 space-y-10 flex-1 overflow-y-auto premium-scrollbar">
                            {/* Basic Information Section */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-teal-600 uppercase tracking-widest border-b border-teal-100 pb-2">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Product Name (EN) <span className="text-rose-500">*</span></label>
                                        <input required className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold focus:border-teal-500 transition-all outline-none" placeholder="e.g. Pro Drill" value={formData.name.en} onChange={e => updateBilingual('name', 'en', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block">الإسم (بالعربية) <span className="text-rose-500">*</span></label>
                                        <input dir="rtl" className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold focus:border-teal-500 transition-all outline-none text-right" placeholder="اسم المنتج..." value={formData.name.ar} onChange={e => updateBilingual('name', 'ar', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Description (EN)</label>
                                        <textarea rows={4} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-teal-500 transition-all outline-none resize-none" placeholder="Product details in English..." value={formData.description.en} onChange={e => updateBilingual('description', 'en', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block">الوصف (بالعربية)</label>
                                        <textarea rows={4} dir="rtl" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-teal-500 transition-all outline-none resize-none text-right" placeholder="تفاصيل المنتج بالعربية..." value={formData.description.ar} onChange={e => updateBilingual('description', 'ar', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Product Data Section */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-teal-600 uppercase tracking-widest border-b border-teal-100 pb-2">Technical Data</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Category <span className="text-rose-500">*</span></label>
                                        <Select value={formData.category_id} onValueChange={(val: string | null) => setFormData({ ...formData, category_id: val ?? '' })}>
                                            <SelectTrigger className="w-full h-12 bg-white border-slate-200 rounded-xl px-4 text-sm font-bold">
                                                <SelectValue placeholder="Categorize item..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-xl border-slate-200">
                                                {categories.map((c: any) => (
                                                    <SelectItem key={c.id} value={String(c.id)} className="text-sm border-b border-slate-50 last:border-0">{displayBilingual(c.name)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Company <span className="text-rose-500">*</span></label>
                                        <Select value={formData.company_id} onValueChange={(val: string | null) => setFormData({ ...formData, company_id: val ?? '' })}>
                                            <SelectTrigger className="w-full h-12 bg-white border-slate-200 rounded-xl px-4 text-sm font-bold">
                                                <SelectValue placeholder="Assign proprietor..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-xl border-slate-200">
                                                {companies.map((c: any) => (
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
                                            <input type="number" step="0.01" min="0" className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold focus:border-teal-500 transition-all outline-none" placeholder="0.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">EGP</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">SKU Ledger ID</label>
                                        <input className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold focus:border-teal-500 transition-all outline-none uppercase placeholder:lowercase" placeholder="e.g. PRO-123" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
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
                                                    onClick={() => toggleTagSelection(id)}
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

                            {/* Governance Section */}
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
                                            <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} className="sr-only peer" id="active-toggle" />
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
                                            <input type="checkbox" checked={formData.published} onChange={e => setFormData({ ...formData, published: e.target.checked })} className="sr-only peer" id="pub-toggle" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-slate-50/80 backdrop-blur-md border-t flex items-center justify-between">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="px-6 rounded-xl font-bold text-slate-500 hover:bg-slate-200/50 transition-all">
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

            {/* ────── Detail Drawer ────── */}
            < Sheet open={!!detailProduct} onOpenChange={(open) => !open && setDetailProduct(null)}>
                <SheetContent side="right" className="p-0 sm:max-w-md w-full max-h-screen overflow-y-auto border-none shadow-2xl flex flex-col">
                    {detailProduct && (() => {
                        const d = getProductData(detailProduct);
                        const status = getStatus(d);
                        return (
                            <>
                                <div className="relative h-64 shrink-0 overflow-hidden bg-slate-900">
                                    <img
                                        src={d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayBilingual(d.name))}&background=1e293b&color=94a3b8&size=500`}
                                        alt={displayBilingual(d.name)}
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20 pointer-events-none" />

                                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <Badge className={`${status.bg} ${status.text} border-white/20 backdrop-blur-md px-3 py-1 font-black text-[10px] uppercase tracking-wider`}>
                                                {status.label === 'Pending' ? 'Needs Review' : status.label}
                                            </Badge>
                                            {d.premium && (
                                                <Badge className="bg-amber-100 text-amber-700 border-white/20 backdrop-blur-md px-3 py-1 font-black text-[10px] uppercase tracking-wider">
                                                    Premium
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-black text-white leading-tight font-outfit drop-shadow-lg">
                                                {displayBilingual(d.name)}
                                            </h2>
                                            {d.name?.ar && <p className="text-white/70 text-sm mt-1 font-medium drop-shadow-md" dir="rtl">{d.name.ar}</p>}
                                        </div>
                                        {d.price !== null && d.price !== undefined && (
                                            <div className="bg-teal-500 text-white px-4 py-2 rounded-2xl shadow-xl border border-teal-400/50 backdrop-blur-md">
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Price</p>
                                                <p className="text-xl font-black leading-none mt-1">{formatCurrency(d.price)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto premium-scrollbar">
                                    <div className="p-8 space-y-8">
                                        {/* Description */}
                                        <div className="space-y-4">
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                {displayBilingual(d.description) || <span className="italic text-slate-300">No narrative provided for this item.</span>}
                                            </p>

                                            {/* Tags if any */}
                                            {d.tags && d.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {d.tags.map((tag: any) => (
                                                        <Badge key={tag.id} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none px-2 py-0.5 text-[10px] font-bold">
                                                            {displayBilingual(tag.name)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-2">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-slate-500 border border-slate-100">
                                                    <TagIcon size={12} className="text-slate-400" />
                                                    <span className="text-[11px] font-bold">{displayBilingual(d.categoryName)}</span>
                                                </div>
                                                {d.sku && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-slate-500 border border-slate-100">
                                                        <span className="text-[10px] font-bold text-slate-400">SKU</span>
                                                        <span className="text-[11px] font-bold text-slate-700 uppercase">{d.sku}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Separator className="bg-slate-100" />

                                        {/* Stats Row */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100/50 flex flex-col items-center gap-1">
                                                <Heart size={18} className="text-rose-500" />
                                                <span className="text-lg font-black text-slate-900 mt-1">{d.likesCount}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faves</span>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 flex flex-col items-center gap-1">
                                                <MessageSquare size={18} className="text-blue-500" />
                                                <span className="text-lg font-black text-slate-900 mt-1">{d.reviewsCount}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Feed</span>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100/50 flex flex-col items-center gap-1">
                                                <Eye size={18} className="text-teal-500" />
                                                <span className="text-lg font-black text-slate-900 mt-1">{d.views}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reach</span>
                                            </div>
                                        </div>

                                        {/* Company Card */}
                                        <div className="space-y-4">
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner Hub</h3>
                                            <div className="group flex items-center justify-between p-4 rounded-3xl border border-slate-100 bg-white/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-14 h-14 border-4 border-white shadow-lg shadow-slate-200">
                                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayBilingual(d.companyName))}&background=0f172a&color=fff`} />
                                                        <AvatarFallback className="bg-teal-600 text-white font-black text-xl">{String(displayBilingual(d.companyName))[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-none">{displayBilingual(d.companyName)}</p>
                                                        <p className="text-[12px] text-teal-600 font-bold mt-1.5 flex items-center gap-1.5">
                                                            <CheckCircle size={12} /> Gold Supplier
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all">
                                                    <ExternalLink size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Owner Info */}
                                        {(d.ownerName || d.ownerEmail) && (
                                            <div className="space-y-4">
                                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Point of Contact</h3>
                                                <div className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-200">
                                                    <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                        <User size={20} className="text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 leading-none">{d.ownerName}</p>
                                                        <p className="text-[11px] text-slate-500 mt-1 font-medium italic">{d.ownerEmail}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Internal Section */}
                                        <div className="pt-4 space-y-4">
                                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 shadow-inner">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <AlertTriangle size={14} className="text-amber-500" />
                                                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Internal Admin Ledger</h4>
                                                </div>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Append audit notes or moderation logs..."
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:border-teal-400 focus:shadow-[0_0_0_4px_rgba(20,184,166,0.1)] transition-all font-medium"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 px-2">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                                                    Listed: <br />
                                                    <span className="text-slate-600">{new Date(d.createdAt).toLocaleString('en-GB')}</span>
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight text-right">
                                                    Last Update: <br />
                                                    <span className="text-slate-600">{new Date(d.updatedAt).toLocaleString('en-GB')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer actions */}
                                <div className="p-6 border-t bg-slate-50/80 backdrop-blur-md flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setDeleteProductId(d.id)}
                                        className="flex-1 h-12 rounded-xl border-rose-200 text-rose-600 font-bold hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-all"
                                    >
                                        <Trash2 size={16} className="mr-2" /> Scrap
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => handleToggleActive(d.id)}
                                        disabled={togglingId === `active-${d.id}`}
                                        className={`flex-1 h-12 rounded-xl font-bold transition-all ${d.active ? 'border-slate-200 text-slate-600 hover:bg-white' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                            }`}
                                    >
                                        {togglingId === `active-${d.id}` ? <Loader2 size={16} className="animate-spin" /> : d.active ? <ToggleLeft size={16} className="mr-2" /> : <ToggleRight size={16} className="mr-2" />}
                                        {d.active ? 'Halt' : 'Resume'}
                                    </Button>

                                    <Button
                                        onClick={() => handleTogglePublished(d.id)}
                                        disabled={togglingId === `pub-${d.id}`}
                                        className={`flex-1 h-12 rounded-xl font-black transition-all shadow-lg ${d.published ? 'bg-slate-800 hover:bg-slate-700' : 'bg-[#008080] hover:bg-[#006666]'
                                            } text-white`}
                                    >
                                        {togglingId === `pub-${d.id}` ? <Loader2 size={16} className="animate-spin" /> : d.published ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                                        {d.published ? 'Retract' : 'Broadcast'}
                                    </Button>
                                </div>
                            </>
                        );
                    })()}
                </SheetContent>
            </Sheet>

            <Dialog open={deleteProductId !== null} onOpenChange={(open) => !open && setDeleteProductId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete product?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-500 mt-2">
                        This action cannot be undone. The product will be removed from the catalog.
                    </p>
                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteProductId(null)}
                            className="font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmDeleteProduct}
                            className="font-semibold"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Products;
