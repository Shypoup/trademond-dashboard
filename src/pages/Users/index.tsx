import React from 'react';
import {
    Users as UsersIcon,
    UserPlus,
    Search,
    ShieldCheck,
    AlertCircle,
    Loader2,
    X,
    Edit,
    Trash2,
    ChevronDown
} from 'lucide-react';
import { userService } from '@services/userService';
import { User } from '@data-types/api';
import { getStatusStyles, formatDate } from '@utils/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const Users = () => {
    const [loading, setLoading] = React.useState(true);
    const [userList, setUserList] = React.useState<User[]>([]);
    const [totalUsers, setTotalUsers] = React.useState(0);

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | number | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getUsers();
            if (response.data) {
                setUserList(response.data);
                setTotalUsers(response.meta?.total || response.data.length);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingId(user.id);
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '', // Blank for security; only send if changing
                role: user.role || 'user'
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'user'
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
        try {
            await userService.deleteUser(String(id));
            setUserList(prev => prev.filter(u => u.id !== id));
            setTotalUsers(prev => prev - 1);
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            if (editingId) {
                // If updating, only send password if it's not empty
                const payload = { ...formData };
                if (!payload.password) delete (payload as any).password;
                await userService.updateUser(String(editingId), payload);
            } else {
                await userService.createUser(formData);
            }
            await fetchUsers();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save user');
        } finally {
            setFormSaving(false);
        }
    };

    if (loading && userList.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-muted-foreground animate-pulse">Synchronizing Governance Node...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">User Management</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Configure user roles, permissions and monitor access levels.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
                >
                    <UserPlus size={18} />
                    <span>Invite New User</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {[
                    { label: 'Total Users', value: totalUsers.toLocaleString(), change: '+0.0%', icon: UsersIcon },
                    { label: 'Active Users', value: userList.filter(u => u.status === 'Active').length.toLocaleString(), change: '+0.0%', icon: ShieldCheck },
                    { label: 'System Health', value: '100%', change: 'Stable', icon: AlertCircle },
                ].map((stat, idx) => (
                    <div key={idx} className="premium-card group relative p-6 transition-all hover:border-primary/30">
                        <div className="flex items-start justify-between">
                            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                                <stat.icon size={22} />
                            </div>
                            <div className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                                {stat.change}
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-[13px] font-medium uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                            <h3 className="mt-1 font-outfit text-3xl font-bold text-foreground">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="premium-card overflow-hidden shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border bg-muted/40 p-6 md:p-8">
                    <div className="flex rounded-2xl border border-border bg-muted/50 p-1.5">
                        <button type="button" className="rounded-xl bg-primary px-6 py-2 text-sm font-bold text-primary-foreground shadow-md">All Users</button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Quick search..."
                                className="h-12 w-64 rounded-2xl border border-border bg-background ps-12 pe-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">User Details</th>
                                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Role</th>
                                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Last Connection</th>
                                <th className="px-8 py-5 text-end text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {userList.map((user) => (
                                <tr key={user.id} className="group transition-colors hover:bg-muted/50">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 overflow-hidden rounded-2xl border-2 border-border transition-transform duration-300 group-hover:scale-110">
                                                <img src={user.image || user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=008080&color=fff`} alt={user.name} />
                                            </div>
                                            <div>
                                                <h5 className="text-[14px] font-bold text-foreground">{user.name}</h5>
                                                <p className="mt-0.5 text-xs font-medium text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold capitalize text-muted-foreground">{user.role || 'Member'}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${getStatusStyles(user.status || '').replace('bg-', 'bg-').split(' ')[0]}`}></div>
                                            <span className={`text-[12px] font-bold capitalize ${getStatusStyles(user.status || '').replace('text-', 'text-').split(' ')[1]}`}>
                                                {user.status || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-[13px] font-medium text-muted-foreground">{formatDate(user.lastLogin || user.last_login)}</td>
                                    <td className="px-8 py-6 text-end">
                                        <div className="flex items-center justify-end gap-2">
                                            <button type="button" onClick={() => handleOpenModal(user)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-primary">
                                                <Edit size={16} />
                                            </button>
                                            <button type="button" onClick={() => handleDelete(user.id)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-destructive/10 hover:text-destructive">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {userList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                <SheetContent
                    side="right"
                    showCloseButton={false}
                    className="p-0 !max-w-lg w-full max-h-screen overflow-y-auto border-none shadow-2xl flex flex-col gap-0 sm:!max-w-lg"
                >
                    <div className="shrink-0 border-b border-border bg-muted/50 p-6">
                        <div className="flex items-center justify-between">
                            <SheetHeader className="!m-0 !p-0">
                                <SheetTitle className="font-outfit text-xl font-bold text-foreground">
                                    {editingId ? 'Edit Profile' : 'Invite New User'}
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
                                <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
                                <input required className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                                <input type="email" required className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">System Role</label>
                                <div className="relative">
                                    <select required className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="user">Standard User</option>
                                        <option value="admin">Administrator</option>
                                        <option value="editor">Editor</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{editingId ? 'New Password (Optional)' : 'Passcode'}</label>
                                <input type="password" required={!editingId} className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                            </div>
                        </div>
                        <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-muted/50 p-6">
                            <button type="button" className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" disabled={formSaving} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50">
                                {formSaving && <Loader2 className="animate-spin" size={16} />} Configure Access
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Users;
