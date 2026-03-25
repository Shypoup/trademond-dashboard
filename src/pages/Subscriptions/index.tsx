import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, MoreHorizontal, ClipboardList, X, Edit, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { subscriptionService } from '@services/subscriptionService';
import { planService } from '@services/planService';
import { companyService } from '@services/companyService';
import { userService } from '@services/userService';
import { Subscription, Plan, Company, User } from '@data-types/api';
import { getStatusStyles, formatDate, formatCurrency, displayBilingual } from '@utils/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const Subscriptions = () => {
    const { t } = useTranslation();
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

    const handleCancel = async (id: string) => {
        if (!window.confirm(t('subscriptionManagement.cancelConfirm'))) return;
        try {
            await subscriptionService.cancelSubscription(id);
            await fetchData();
        } catch (error) {
            console.error('Cancel failed', error);
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

    if (loading && subs.length === 0) {
        return <div className="p-8 font-bold text-muted-foreground">Loading subscriptions...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">Subscriptions</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Monitor active company plans ({subs.length} total ledgers)</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                >
                    <Plus size={18} /> Add Subscription
                </button>
            </div>

            <div className="premium-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Subscriber</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Cycle</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Amount</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Dates</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Status</th>
                            <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {subs.map((s) => {
                            const relatedCompany = companies.find(c => String(c.id) === String(s.company_ulid));
                            const relatedUser = users.find(u => String(u.id) === String(s.user_ulid));

                            return (
                                <tr key={s.id} className="group transition-colors hover:bg-muted/50">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><ClipboardList size={14} /></div>
                                            <div>
                                                <p className="text-[13px] font-bold text-foreground">
                                                    {relatedCompany ? displayBilingual(relatedCompany.name) : (relatedUser ? relatedUser.name : (s.company_ulid || s.user_ulid || 'Unknown Entity'))}
                                                </p>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.plan?.slug || 'Manual Auth'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium capitalize text-muted-foreground">{s.billing_cycle}</td>
                                    <td className="px-6 py-5 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                                        {formatCurrency(s.amount_paid)} {s.currency && <span className="ms-1 text-[10px] text-muted-foreground">{s.currency}</span>}
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-[11px] text-muted-foreground"><span className="font-bold">Start:</span> {formatDate(s.starts_at)}</p>
                                        <p className="text-[11px] text-muted-foreground"><span className="font-bold">End:</span> {formatDate(s.expires_at)}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(s.status)} capitalize`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 pr-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleOpenModal(s)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-primary">
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                title={t('subscriptionManagement.cancelActionTitle')}
                                                onClick={() => handleCancel(s.id)}
                                                className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-destructive"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {subs.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No subscriptions listed.</td></tr>}
                    </tbody>
                </table>
            </div>

            <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                <SheetContent
                    side="right"
                    showCloseButton={false}
                    className="p-0 !max-w-3xl w-full max-h-screen overflow-y-auto border-none shadow-2xl flex flex-col gap-0 sm:!max-w-3xl"
                >
                    <div className="shrink-0 border-b border-border bg-muted/50 p-6">
                        <div className="flex items-center justify-between">
                            <SheetHeader className="!m-0 !p-0">
                                <SheetTitle className="font-outfit text-xl font-bold text-foreground">
                                    {editingId ? 'Modify Subscription' : 'Provision Subscription'}
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

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        <div className="p-8 space-y-6 flex-1 overflow-y-auto premium-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="pl-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Attach to Company</label>
                                        <div className="relative">
                                            <select className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.company_ulid} onChange={e => setFormData({ ...formData, company_ulid: e.target.value, user_ulid: '' })}>
                                                <option value="">-- None (User Sub) --</option>
                                                {companies.map(c => <option key={c.id} value={c.id}>{displayBilingual(c.name)}</option>)}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="pl-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">OR Attach to User</label>
                                        <div className="relative">
                                            <select className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.user_ulid} onChange={e => setFormData({ ...formData, user_ulid: e.target.value, company_ulid: '' })} disabled={!!formData.company_ulid}>
                                                <option value="">-- Select User --</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="pl-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Subscription Plan Ledger</label>
                                    <div className="relative">
                                        <select required className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.plan_ulid} onChange={e => setFormData({ ...formData, plan_ulid: e.target.value })}>
                                            <option value="">-- Select Valid Plan --</option>
                                            {plans.map(p => <option key={p.id} value={p.id}>{displayBilingual(p.name)} - Lvl {p.level}</option>)}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="pl-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Billing Cycle</label>
                                        <div className="relative">
                                            <select required className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 text-sm font-bold capitalize text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.billing_cycle} onChange={e => setFormData({ ...formData, billing_cycle: e.target.value as any })}>
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="pl-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Override Status</label>
                                        <div className="relative">
                                            <select required className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 text-sm font-bold capitalize text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                                                <option value="active">Active</option>
                                                <option value="pending">Pending</option>
                                                <option value="trial">Trialing</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="expired">Expired</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="pl-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Record Paid ($)</label>
                                        <input type="number" step="0.01" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.amount_paid} onChange={e => setFormData({ ...formData, amount_paid: e.target.value })} placeholder="0.00" />
                                    </div>
                                </div>
                        </div>
                        <div className="flex shrink-0 justify-end gap-4 border-t border-border bg-muted/50 p-6">
                            <button type="button" className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" disabled={formSaving} className="flex items-center gap-2 rounded-xl bg-primary px-10 py-2.5 text-sm font-black text-primary-foreground shadow-xl transition-all hover:bg-primary/90 disabled:opacity-50">
                                {formSaving && <Loader2 className="animate-spin" size={16} />} Commit Subscription
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Subscriptions;
