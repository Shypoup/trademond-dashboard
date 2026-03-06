import React from 'react';
import { ToggleRight, Plus, MoreHorizontal, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { featureOverrideService } from '../services/featureOverrideService';
import { FeatureOverride } from '../types/api';
import { formatDate } from '../utils/ui';

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
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Priority Overrides</h2>
                    <p className="text-slate-500 text-sm mt-1">Directly bypass global feature limitations per entity</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg overflow-hidden transition-all hover:bg-indigo-700"
                >
                    <Plus size={18} /> Apply Bypass
                </button>
            </div>

            <div className="premium-card overflow-hidden bg-white">
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
                    <tbody className="divide-y divide-slate-50">
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between bg-indigo-50">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-slate-900">{editingId ? 'Modify Bypass Settings' : 'Initialize Direct Bypass'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-indigo-100 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="p-8 space-y-6 flex-1 max-h-[70vh] overflow-y-auto premium-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Entity ID</label>
                                        <input required disabled={!!editingId} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono focus:bg-white focus:border-indigo-400 transition-all outline-none disabled:opacity-50" value={formData.company_ulid} onChange={e => setFormData({ ...formData, company_ulid: e.target.value })} placeholder="01H..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Base Feature Layer</label>
                                        <input required disabled={!!editingId} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-indigo-400 transition-all outline-none disabled:opacity-50" value={formData.feature_key} onChange={e => setFormData({ ...formData, feature_key: e.target.value })} placeholder="api.usage.limit" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Overwrite Value</label>
                                        <input type="number" min="0" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-indigo-400 transition-all outline-none disabled:opacity-50" value={formData.limit} onChange={e => setFormData({ ...formData, limit: e.target.value })} placeholder="Numeric Limit Only" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Justification / Support ID</label>
                                        <input className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-indigo-400 transition-all outline-none disabled:opacity-50" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="TICKET-2239..." />
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only peer" checked={formData.enabled} onChange={e => setFormData({ ...formData, enabled: e.target.checked })} />
                                            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">Flag Granted Status</span>
                                    </label>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-8 py-2.5 bg-indigo-600 rounded-xl text-sm font-black text-white hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                                    {formSaving && <Loader2 className="animate-spin" size={16} />} Deploy Bypass
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeatureOverrides;
