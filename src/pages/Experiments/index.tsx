import React from 'react';
import { Plus, MoreHorizontal, Beaker, X, Edit, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { experimentService } from '@services/experimentService';
import { Experiment } from '@data-types/api';
import { getStatusStyles, formatDate } from '@utils/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
                    <h2 className="text-2xl font-bold text-foreground font-outfit">Experiments (A/B)</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage active rollout systems and targeting rules</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 rounded-xl text-sm font-bold text-white shadow-lg overflow-hidden transition-all hover:bg-orange-600"
                >
                    <Plus size={18} /> New Experiment
                </button>
            </div>

            <div className="premium-card overflow-hidden">
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
                    <tbody className="divide-y divide-border">
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
                                    {editingId ? 'Edit Configuration' : 'Launch New A/B Testing'}
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
                                <div className="space-y-2">
                                    <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Experiment Label</label>
                                    <input required className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="New Sign-up Flow 2.0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Feature Resource Key</label>
                                    <input required className="h-12 w-full rounded-xl border border-border bg-background px-4 font-mono text-sm text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.feature_key} onChange={e => setFormData({ ...formData, feature_key: e.target.value })} placeholder="app.auth.v2" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Targeting Mode</label>
                                        <div className="relative">
                                            <select required className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 text-sm font-bold capitalize text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.targeting_type} onChange={e => setFormData({ ...formData, targeting_type: e.target.value as any })}>
                                                <option value="percentage">Percentage Rollout</option>
                                                <option value="rules">Complex Ruleset</option>
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Rollout Population (%)</label>
                                        <div className="relative flex items-center">
                                            <input type="number" min="0" max="100" className="h-12 w-full rounded-xl border border-border bg-background ps-4 pe-10 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.rollout_percentage} onChange={e => setFormData({ ...formData, rollout_percentage: Number(e.target.value) })} disabled={formData.targeting_type !== 'percentage'} />
                                            <span className="pointer-events-none absolute end-4 font-bold text-muted-foreground">%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 pt-2">
                                    <label className="group flex cursor-pointer items-center gap-3">
                                        <div className="relative inline-flex scale-90 items-center">
                                            <input type="checkbox" className="peer sr-only" checked={formData.enabled} onChange={e => setFormData({ ...formData, enabled: e.target.checked })} />
                                            <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-transparent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring/40" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground">Flag Enabled</span>
                                    </label>
                                    <label className="group flex cursor-pointer items-center gap-3">
                                        <div className="relative inline-flex scale-90 items-center">
                                            <input type="checkbox" className="peer sr-only" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                                            <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-transparent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring/40" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground">Rules Executing (Active)</span>
                                    </label>
                                </div>
                        </div>
                        <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-muted/50 p-6">
                            <button type="button" className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" disabled={formSaving} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50">
                                {formSaving && <Loader2 className="animate-spin" size={16} />} Deploy Experiment Matrix
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Experiments;
