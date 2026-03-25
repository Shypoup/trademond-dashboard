import React from 'react';
import { Plus, Star, Edit, Trash2, X, Loader2, ChevronDown } from 'lucide-react';
import { sponsorshipService } from '@services/sponsorshipService';
import { Sponsorship } from '@data-types/api';
import { getStatusStyles, formatDate, formatCurrency } from '@utils/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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

    if (loading && sponsorships.length === 0) {
        return <div className="p-8 font-bold text-muted-foreground">Loading sponsorships...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">Sponsorships</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Manage sponsored keywords and entity rankings ({sponsorships.length} campaigns)</p>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                >
                    <Plus size={18} /> Setup Sponsorship
                </button>
            </div>

            <div className="premium-card overflow-hidden">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Keyword Target</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Type / Entity ID</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Amount</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Date Range</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Status</th>
                            <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sponsorships.map((s) => (
                            <tr key={s.id} className="group transition-colors hover:bg-muted/50">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Star size={14} className="fill-current" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">&quot;{s.keyword}&quot;</p>
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Pos: {s.position || 1}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                                    <div className="capitalize">{s.entity_type}</div>
                                    <div className="mt-0.5 w-24 truncate font-mono text-[10px] text-muted-foreground">{s.entity_id || s.company_id}</div>
                                </td>
                                <td className="px-6 py-5 text-sm font-bold text-primary">
                                    {formatCurrency(s.amount_paid)}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-[11px] text-muted-foreground"><span className="font-bold text-muted-foreground/80">Starts:</span> {formatDate(s.starts_at)}</div>
                                    <div className="mt-0.5 text-[11px] text-muted-foreground"><span className="font-bold text-muted-foreground/80">Ends:</span> {formatDate(s.expires_at)}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(s.status || 'pending')} capitalize`}>
                                        {s.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 pe-4 text-end">
                                    <div className="flex items-center justify-end gap-1">
                                        <button type="button" onClick={() => handleOpenModal(s)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-primary">
                                            <Edit size={16} />
                                        </button>
                                        <button type="button" onClick={() => handleDelete(s.id)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-destructive/10 hover:text-destructive">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sponsorships.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No active sponsorships found.</td></tr>}
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
                                    {editingId ? 'Edit Sponsorship' : 'Create Sponsorship Campaign'}
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
                                    <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Target Keyword Phrase</label>
                                    <input required className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.keyword} onChange={e => setFormData({ ...formData, keyword: e.target.value })} placeholder="e.g. machinery" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Entity Type</label>
                                        <div className="relative">
                                            <select required className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 pe-10 text-sm font-bold capitalize text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.entity_type} onChange={e => setFormData({ ...formData, entity_type: e.target.value as any })}>
                                                <option value="company">Company Profile</option>
                                                <option value="product">Product Page</option>
                                                <option value="service">Service Listing</option>
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Entity System ID</label>
                                        <input required className="h-12 w-full rounded-xl border border-border bg-background px-4 font-mono text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.entity_id} onChange={e => setFormData({ ...formData, entity_id: e.target.value, company_id: e.target.value })} placeholder="UUID or Int..." />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Rank Pos</label>
                                        <input type="number" min="1" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} placeholder="1" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Amount ($)</label>
                                        <input type="number" step="0.01" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.amount_paid} onChange={e => setFormData({ ...formData, amount_paid: e.target.value })} placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Status</label>
                                        <div className="relative">
                                            <select required className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 pe-10 text-sm font-bold capitalize text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="active">Active</option>
                                                <option value="pending">Pending</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                        </div>
                        <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-muted/50 p-6">
                            <button type="button" className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" disabled={formSaving} className="flex items-center gap-2 rounded-xl bg-primary px-10 py-2.5 text-sm font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50">
                                {formSaving && <Loader2 className="animate-spin" size={16} />} Save Campaign
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Sponsorships;
