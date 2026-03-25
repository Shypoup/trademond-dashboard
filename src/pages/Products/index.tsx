import React from 'react';
import { Plus } from 'lucide-react';
import { productService } from '@services/productService';
import { companyService } from '@services/companyService';
import { categoryService } from '@services/categoryService';
import { tagService } from '@services/tagService';
import { Product, Company, Category, Tag } from '@data-types/api';
import { displayBilingual } from '@utils/ui';
import { toast } from "sonner";
import {
    getProductData,
    getStatus,
    extractCompaniesData,
    extractCategoriesData,
} from './utils/productHelpers';
import type { ProductFormData } from './utils/productHelpers';
import { ProductToolbar } from './components/ProductToolbar';
import { ProductTable } from './components/ProductTable';
import { ProductStatsCards } from './components/ProductStatsCards';
import { ProductFormSheet } from './components/ProductFormSheet';
import { ProductDetailSheet } from './components/ProductDetailSheet';
import { DeleteProductDialog } from './components/DeleteProductDialog';

/**
 * Products management page — orchestrates data fetching, state management,
 * filtering, pagination, and renders all product sub-components.
 */
const Products = () => {
    const [loading, setLoading] = React.useState(true);
    const [productList, setProductList] = React.useState<Product[]>([]);
    const [totalProducts, setTotalProducts] = React.useState(0);
    const [companies, setCompanies] = React.useState<Company[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [allTags, setAllTags] = React.useState<Tag[]>([]);

    const [search, setSearch] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('');
    const [filterCompany, setFilterCompany] = React.useState('');

    const [page, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [selected, setSelected] = React.useState<Set<string>>(new Set());
    const [detailProduct, setDetailProduct] = React.useState<Product | null>(null);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | number | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [togglingId, setTogglingId] = React.useState<string | null>(null);
    const [formData, setFormData] = React.useState<ProductFormData>({
        name: { en: '', ar: '' },
        description: { en: '', ar: '' },
        company_id: '',
        category_id: '',
        price: '',
        sku: '',
        active: true,
        published: false,
        tags: [],
    });
    const [deleteProductId, setDeleteProductId] = React.useState<string | number | null>(null);

    /** Fetches products, companies, categories, and tags from the API. */
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
                if (compRes && compRes.data) setCompanies(extractCompaniesData(compRes.data) as Company[]);
                else if (Array.isArray(compRes)) setCompanies(extractCompaniesData(compRes) as Company[]);
            } catch (err) { console.error('Error fetching companies:', err); }
            try {
                const catRes = await categoryService.getCategories();
                if (catRes && catRes.data) setCategories(extractCategoriesData(catRes.data) as Category[]);
                else if (Array.isArray(catRes)) setCategories(extractCategoriesData(catRes) as Category[]);
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

    /** Resets all filters and refreshes data from the server. */
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

    /** Opens the create/edit sheet, populating form data when editing. */
    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingId(product.id);
            const data = getProductData(product);
            setFormData({
                name: { en: (data.name as any).en || '', ar: (data.name as any).ar || '' },
                description: { en: (data.description as any).en || '', ar: (data.description as any).ar || '' },
                category_id: String(data.categoryId || ''),
                company_id: String(data.companyId || ''),
                price: String(data.price || ''),
                sku: data.sku || '',
                active: !!data.active,
                published: !!data.published,
                tags: data.tags ? data.tags.map(t => String(t.id)) : []
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

    /** Confirms product deletion from the server and locally updates the list. */
    const handleConfirmDeleteProduct = async () => {
        if (!deleteProductId) return;
        const id = deleteProductId;
        try {
            await productService.deleteProduct(String(id));
            setProductList(prev => prev.filter(p => p.id !== id));
            setTotalProducts(prev => Math.max(0, prev - 1));
            setDetailProduct(prev => (prev && getProductData(prev).id === id ? null : prev));
            toast.success('Product deleted');
        } catch (error) {
            console.error('Delete failed', error);
            toast.error('Failed to delete product');
        } finally {
            setDeleteProductId(null);
        }
    };

    /** Toggles the active flag for a product. */
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

    /** Toggles the published flag for a product. */
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

    /** Handles form submission for creating or updating a product. */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            const basePayload: Record<string, unknown> = {
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
                basePayload.price = Number(formData.price);
            }
            if (formData.sku) {
                basePayload.sku = formData.sku;
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

    /** Updates a bilingual field (name or description) in form data. */
    const updateBilingual = (field: string, lang: 'en' | 'ar', val: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: { ...(prev[field] || {}), [lang]: val } }));
    };

    /**
     * Toggles a tag identifier in the form tag list.
     * The API expects `tags` to be an array of tag IDs (strings).
     */
    const toggleTagSelection = (tagId: string) => {
        setFormData(prev => {
            const current = prev.tags;
            const exists = current.includes(tagId);
            return { ...prev, tags: exists ? current.filter(id => id !== tagId) : [...current, tagId] };
        });
    };

    /** Updates a single form field value. */
    const handleFormFieldChange = (field: keyof ProductFormData, value: unknown) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
            setSelected(new Set(paginatedList.map(p => String(p.id))));
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
                    <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading Product Catalog...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-12">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Products Management</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{totalProducts.toLocaleString()} total products registered in the platform</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                >
                    <Plus size={16} />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="premium-card overflow-hidden">
                <ProductToolbar
                    search={search}
                    onSearchChange={val => { setSearch(val); setPage(1); }}
                    filterCategory={filterCategory}
                    onFilterCategoryChange={val => { setFilterCategory(val); setPage(1); }}
                    filterStatus={filterStatus}
                    onFilterStatusChange={val => { setFilterStatus(val); setPage(1); }}
                    filterCompany={filterCompany}
                    onFilterCompanyChange={val => { setFilterCompany(val); setPage(1); }}
                    categories={categories}
                    companies={companies}
                    selectedCount={selected.size}
                    onResetFilters={resetFilters}
                />
                <ProductTable
                    paginatedList={paginatedList}
                    filteredCount={filtered.length}
                    selected={selected}
                    togglingId={togglingId}
                    page={page}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={n => { setRowsPerPage(n); setPage(1); }}
                    onToggleSelect={toggleSelect}
                    onToggleSelectAll={toggleSelectAll}
                    onViewDetail={p => setDetailProduct(p)}
                    onEdit={p => handleOpenModal(p)}
                    onDelete={id => setDeleteProductId(id)}
                    onToggleActive={handleToggleActive}
                    onTogglePublished={handleTogglePublished}
                />
            </div>

            <ProductStatsCards
                activeCount={activeCount}
                pendingCount={pendingCount}
                publishedCount={publishedCount}
            />

            <ProductFormSheet
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingId={editingId}
                formData={formData}
                categories={categories}
                companies={companies}
                allTags={allTags}
                formSaving={formSaving}
                onSubmit={handleSubmit}
                onUpdateBilingual={updateBilingual}
                onFormFieldChange={handleFormFieldChange}
                onToggleTagSelection={toggleTagSelection}
            />

            <ProductDetailSheet
                product={detailProduct}
                onClose={() => setDetailProduct(null)}
                togglingId={togglingId}
                onDelete={id => setDeleteProductId(id)}
                onToggleActive={handleToggleActive}
                onTogglePublished={handleTogglePublished}
            />

            <DeleteProductDialog
                isOpen={deleteProductId !== null}
                onClose={() => setDeleteProductId(null)}
                onConfirm={handleConfirmDeleteProduct}
            />
        </div>
    );
};

export default Products;
