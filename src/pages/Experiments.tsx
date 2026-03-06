import React from 'react';
import { Plus, MoreHorizontal, Beaker, X, Edit, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { experimentService } from '../services/experimentService';
import { Experiment } from '../types/api';
import { getStatusStyles, formatDate } from '../utils/ui';

const Experiments = () => {
    const [loading, setLoading] = React.useState(true);
    const [experiments, setExperiments] = React.useState<Experiment[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        feature_key: '',
        targeting_type: 'percentage' as 'percentage' | 'rules',
        rollout_percentage: 10,
        enabled: true,
        active: true
    });

    const fetchExperiments = async () => {
        setLoading(true);
        try {
            const response = await experimentService.getExperiments();
            if (response.data) setExperiments(response.data);
        } catch (error) {
            console.error('Error fetching experiments:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchExperiments();
    }, []);

    const handleOpenModal = (exp?: Experiment) => {
        if (exp) {
            setEditingId(exp.id);
            setFormData({
                name: exp.name || '',
                description: exp.description || '',
                feature_key: exp.feature_key || '',
                targeting_type: exp.targeting_type || 'percentage',
                rollout_percentage: exp.rollout_percentage || 0,
                enabled: exp.enabled !== false,
                active: exp.active !== false
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                description: '',
                feature_key: '',
                targeting_type: 'percentage',
                rollout_percentage: 10,
                enabled: true,
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this experiment rule?')) return;
        try {
            await experimentService.deleteExperiment(id);
            setExperiments(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            const payload: any = { ...formData };
            if (payload.targeting_type !== 'percentage') {
                payload.rollout_percentage = 0;
            }

            if (editingId) {
                await experimentService.updateExperiment(editingId, payload);
            } else {
                await experimentService.createExperiment(payload);
            }
            await fetchExperiments();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save A/B Experiment');
        } finally {
            setFormSaving(false);
        }
    };

    if (loading && experiments.length === 0) return <div className="p-8 font-bold text-slate-400">Loading experiments...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Experiments (A/B)</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage active rollout systems and targeting rules</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 rounded-xl text-sm font-bold text-white shadow-lg overflow-hidden transition-all hover:bg-orange-600"
                >
                    <Plus size={18} /> New Experiment
                </button>
            </div>

            <div className="premium-card overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Experiment Name</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Targeting</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Rollout %</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Timing</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {experiments.map((exp) => (
                            <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors"><Beaker size={18} /></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{exp.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{exp.feature_key}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs font-bold text-slate-600 capitalize bg-slate-100 px-2 py-1 rounded-lg">{exp.targeting_type}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-400 rounded-full" style={{ width: `${exp.rollout_percentage || 0}%` }} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">{exp.rollout_percentage || 0}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-[11px] text-slate-500 truncate">{formatDate(exp.starts_at)} →</div>
                                    <div className="text-[11px] text-slate-500 truncate">{formatDate(exp.ends_at)}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(exp.active && exp.enabled ? 'active' : 'inactive')}`}>
                                        {exp.active && exp.enabled ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 pr-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => handleOpenModal(exp)} className="text-slate-400 hover:text-orange-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(exp.id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {experiments.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No A/B experiments running.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between bg-orange-50/50">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-slate-900">{editingId ? 'Edit Configuration' : 'Launch New A/B Testing'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-orange-100 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="p-8 space-y-6 flex-1 max-h-[70vh] overflow-y-auto premium-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Experiment Label</label>
                                    <input required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-orange-400 transition-all outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="New Sign-up Flow 2.0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Feature Resource Key</label>
                                    <input required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono text-orange-600 focus:bg-white focus:border-orange-400 transition-all outline-none" value={formData.feature_key} onChange={e => setFormData({ ...formData, feature_key: e.target.value })} placeholder="app.auth.v2" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Targeting Mode</label>
                                        <div className="relative">
                                            <select required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-orange-400 transition-all capitalize" value={formData.targeting_type} onChange={e => setFormData({ ...formData, targeting_type: e.target.value as any })}>
                                                <option value="percentage">Percentage Rollout</option>
                                                <option value="rules">Complex Ruleset</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Rollout Population (%)</label>
                                        <div className="relative flex items-center">
                                            <input type="number" min="0" max="100" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 text-sm font-bold focus:bg-white focus:border-orange-400 transition-all outline-none" value={formData.rollout_percentage} onChange={e => setFormData({ ...formData, rollout_percentage: Number(e.target.value) })} disabled={formData.targeting_type !== 'percentage'} />
                                            <span className="absolute right-4 text-slate-400 font-bold">%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only peer" checked={formData.enabled} onChange={e => setFormData({ ...formData, enabled: e.target.checked })} />
                                            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">Flag Enabled</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only peer" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                                            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">Rules Executing (Active)</span>
                                    </label>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-8 py-2.5 bg-slate-900 rounded-xl text-sm font-black text-white hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-900/20">
                                    {formSaving && <Loader2 className="animate-spin" size={16} />} Deploy Experiment Matrix
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Experiments;
