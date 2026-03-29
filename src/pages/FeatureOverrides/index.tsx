import React from 'react';
import { ToggleRight, Plus, MoreHorizontal, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { featureOverrideService } from '@services/featureOverrideService';
import { FeatureOverride } from '@data-types/api';
import { formatDate } from '@utils/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const FeatureOverrides = () => {
    const [loading, setLoading] = React.useState(true);
    const [overrides, setOverrides] = React.useState<FeatureOverride[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        company_ulid: '',
        feature_key: '',
        enabled: true,
        limit: '',
        reason: ''
    });

    const fetchOverrides = async () => {
        setLoading(true);
        try {
            const response = await featureOverrideService.getOverrides();
            if (response.data) setOverrides(response.data);
        } catch (error) {
            console.error('Error fetching Feature Overrides:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchOverrides();
    }, []);

    const handleOpenModal = (override?: FeatureOverride) => {
        if (override) {
            setEditingId(override.id);
            setFormData({
                company_ulid: override.company_ulid || '',
                feature_key: override.feature_key || '',
                enabled: override.enabled !== false,
                limit: override.limit ? String(override.limit) : '',
                reason: override.reason || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                company_ulid: '',
                feature_key: '',
                enabled: true,
                limit: '',
                reason: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to completely erase this override? Execution rules will fall back to base plan config.')) return;
        try {
            await featureOverrideService.deleteOverride(id);
            setOverrides(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            const payload: any = { ...formData };
            if (payload.limit) payload.limit = Number(payload.limit);
            else delete payload.limit;

            if (editingId) {
                await featureOverrideService.updateOverride(editingId, payload);
            } else {
                await featureOverrideService.createOverride(payload);
            }
            await fetchOverrides();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to lock Feature Override');
        } finally {
            setFormSaving(false);
        }
    };

    if (loading && overrides.length === 0) return <div className="p-8">Loading Overrides...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">Priority Overrides</h2>
                    <p className="text-slate-500 text-sm mt-1">Directly bypass global feature limitations per entity</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg overflow-hidden transition-all hover:bg-indigo-700"
                >
                    <Plus size={18} /> Apply Bypass
                </button>
            </div>

            <div className="premium-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Target Entity</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Feature Anchor</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Values Configured</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Notes</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Settings</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {overrides.map((ovr) => (
                            <tr key={ovr.id} className="hover:bg-indigo-50/20 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500"><ToggleRight size={16} className="fill-current bg-white rounded-full" /></div>
                                        <span className="text-xs font-bold text-slate-800 font-mono">{ovr.company_ulid}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">{ovr.feature_key}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-xs font-bold text-indigo-700">
                                        {ovr.enabled ? 'Enabled' : 'Force Disabled'}
                                        {ovr.limit && <span className="text-slate-400 ml-2">(Max: {ovr.limit})</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-5 max-w-xs truncate text-[11px] text-slate-500" title={ovr.reason}>{ovr.reason || 'No justification attached.'}</td>
                                <td className="px-6 py-5 pr-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => handleOpenModal(ovr)} className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(ovr.id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {overrides.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No priority limits exist.</td></tr>}
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
                                    {editingId ? 'Modify Bypass Settings' : 'Initialize Direct Bypass'}
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
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Entity ID</label>
                                        <input required disabled={!!editingId} className="h-12 w-full rounded-xl border border-border bg-background px-4 font-mono text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:opacity-50" value={formData.company_ulid} onChange={e => setFormData({ ...formData, company_ulid: e.target.value })} placeholder="01H..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Base Feature Layer</label>
                                        <input required disabled={!!editingId} className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:opacity-50" value={formData.feature_key} onChange={e => setFormData({ ...formData, feature_key: e.target.value })} placeholder="api.usage.limit" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Overwrite Value</label>
                                        <input type="number" min="0" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:opacity-50" value={formData.limit} onChange={e => setFormData({ ...formData, limit: e.target.value })} placeholder="Numeric Limit Only" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Justification / Support ID</label>
                                        <input className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:opacity-50" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="TICKET-2239..." />
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 pt-2">
                                    <label className="group flex cursor-pointer items-center gap-3">
                                        <div className="relative inline-flex scale-90 items-center">
                                            <input type="checkbox" className="peer sr-only" checked={formData.enabled} onChange={e => setFormData({ ...formData, enabled: e.target.checked })} />
                                            <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-transparent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring/40" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground">Flag Granted Status</span>
                                    </label>
                                </div>
                        </div>
                        <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-muted/50 p-6">
                            <button type="button" className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" disabled={formSaving} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50">
                                {formSaving && <Loader2 className="animate-spin" size={16} />} Deploy Bypass
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default FeatureOverrides;
