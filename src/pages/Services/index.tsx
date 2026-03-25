import React from 'react';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    X,
    Loader2,
    ChevronDown,
} from 'lucide-react';
import { serviceService } from '@services/serviceService';
import { companyService } from '@services/companyService';
import { categoryService } from '@services/categoryService';
import { Service, Company, Category } from '@data-types/api';
import { displayBilingual, getStatusStyles } from '@utils/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const Services = () => {
    const [loading, setLoading] = React.useState(true);
    const [serviceList, setServiceList] = React.useState<Service[]>([]);
    const [totalServices, setTotalServices] = React.useState(0);
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
        category_id: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [srvRes, compRes, catRes] = await Promise.all([
                serviceService.getServices(),
                companyService.getCompanies(),
                categoryService.getCategories()
            ]);

            if (srvRes.data) {
                setServiceList(srvRes.data);
                setTotalServices(srvRes.meta?.total || srvRes.data.length);
            }
            if (compRes.data) setCompanies(compRes.data);
            if (catRes.data) setCategories(catRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (service?: Service) => {
        if (service) {
            setEditingId(service.id);
            setFormData({
                name: typeof service.name === 'string' ? { en: service.name, ar: '' } : service.name,
                description: typeof service.description === 'string' ? { en: service.description, ar: '' } : (service.description || { en: '', ar: '' }),
                company_id: String(service.company_id || (service.company as any)?.id || ''),
                category_id: String(service.category_id || (service.category as any)?.id || '')
            });
        } else {
            setEditingId(null);
            setFormData({
                name: { en: '', ar: '' },
                description: { en: '', ar: '' },
                company_id: String(companies[0]?.id || ''),
                category_id: String(categories[0]?.id || '')
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await serviceService.deleteService(String(id));
            setServiceList(prev => prev.filter(s => s.id !== id));
            setTotalServices(prev => prev - 1);
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            if (editingId) {
                await serviceService.updateService(String(editingId), formData);
            } else {
                await serviceService.updateService('', formData);
            }
            await fetchData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save service');
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

    if (loading && serviceList.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-muted-foreground animate-pulse">Querying Global Services...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">Services Management</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{totalServices.toLocaleString()} registered services providing cross-border value</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
                >
                    <Plus size={18} />
                    <span>Create Service</span>
                </button>
            </div>

            <div className="premium-card overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex flex-wrap items-center gap-4 bg-slate-50/30">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute inset-y-0 left-4 flex items-center mt-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Filter by service name, company..."
                            className="w-full h-11 pl-12 pr-4 bg-white border border-slate-200 focus:border-teal-400 rounded-xl text-sm outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Service</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Company Provider</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-end text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {serviceList.map((s) => (
                                <tr key={s.id} className="group transition-colors hover:bg-muted/50">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 overflow-hidden rounded-xl border border-border bg-muted">
                                                <img src={s.profilePhoto || `https://ui-avatars.com/api/?name=${displayBilingual(s.name)}&background=008080&color=fff`} alt={displayBilingual(s.name)} className="h-full w-full object-cover" />
                                            </div>
                                            <div>
                                                <h5 className="text-[14px] font-bold text-foreground">{displayBilingual(s.name)}</h5>
                                                <p className="max-w-[200px] truncate text-xs text-muted-foreground">{displayBilingual(s.description)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="cursor-pointer text-xs font-bold text-primary hover:underline">
                                            {s.company?.name ? displayBilingual(s.company.name) : (s as any).company || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-slate-600 font-medium">
                                        {s.category?.name ? displayBilingual(s.category.name) : (s as any).category || 'N/A'}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusStyles(s.published ? 'published' : 'draft')}`}>
                                            {s.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 pe-4 text-end">
                                        <div className="flex items-center justify-end gap-1">
                                            <button type="button" onClick={() => handleOpenModal(s)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-primary">
                                                <Edit size={16} />
                                            </button>
                                            <button type="button" onClick={() => handleDelete(s.id)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-destructive/10 hover:text-destructive">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {serviceList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No services found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-border bg-muted/30 p-4">
                    <p className="text-xs font-semibold text-muted-foreground">
                        Showing total <span className="font-bold text-foreground">{totalServices.toLocaleString()}</span> services
                    </p>
                </div>
            </div>

            <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                <SheetContent
                    side="right"
                    showCloseButton={false}
                    className="p-0 !max-w-2xl w-full max-h-screen overflow-y-auto border-none shadow-2xl flex flex-col gap-0 sm:!max-w-2xl"
                >
                    <div className="shrink-0 border-b border-border bg-muted/50 p-6">
                        <div className="flex items-center justify-between">
                            <SheetHeader className="!m-0 !p-0">
                                <SheetTitle className="font-outfit text-xl font-bold text-foreground">
                                    {editingId ? 'Edit Service' : 'Create New Service'}
                                </SheetTitle>
                            </SheetHeader>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="premium-scrollbar flex-1 space-y-6 overflow-y-auto p-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">English Name</label>
                                        <input required className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.name.en} onChange={e => updateBilingual('name', 'en', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-end text-[11px] font-black uppercase tracking-widest text-muted-foreground">الإسم بالعربية</label>
                                        <input required dir="rtl" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-end text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.name.ar} onChange={e => updateBilingual('name', 'ar', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Category</label>
                                        <div className="relative">
                                            <select required className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                                <option value="">Select Category...</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{displayBilingual(c.name)}</option>)}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Company</label>
                                        <div className="relative">
                                            <select required className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.company_id} onChange={e => setFormData({ ...formData, company_id: e.target.value })}>
                                                <option value="">Select Company...</option>
                                                {companies.map(c => <option key={c.id} value={c.id}>{displayBilingual(c.name)}</option>)}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Description (EN)</label>
                                        <textarea className="min-h-[100px] w-full resize-none rounded-xl border border-border bg-background p-4 text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.description.en} onChange={e => updateBilingual('description', 'en', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-end text-[11px] font-black uppercase tracking-widest text-muted-foreground">الوصف (عربي)</label>
                                        <textarea dir="rtl" className="min-h-[100px] w-full resize-none rounded-xl border border-border bg-background p-4 text-end text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.description.ar} onChange={e => updateBilingual('description', 'ar', e.target.value)} />
                                    </div>
                                </div>
                        </div>
                        <div className="flex shrink-0 justify-end gap-4 border-t border-border bg-muted/50 p-6">
                            <button type="button" className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" disabled={formSaving} className="flex items-center gap-2 rounded-xl bg-primary px-10 py-2.5 text-sm font-black text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50">
                                {formSaving && <Loader2 className="animate-spin" size={16} />} Save Service
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Services;
