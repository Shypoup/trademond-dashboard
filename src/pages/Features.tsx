import React from 'react';
import { Plus, MoreHorizontal, Layers, X, Edit, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { featureService } from '../services/featureService';
import { Feature } from '../types/api';
import { displayBilingual, getStatusStyles } from '../utils/ui';

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

    if (loading && features.length === 0) return <div className="p-8 font-bold text-slate-400">Loading features...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Platform Features</h2>
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

            <div className="premium-card overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Feature</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Category</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Type</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {features.map((f) => (
                            <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border flex items-center justify-center text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                            <Layers size={18} />
                                        </div>
                                        <div>
                                            <h5 className="text-[14px] font-bold text-slate-800">{displayBilingual(f.name)}</h5>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[200px]">{f.key}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-600 capitalize">{f.category}</td>
                                <td className="px-6 py-5">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-slate-100 text-slate-500 uppercase">{f.type}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(f.active ? 'active' : 'inactive')}`}>
                                        {f.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 pr-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => handleOpenModal(f)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(f.id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {features.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No features mapped.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-slate-900">{editingId ? 'Edit Feature' : 'Map New Feature'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="p-8 space-y-6 flex-1">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Display Name (EN)</label>
                                        <input required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-slate-800 transition-all outline-none" value={formData.name.en} onChange={e => updateBilingual('name', 'en', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block pr-2">الإسم بالعربية</label>
                                        <input required dir="rtl" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-slate-800 transition-all outline-none text-right" value={formData.name.ar} onChange={e => updateBilingual('name', 'ar', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">System Resource Key</label>
                                    <input required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-blue-600 focus:bg-white focus:border-slate-800 transition-all outline-none font-mono" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} placeholder="app.products.max_images" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Capability Type</label>
                                        <div className="relative">
                                            <select required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-slate-800 transition-all capitalize" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                                                <option value="boolean">Boolean Toggle (On/Off)</option>
                                                <option value="limit">Numeric Limit</option>
                                                <option value="tier">Subscription Tier Based</option>
                                                <option value="config">Complex Configuration</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Module Category</label>
                                        <input required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-slate-800 transition-all outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. general, analytics, api" />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only peer" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                                            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">Feature Active Globally</span>
                                    </label>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-4 bg-slate-50">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-10 py-2.5 bg-slate-900 rounded-xl text-sm font-black text-white hover:bg-teal-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20">
                                    {formSaving && <Loader2 className="animate-spin" size={16} />} Deploy Feature Map
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Features;
