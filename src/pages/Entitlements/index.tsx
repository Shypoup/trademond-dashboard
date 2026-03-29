import React from 'react';
import { ShieldCheck, Plus, MoreHorizontal, Edit, Trash2, X, Loader2, ChevronDown } from 'lucide-react';
import { entitlementService } from '@services/entitlementService';
import { Entitlement } from '@data-types/api';
import { getStatusStyles, formatDate } from '@utils/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const Entitlements = () => {
    const [loading, setLoading] = React.useState(true);
    const [entitlements, setEntitlements] = React.useState<Entitlement[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        company_ulid: '',
        feature_key: '',
        type: 'slot' as 'slot' | 'credit' | 'boolean',
        slots_total: '',
        credits_total: '',
        active: true
    });

    const fetchEntitlements = async () => {
        setLoading(true);
        try {
            const response = await entitlementService.getEntitlements();
            if (response.data) setEntitlements(response.data);
        } catch (error) {
            console.error('Error fetching Entitlements:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchEntitlements();
    }, []);

    const handleOpenModal = (entitlement?: Entitlement) => {
        if (entitlement) {
            setEditingId(entitlement.id);
            setFormData({
                company_ulid: entitlement.company_ulid || '',
                feature_key: entitlement.feature_key || '',
                type: entitlement.type || 'slot',
                slots_total: entitlement.slots_total ? String(entitlement.slots_total) : '',
                credits_total: entitlement.credits_total ? String(entitlement.credits_total) : '',
                active: entitlement.active !== false
            });
        } else {
            setEditingId(null);
            setFormData({
                company_ulid: '',
                feature_key: '',
                type: 'slot',
                slots_total: '',
                credits_total: '',
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to revoke this entitlement?')) return;
        try {
            await entitlementService.deleteEntitlement(id);
            setEntitlements(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            const payload: any = { ...formData };
            if (payload.slots_total) payload.slots_total = Number(payload.slots_total);
            else delete payload.slots_total;
            if (payload.credits_total) payload.credits_total = Number(payload.credits_total);
            else delete payload.credits_total;

            if (editingId) {
                await entitlementService.updateEntitlement(editingId, payload);
            } else {
                await entitlementService.createEntitlement(payload);
            }
            await fetchEntitlements();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save Entitlement parameters');
        } finally {
            setFormSaving(false);
        }
    };

    if (loading && entitlements.length === 0) return <div className="p-8">Loading Entitlements...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">Entitlements Sandbox</h2>
                    <p className="text-slate-500 text-sm mt-1">Review allocations and slots active globally</p>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
                >
                    <Plus size={18} /> Provision Capacity
                </button>
            </div>

            <div className="premium-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Entity / Feature ID</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Type</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Utilization</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Expiration</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {entitlements.map((ent) => (
                            <tr key={ent.id} className="hover:bg-teal-50/10 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600"><ShieldCheck size={16} /></div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 font-mono truncate max-w-[150px]">{ent.company_ulid}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{ent.feature_key}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">{ent.type}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-xs font-bold text-slate-700">
                                        {ent.type === 'slot' && `${ent.slots_used || 0} / ${ent.slots_total || '∞'}`}
                                        {ent.type === 'credit' && `${ent.credits_used || 0} / ${ent.credits_total || '0'}`}
                                        {ent.type === 'boolean' && (ent.active ? 'Yes' : 'No')}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-xs text-muted-foreground">{ent.expires_at ? formatDate(ent.expires_at) : 'Lifetime'}</td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(ent.active ? 'active' : 'inactive')} capitalize`}>
                                        {ent.active ? 'Granted' : 'Revoked'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 pr-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => handleOpenModal(ent)} className="text-slate-400 hover:text-teal-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(ent.id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {entitlements.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No specific entitlements deployed.</td></tr>}
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
                                    {editingId ? 'Modify System Entitlement' : 'Provision Entitlement Access'}
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
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Company ID Target</label>
                                        <input required disabled={!!editingId} className="h-12 w-full rounded-xl border border-border bg-background px-4 font-mono text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:opacity-50" value={formData.company_ulid} onChange={e => setFormData({ ...formData, company_ulid: e.target.value })} placeholder="01H..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Feature Registry Key</label>
                                        <input required disabled={!!editingId} className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:opacity-50" value={formData.feature_key} onChange={e => setFormData({ ...formData, feature_key: e.target.value })} placeholder="api.usage.limit" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Class</label>
                                        <div className="relative">
                                            <select required disabled={!!editingId} className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 text-sm font-bold capitalize text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:opacity-50" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                                                <option value="slot">Slot-Based</option>
                                                <option value="credit">Credit Pool</option>
                                                <option value="boolean">Boolean Toggle</option>
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Total Slots</label>
                                        <input type="number" min="1" disabled={formData.type !== 'slot'} className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:opacity-50" value={formData.slots_total} onChange={e => setFormData({ ...formData, slots_total: e.target.value })} placeholder="Unlimited" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Total Credits</label>
                                        <input type="number" min="1" disabled={formData.type !== 'credit'} className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:opacity-50" value={formData.credits_total} onChange={e => setFormData({ ...formData, credits_total: e.target.value })} placeholder="Unlimited" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 pt-2">
                                    <label className="group flex cursor-pointer items-center gap-3">
                                        <div className="relative inline-flex scale-90 items-center">
                                            <input type="checkbox" className="peer sr-only" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                                            <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-transparent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring/40" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground">Entitlement Valid Functionally</span>
                                    </label>
                                </div>
                        </div>
                        <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-muted/50 p-6">
                            <button type="button" className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" disabled={formSaving} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50">
                                {formSaving && <Loader2 className="animate-spin" size={16} />} Deploy Grant
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Entitlements;
