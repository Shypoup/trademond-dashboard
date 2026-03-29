import React from 'react';
import { Search, Plus, MoreHorizontal, DollarSign, X, Edit, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { planService } from '@services/planService';
import { Plan } from '@data-types/api';
import { displayBilingual, getStatusStyles, formatDate, formatCurrency } from '@utils/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const Plans = () => {
    const [loading, setLoading] = React.useState(true);
    const [plans, setPlans] = React.useState<Plan[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: { en: '', ar: '' },
        slug: '',
        level: 1,
        price_monthly: '',
        price_yearly: '',
        active: true
    });

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await planService.getPlans();
            if (response.data) setPlans(response.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchPlans();
    }, []);

    const handleOpenModal = (plan?: Plan) => {
        if (plan) {
            setEditingId(plan.id);
            setFormData({
                name: typeof plan.name === 'string' ? { en: plan.name, ar: '' } : plan.name,
                slug: plan.slug || '',
                level: plan.level || 1,
                price_monthly: String(plan.price_monthly || ''),
                price_yearly: String(plan.price_yearly || ''),
                active: plan.active !== false
            });
        } else {
            setEditingId(null);
            setFormData({
                name: { en: '', ar: '' },
                slug: '',
                level: 1,
                price_monthly: '',
                price_yearly: '',
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you certain you want to delete this subscription plan?')) return;
        try {
            await planService.deletePlan(id);
            setPlans(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            if (editingId) {
                await planService.updatePlan(editingId, formData);
            } else {
                await planService.createPlan(formData);
            }
            await fetchPlans();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save plan');
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

    if (loading && plans.length === 0) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">Plans & Pricing</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage subscription tiers ({plans.length} total)</p>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg"
                >
                    <span className="relative z-10 flex items-center gap-2"><Plus size={18} /> New Plan</span>
                    <div className="absolute inset-0 bg-brand-teal -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
                </button>
            </div>

            <div className="premium-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Plan</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Monthly</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Yearly</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {plans.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <h5 className="text-[14px] font-bold text-slate-800">{displayBilingual(p.name)}</h5>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{p.slug} • Level {p.level}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right font-medium text-slate-600 text-sm">
                                    {formatCurrency(p.price_monthly)}
                                </td>
                                <td className="px-6 py-5 text-right font-medium text-slate-600 text-sm">
                                    {formatCurrency(p.price_yearly)}
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(p.active ? 'active' : 'inactive')}`}>
                                        {p.active ? 'Active' : 'Inactive'}
                                    </span>
                                    {p.is_default && <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-600 border-blue-100">Default</span>}
                                </td>
                                <td className="px-6 py-5 pr-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => handleOpenModal(p)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {plans.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No plans found.</td></tr>}
                    </tbody>
                </table>
            </div>

            <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                <SheetContent
                    side="right"
                    showCloseButton={false}
                    className="p-0 !max-w-xl w-full max-h-screen overflow-y-auto border-none shadow-2xl flex flex-col gap-0 sm:!max-w-xl"
                >
                    <div className="shrink-0 border-b border-border bg-muted/50 p-6">
                        <div className="flex items-center justify-between">
                            <SheetHeader className="!m-0 !p-0">
                                <SheetTitle className="font-outfit text-xl font-bold text-foreground">
                                    {editingId ? 'Edit Plan' : 'Create New Plan'}
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
                                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Slug System ID</label>
                                        <input required className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold lowercase text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. premium-tier" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Access Level</label>
                                        <input type="number" min="0" required className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.level} onChange={e => setFormData({ ...formData, level: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Monthly Price ($)</label>
                                        <input type="number" step="0.01" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.price_monthly} onChange={e => setFormData({ ...formData, price_monthly: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Yearly Price ($)</label>
                                        <input type="number" step="0.01" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.price_yearly} onChange={e => setFormData({ ...formData, price_yearly: e.target.value })} />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <label className="group flex cursor-pointer items-center gap-3">
                                        <div className="relative inline-flex scale-90 items-center">
                                            <input type="checkbox" className="peer sr-only" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                                            <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-transparent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring/40" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground">Plan is Active & Visible</span>
                                    </label>
                                </div>
                        </div>
                        <div className="flex shrink-0 justify-end gap-4 border-t border-border bg-muted/50 p-6">
                            <button type="button" className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" disabled={formSaving} className="flex items-center gap-2 rounded-xl bg-primary px-10 py-2.5 text-sm font-black text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50">
                                {formSaving && <Loader2 className="animate-spin" size={16} />} Save Plan
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Plans;
