import React from 'react';
import { Plus, MoreHorizontal, ClipboardList, X, Edit, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { planService } from '../services/planService';
import { companyService } from '../services/companyService';
import { userService } from '../services/userService';
import { Subscription, Plan, Company, User } from '../types/api';
import { getStatusStyles, formatDate, formatCurrency, displayBilingual } from '../utils/ui';

const Subscriptions = () => {
    const [loading, setLoading] = React.useState(true);
    const [subs, setSubs] = React.useState<Subscription[]>([]);

    // For dropdowns
    const [plans, setPlans] = React.useState<Plan[]>([]);
    const [companies, setCompanies] = React.useState<Company[]>([]);
    const [users, setUsers] = React.useState<User[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        company_ulid: '',
        user_ulid: '',
        plan_ulid: '',
        status: 'pending' as Subscription['status'],
        billing_cycle: 'monthly' as 'monthly' | 'yearly',
        amount_paid: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subRes, planRes, compRes, userRes] = await Promise.all([
                subscriptionService.getSubscriptions(),
                planService.getPlans(),
                companyService.getCompanies(),
                userService.getUsers()
            ]);
            if (subRes.data) setSubs(subRes.data);
            if (planRes.data) setPlans(planRes.data);
            if (compRes.data) setCompanies(compRes.data);
            if (userRes.data) setUsers(userRes.data);
        } catch (error) {
            console.error('Error fetching subscription data:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (sub?: Subscription) => {
        if (sub) {
            setEditingId(sub.id);
            setFormData({
                company_ulid: sub.company_ulid || '',
                user_ulid: sub.user_ulid || '',
                plan_ulid: sub.plan_ulid || '',
                status: sub.status || 'pending',
                billing_cycle: sub.billing_cycle || 'monthly',
                amount_paid: sub.amount_paid ? String(sub.amount_paid) : ''
            });
        } else {
            setEditingId(null);
            setFormData({
                company_ulid: companies[0]?.id ? String(companies[0].id) : '',
                user_ulid: '',
                plan_ulid: plans[0]?.id || '',
                status: 'pending',
                billing_cycle: 'monthly',
                amount_paid: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('WARNING: Deleting a subscription may instantly cut off service access for the entity. Proceed?')) return;
        try {
            await subscriptionService.deleteSubscription(id);
            setSubs(prev => prev.filter(s => s.id !== id));
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
            else delete payload.amount_paid;

            if (!payload.company_ulid) delete payload.company_ulid;
            if (!payload.user_ulid) delete payload.user_ulid;

            if (editingId) {
                await subscriptionService.updateSubscription(editingId, payload);
            } else {
                await subscriptionService.createSubscription(payload);
            }
            await fetchData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to resolve subscription logic');
        } finally {
            setFormSaving(false);
        }
    };

    if (loading && subs.length === 0) return <div className="p-8 font-bold text-slate-400">Loading subscriptions...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Subscriptions</h2>
                    <p className="text-slate-500 text-sm mt-1">Monitor active company plans ({subs.length} total ledgers)</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 rounded-xl text-sm font-bold text-white shadow-lg hover:bg-teal-700 transition-colors"
                >
                    <Plus size={18} /> Add Subscription
                </button>
            </div>

            <div className="premium-card overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Subscriber</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Cycle</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Amount</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Dates</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {subs.map((s) => {
                            const relatedCompany = companies.find(c => String(c.id) === String(s.company_ulid));
                            const relatedUser = users.find(u => String(u.id) === String(s.user_ulid));

                            return (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors"><ClipboardList size={14} /></div>
                                            <div>
                                                <p className="text-[13px] font-bold text-slate-800">
                                                    {relatedCompany ? displayBilingual(relatedCompany.name) : (relatedUser ? relatedUser.name : (s.company_ulid || s.user_ulid || 'Unknown Entity'))}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.plan?.slug || 'Manual Auth'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-slate-600 capitalize">{s.billing_cycle}</td>
                                    <td className="px-6 py-5 text-sm font-medium text-slate-600 group-hover:text-teal-600 transition-colors">
                                        {formatCurrency(s.amount_paid)} {s.currency && <span className="text-[10px] text-slate-400 ml-1">{s.currency}</span>}
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-[11px] text-slate-500"><span className="font-bold">Start:</span> {formatDate(s.starts_at)}</p>
                                        <p className="text-[11px] text-slate-500"><span className="font-bold">End:</span> {formatDate(s.expires_at)}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(s.status)} capitalize`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 pr-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleOpenModal(s)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {subs.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No subscriptions listed.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-slate-900">{editingId ? 'Modify Subscription' : 'Provision Subscription'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="p-8 space-y-6 flex-1 max-h-[70vh] overflow-y-auto premium-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Attach to Company</label>
                                        <div className="relative">
                                            <select className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-slate-800 transition-all text-slate-700" value={formData.company_ulid} onChange={e => setFormData({ ...formData, company_ulid: e.target.value, user_ulid: '' })}>
                                                <option value="">-- None (User Sub) --</option>
                                                {companies.map(c => <option key={c.id} value={c.id}>{displayBilingual(c.name)}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">OR Attach to User</label>
                                        <div className="relative">
                                            <select className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-slate-800 transition-all text-slate-700" value={formData.user_ulid} onChange={e => setFormData({ ...formData, user_ulid: e.target.value, company_ulid: '' })} disabled={!!formData.company_ulid}>
                                                <option value="">-- Select User --</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Subscription Plan Ledger</label>
                                    <div className="relative">
                                        <select required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-slate-800 transition-all text-teal-700" value={formData.plan_ulid} onChange={e => setFormData({ ...formData, plan_ulid: e.target.value })}>
                                            <option value="">-- Select Valid Plan --</option>
                                            {plans.map(p => <option key={p.id} value={p.id}>{displayBilingual(p.name)} - Lvl {p.level}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Billing Cycle</label>
                                        <div className="relative">
                                            <select required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl  px-4 text-sm font-bold appearance-none outline-none focus:border-slate-800 transition-all capitalize" value={formData.billing_cycle} onChange={e => setFormData({ ...formData, billing_cycle: e.target.value as any })}>
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Override Status</label>
                                        <div className="relative">
                                            <select required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl  px-4 text-sm font-bold appearance-none outline-none focus:border-slate-800 transition-all capitalize" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                                                <option value="active">Active</option>
                                                <option value="pending">Pending</option>
                                                <option value="trial">Trialing</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="expired">Expired</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Record Paid ($)</label>
                                        <input type="number" step="0.01" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-slate-800 transition-all outline-none" value={formData.amount_paid} onChange={e => setFormData({ ...formData, amount_paid: e.target.value })} placeholder="0.00" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-4 bg-slate-50">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-10 py-2.5 bg-slate-900 rounded-xl text-sm font-black text-white hover:bg-teal-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20">
                                    {formSaving && <Loader2 className="animate-spin" size={16} />} Commit Subscription
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscriptions;
