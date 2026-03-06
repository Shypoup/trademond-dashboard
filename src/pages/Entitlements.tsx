import React from 'react';
import { ShieldCheck, Plus, MoreHorizontal, Edit, Trash2, X, Loader2, ChevronDown } from 'lucide-react';
import { entitlementService } from '../services/entitlementService';
import { Entitlement } from '../types/api';
import { getStatusStyles, formatDate } from '../utils/ui';

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
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Entitlements Sandbox</h2>
                    <p className="text-slate-500 text-sm mt-1">Review allocations and slots active globally</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white shadow-lg overflow-hidden transition-all hover:bg-[#006666]"
                >
                    <Plus size={18} /> Provision Capacity
                </button>
            </div>

            <div className="premium-card overflow-hidden bg-white">
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
                    <tbody className="divide-y divide-slate-50">
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
                                <td className="px-6 py-5 text-xs text-slate-500">{ent.expires_at ? formatDate(ent.expires_at) : 'Lifetime'}</td>
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between bg-teal-50">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-slate-900">{editingId ? 'Modify System Entitlement' : 'Provision Entitlement Access'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-teal-100 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="p-8 space-y-6 flex-1 max-h-[70vh] overflow-y-auto premium-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Company ID Target</label>
                                        <input required disabled={!!editingId} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono focus:bg-white focus:border-teal-400 transition-all outline-none disabled:opacity-50" value={formData.company_ulid} onChange={e => setFormData({ ...formData, company_ulid: e.target.value })} placeholder="01H..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Feature Registry Key</label>
                                        <input required disabled={!!editingId} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-400 transition-all outline-none disabled:opacity-50" value={formData.feature_key} onChange={e => setFormData({ ...formData, feature_key: e.target.value })} placeholder="api.usage.limit" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Class</label>
                                        <div className="relative">
                                            <select required disabled={!!editingId} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-teal-400 transition-all capitalize disabled:opacity-50" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                                                <option value="slot">Slot-Based</option>
                                                <option value="credit">Credit Pool</option>
                                                <option value="boolean">Boolean Toggle</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Total Slots</label>
                                        <input type="number" min="1" disabled={formData.type !== 'slot'} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-400 transition-all outline-none disabled:opacity-50" value={formData.slots_total} onChange={e => setFormData({ ...formData, slots_total: e.target.value })} placeholder="Unlimited" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Total Credits</label>
                                        <input type="number" min="1" disabled={formData.type !== 'credit'} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-400 transition-all outline-none disabled:opacity-50" value={formData.credits_total} onChange={e => setFormData({ ...formData, credits_total: e.target.value })} placeholder="Unlimited" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only peer" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                                            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">Entitlement Valid Functionally</span>
                                    </label>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-8 py-2.5 bg-[#008080] rounded-xl text-sm font-black text-white hover:bg-teal-700 transition-all flex items-center gap-2 shadow-lg shadow-teal-700/20">
                                    {formSaving && <Loader2 className="animate-spin" size={16} />} Deploy Grant
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Entitlements;
