import React from 'react';
import { Plus, MoreHorizontal, List as ListIcon, X, Edit, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { curatedListService } from '../services/curatedListService';
import { CuratedList } from '../types/api';
import { displayBilingual, getStatusStyles, formatDate } from '../utils/ui';

const CuratedLists = () => {
    const [loading, setLoading] = React.useState(true);
    const [lists, setLists] = React.useState<CuratedList[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: { en: '', ar: '' },
        headline: { en: '', ar: '' },
        type: 'companies' as 'companies' | 'products' | 'services',
        slug: '',
        max_items: '',
        active: true,
        published: true
    });

    const fetchLists = async () => {
        setLoading(true);
        try {
            const response = await curatedListService.getLists();
            if (response.data) setLists(response.data);
        } catch (error) {
            console.error('Error fetching curated lists:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchLists();
    }, []);

    const handleOpenModal = (list?: CuratedList) => {
        if (list) {
            setEditingId(list.id);
            setFormData({
                name: typeof list.name === 'string' ? { en: list.name, ar: '' } : list.name,
                headline: typeof list.headline === 'string' ? { en: list.headline, ar: '' } : (list.headline || { en: '', ar: '' }),
                type: list.type || 'companies',
                slug: list.slug || '',
                max_items: list.max_items ? String(list.max_items) : '',
                active: list.active !== false,
                published: list.published !== false
            });
        } else {
            setEditingId(null);
            setFormData({
                name: { en: '', ar: '' },
                headline: { en: '', ar: '' },
                type: 'companies',
                slug: '',
                max_items: '',
                active: true,
                published: true
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this list? The items inside it will not be deleted, just removed from the list.')) return;
        try {
            await curatedListService.deleteList(id);
            setLists(prev => prev.filter(l => l.id !== id));
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            const payload: any = { ...formData };
            if (payload.max_items) payload.max_items = Number(payload.max_items);
            else delete payload.max_items;

            if (editingId) {
                await curatedListService.updateList(editingId, payload);
            } else {
                await curatedListService.createList(payload);
            }
            await fetchLists();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save collection');
        } finally {
            setFormSaving(false);
        }
    };

    const updateBilingual = (field: keyof typeof formData, lang: 'en' | 'ar', val: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: { ...(prev[field] || {}), [lang]: val }
        }));
    };

    if (loading && lists.length === 0) return <div className="p-8 font-bold text-slate-400">Loading lists...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Curated Lists</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage platform collections and spotlights</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 rounded-xl text-sm font-bold text-white shadow-lg overflow-hidden transition-all hover:bg-teal-700"
                >
                    <Plus size={18} /> Create Collection
                </button>
            </div>

            <div className="premium-card overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Collection Name</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Type / Slug</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Items</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Last Updated</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {lists.map((list) => (
                            <tr key={list.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white"><ListIcon size={18} /></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{displayBilingual(list.name)}</p>
                                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{displayBilingual(list.headline) || 'No Headline'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                                    <div className="capitalize">{list.type}</div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{list.slug}</div>
                                </td>
                                <td className="px-6 py-5 text-sm font-bold text-slate-600">
                                    {list.items?.length || 0} <span className="text-[10px] text-slate-400 font-medium">/ {list.max_items || 'Unlimited'}</span>
                                </td>
                                <td className="px-6 py-5 text-xs text-slate-500">{formatDate(list.updated_at || list.created_at)}</td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(list.active && list.published ? 'published' : 'draft')}`}>
                                        {list.active && list.published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 pr-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => handleOpenModal(list)} className="text-slate-400 hover:text-purple-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(list.id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {lists.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No curated lists created yet.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between bg-purple-50/50">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-slate-900">{editingId ? 'Edit Collection' : 'Create Collection'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-purple-100 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="p-8 space-y-6 flex-1 max-h-[70vh] overflow-y-auto premium-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Collection Name (EN)</label>
                                        <input required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-purple-400 transition-all outline-none" value={formData.name.en} onChange={e => updateBilingual('name', 'en', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block pr-2">الإسم (عربي)</label>
                                        <input required dir="rtl" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-purple-400 transition-all outline-none text-right" value={formData.name.ar} onChange={e => updateBilingual('name', 'ar', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Tagline/Headline (EN)</label>
                                        <input className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:bg-white focus:border-purple-400 transition-all outline-none" value={formData.headline.en} onChange={e => updateBilingual('headline', 'en', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block pr-2">السطر التوضيحي</label>
                                        <input dir="rtl" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:bg-white focus:border-purple-400 transition-all outline-none text-right" value={formData.headline.ar} onChange={e => updateBilingual('headline', 'ar', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="col-span-1 space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Entity Type</label>
                                        <div className="relative">
                                            <select required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-purple-400 transition-all capitalize" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                                                <option value="companies">Companies</option>
                                                <option value="products">Products</option>
                                                <option value="services">Services</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="col-span-1 space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Slug URL ID</label>
                                        <input required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono text-purple-600 focus:bg-white focus:border-purple-400 transition-all outline-none" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="top-100-egy" />
                                    </div>
                                    <div className="col-span-1 space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Max Capacity</label>
                                        <input type="number" min="1" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-purple-400 transition-all outline-none" value={formData.max_items} onChange={e => setFormData({ ...formData, max_items: e.target.value })} placeholder="Unlimited" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only peer" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                                            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">Internally Active</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only peer" checked={formData.published} onChange={e => setFormData({ ...formData, published: e.target.checked })} />
                                            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">Published to Clients</span>
                                    </label>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-8 py-2.5 bg-slate-900 rounded-xl text-sm font-black text-white hover:bg-purple-600 transition-all flex items-center gap-2 shadow-lg shadow-purple-900/20">
                                    {formSaving && <Loader2 className="animate-spin" size={16} />} Deploy Collection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CuratedLists;
