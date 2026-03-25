import React from 'react';
import { Plus, Layers, X, Edit, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { featureService } from '@services/featureService';
import { Feature } from '@data-types/api';
import { displayBilingual, getStatusStyles } from '@utils/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const Features = () => {
    const [loading, setLoading] = React.useState(true);
    const [features, setFeatures] = React.useState<Feature[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: { en: '', ar: '' },
        key: '',
        type: 'boolean' as 'boolean' | 'limit' | 'tier' | 'config',
        category: 'general',
        active: true
    });

    const fetchFeatures = async () => {
        setLoading(true);
        try {
            const response = await featureService.getFeatures();
            if (response.data) setFeatures(response.data);
        } catch (error) {
            console.error('Error fetching features:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchFeatures();
    }, []);

    const handleOpenModal = (feat?: Feature) => {
        if (feat) {
            setEditingId(feat.id);
            setFormData({
                name: typeof feat.name === 'string' ? { en: feat.name, ar: '' } : feat.name,
                key: feat.key || '',
                type: feat.type || 'boolean',
                category: feat.category || 'general',
                active: feat.active !== false
            });
        } else {
            setEditingId(null);
            setFormData({
                name: { en: '', ar: '' },
                key: '',
                type: 'boolean',
                category: 'general',
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this feature?')) return;
        try {
            await featureService.deleteFeature(id);
            setFeatures(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            if (editingId) {
                await featureService.updateFeature(editingId, formData);
            } else {
                await featureService.createFeature(formData);
            }
            await fetchFeatures();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save feature toggle');
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

    if (loading && features.length === 0) {
        return <div className="p-8 font-bold text-muted-foreground">Loading features...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">Platform Features</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage global feature toggles and limits ({features.length} mapped)</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 rounded-xl text-sm font-bold text-white shadow-lg relative group overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2"><Plus size={18} /> Add Feature</span>
                    <div className="absolute inset-0 bg-teal-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                </button>
            </div>

            <div className="premium-card overflow-hidden">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Feature</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Category</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Type</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Status</th>
                            <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {features.map((f) => (
                            <tr key={f.id} className="group transition-colors hover:bg-muted/50">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                            <Layers size={18} />
                                        </div>
                                        <div>
                                            <h5 className="text-[14px] font-bold text-foreground">{displayBilingual(f.name)}</h5>
                                            <p className="max-w-[200px] truncate text-[10px] font-bold uppercase text-muted-foreground">{f.key}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-sm font-medium capitalize text-muted-foreground">{f.category}</td>
                                <td className="px-6 py-5">
                                    <span className="rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">{f.type}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(f.active ? 'active' : 'inactive')}`}>
                                        {f.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 pe-4 text-end">
                                    <div className="flex items-center justify-end gap-1">
                                        <button type="button" onClick={() => handleOpenModal(f)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-primary">
                                            <Edit size={16} />
                                        </button>
                                        <button type="button" onClick={() => handleDelete(f.id)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-destructive/10 hover:text-destructive">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {features.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No features mapped.</td></tr>}
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
                                    {editingId ? 'Edit Feature' : 'Map New Feature'}
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
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Display Name (EN)</label>
                                        <input required className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.name.en} onChange={e => updateBilingual('name', 'en', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block pe-2 text-end text-[11px] font-black uppercase tracking-widest text-muted-foreground">الإسم بالعربية</label>
                                        <input required dir="rtl" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-end text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.name.ar} onChange={e => updateBilingual('name', 'ar', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">System Resource Key</label>
                                    <input required className="h-12 w-full rounded-xl border border-border bg-background px-4 font-mono text-sm font-bold text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} placeholder="app.products.max_images" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Capability Type</label>
                                        <div className="relative">
                                            <select required className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 pe-10 text-sm font-bold capitalize text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                                                <option value="boolean">Boolean Toggle (On/Off)</option>
                                                <option value="limit">Numeric Limit</option>
                                                <option value="tier">Subscription Tier Based</option>
                                                <option value="config">Complex Configuration</option>
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Module Category</label>
                                        <input required className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. general, analytics, api" />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <label className="group flex cursor-pointer items-center gap-3">
                                        <div className="relative">
                                            <input type="checkbox" className="peer sr-only" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                                            <div className="peer h-6 w-12 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring/40" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground">Feature Active Globally</span>
                                    </label>
                                </div>
                        </div>
                        <div className="flex shrink-0 justify-end gap-4 border-t border-border bg-muted/50 p-6">
                            <button type="button" className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" disabled={formSaving} className="flex items-center gap-2 rounded-xl bg-primary px-10 py-2.5 text-sm font-black text-primary-foreground shadow-xl transition-all hover:bg-primary/90 disabled:opacity-50">
                                {formSaving && <Loader2 className="animate-spin" size={16} />} Deploy Feature Map
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Features;
