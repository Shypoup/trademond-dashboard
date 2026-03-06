import React from 'react';
import { Search, Plus, MoreHorizontal, Star, Edit, Trash2, X, Loader2, ChevronDown } from 'lucide-react';
import { sponsorshipService } from '../services/sponsorshipService';
import { Sponsorship } from '../types/api';
import { getStatusStyles, formatDate, formatCurrency } from '../utils/ui';

const Sponsorships = () => {
    const [loading, setLoading] = React.useState(true);
    const [sponsorships, setSponsorships] = React.useState<Sponsorship[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        keyword: '',
        entity_type: 'company' as 'company' | 'product' | 'service',
        entity_id: '',
        company_id: '',
        amount_paid: '',
        position: '',
        status: 'pending'
    });

    const fetchSponsorships = async () => {
        setLoading(true);
        try {
            const response = await sponsorshipService.getSponsorships();
            if (response.data) setSponsorships(response.data);
        } catch (error) {
            console.error('Error fetching sponsorships:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchSponsorships();
    }, []);

    const handleOpenModal = (sponsor?: Sponsorship) => {
        if (sponsor) {
            setEditingId(sponsor.id);
            setFormData({
                keyword: sponsor.keyword || '',
                entity_type: sponsor.entity_type || 'company',
                entity_id: sponsor.entity_id || '',
                company_id: sponsor.company_id || '',
                amount_paid: sponsor.amount_paid ? String(sponsor.amount_paid) : '',
                position: sponsor.position ? String(sponsor.position) : '',
                status: sponsor.status || 'pending'
            });
        } else {
            setEditingId(null);
            setFormData({
                keyword: '',
                entity_type: 'company',
                entity_id: '',
                company_id: '',
                amount_paid: '',
                position: '',
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this sponsorship?')) return;
        try {
            await sponsorshipService.deleteSponsorship(id);
            setSponsorships(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            const payload: any = { ...formData };
            if (payload.amount_paid) payload.amount_paid = Number(payload.amount_paid);
            if (payload.position) payload.position = Number(payload.position);

            // Clean up unused IDs
            if (payload.entity_type === 'company' && !payload.company_id) {
                payload.company_id = payload.entity_id;
            }

            if (editingId) {
                await sponsorshipService.updateSponsorship(editingId, payload);
            } else {
                await sponsorshipService.createSponsorship(payload);
            }
            await fetchSponsorships();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save sponsorship campaign');
        } finally {
            setFormSaving(false);
        }
    };

    if (loading && sponsorships.length === 0) return <div className="p-8 font-bold text-slate-400">Loading sponsorships...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Sponsorships</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage sponsored keywords and entity rankings ({sponsorships.length} campaigns)</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white shadow-lg overflow-hidden transition-all hover:bg-[#006666]"
                >
                    <Plus size={18} /> Setup Sponsorship
                </button>
            </div>

            <div className="premium-card overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Keyword Target</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Type / Entity ID</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Amount</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Date Range</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {sponsorships.map((s) => (
                            <tr key={s.id} className="hover:bg-amber-50/20 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors"><Star size={14} className="fill-current" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">"{s.keyword}"</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Pos: {s.position || 1}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                                    <div className="capitalize">{s.entity_type}</div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 w-24 truncate">{s.entity_id || s.company_id}</div>
                                </td>
                                <td className="px-6 py-5 text-sm font-bold text-amber-600">
                                    {formatCurrency(s.amount_paid)}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-[11px] text-slate-500"><span className="font-bold text-slate-400">Starts:</span> {formatDate(s.starts_at)}</div>
                                    <div className="text-[11px] text-slate-500 mt-0.5"><span className="font-bold text-slate-400">Ends:</span> {formatDate(s.expires_at)}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(s.status || 'pending')} capitalize`}>
                                        {s.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 pr-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => handleOpenModal(s)} className="text-slate-400 hover:text-amber-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sponsorships.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No active sponsorships found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between bg-amber-50">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-slate-900">{editingId ? 'Edit Sponsorship' : 'Create Sponsorship Campaign'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-900/50">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="p-8 space-y-6 flex-1 max-h-[70vh] overflow-y-auto premium-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Target Keyword Phrase</label>
                                    <input required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-amber-400 transition-all outline-none" value={formData.keyword} onChange={e => setFormData({ ...formData, keyword: e.target.value })} placeholder="e.g. machinery" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Entity Type</label>
                                        <div className="relative">
                                            <select required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-amber-400 transition-all capitalize" value={formData.entity_type} onChange={e => setFormData({ ...formData, entity_type: e.target.value as any })}>
                                                <option value="company">Company Profile</option>
                                                <option value="product">Product Page</option>
                                                <option value="service">Service Listing</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Entity System ID</label>
                                        <input required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono focus:bg-white focus:border-amber-400 transition-all outline-none" value={formData.entity_id} onChange={e => setFormData({ ...formData, entity_id: e.target.value, company_id: e.target.value })} placeholder="UUID or Int..." />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Rank Pos</label>
                                        <input type="number" min="1" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-amber-400 transition-all outline-none" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} placeholder="1" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Amount ($)</label>
                                        <input type="number" step="0.01" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-amber-400 transition-all outline-none" value={formData.amount_paid} onChange={e => setFormData({ ...formData, amount_paid: e.target.value })} placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Status</label>
                                        <div className="relative">
                                            <select required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-amber-400 transition-all capitalize" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="active">Active</option>
                                                <option value="pending">Pending</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-10 py-2.5 bg-amber-500 rounded-xl text-sm font-black text-white hover:bg-amber-600 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20">
                                    {formSaving && <Loader2 className="animate-spin" size={16} />} Save Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sponsorships;
