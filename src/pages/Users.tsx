import React from 'react';
import {
    Users as UsersIcon,
    UserPlus,
    Search,
    MoreVertical,
    ShieldCheck,
    AlertCircle,
    Loader2,
    X,
    Edit,
    Trash2,
    ChevronDown
} from 'lucide-react';
import { userService } from '../services/userService';
import { User } from '../types/api';
import { getStatusStyles, formatDate } from '../utils/ui';

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
                    <p className="text-slate-400 font-bold animate-pulse text-sm">Synchronizing Governance Node...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">User Management</h2>
                    <p className="text-slate-500 text-sm mt-1">Configure user roles, permissions and monitor access levels.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-lg"
                >
                    <UserPlus size={18} />
                    <span>Invite New User</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Users', value: totalUsers.toLocaleString(), change: '+0.0%', icon: UsersIcon, color: 'text-teal-400' },
                    { label: 'Active Users', value: userList.filter(u => u.status === 'Active').length.toLocaleString(), change: '+0.0%', icon: ShieldCheck, color: 'text-teal-400' },
                    { label: 'System Health', value: '100%', change: 'Stable', icon: AlertCircle, color: 'text-teal-400' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-[#0a2525] p-6 rounded-3xl border border-white/5 relative group hover:border-[#008080]/30 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-white/5 rounded-xl text-teal-400"><stat.icon size={22} /></div>
                            <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-teal-400 bg-teal-400/10`}>
                                {stat.change}
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-slate-500 text-[13px] font-medium uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-white mt-1 font-outfit">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-[#0a2525] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex bg-[#0d2e2e] p-1.5 rounded-2xl border border-white/5">
                        <button className="px-6 py-2 rounded-xl text-sm font-bold bg-[#008080] text-white shadow-lg">All Users</button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute inset-y-0 left-4 mt-3.5 flex items-center text-slate-500 group-focus-within:text-teal-400" size={18} />
                            <input
                                type="text"
                                placeholder="Quick search..."
                                className="w-64 h-12 pl-12 pr-4 bg-[#0d2e2e] border border-slate-800 focus:border-teal-400 rounded-2xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">User Details</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Role</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Last Connection</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {userList.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl border-2 border-white/5 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                                                <img src={user.image || user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=008080&color=fff`} alt={user.name} />
                                            </div>
                                            <div>
                                                <h5 className="text-[14px] font-bold text-white">{user.name}</h5>
                                                <p className="text-xs font-medium text-slate-500 mt-0.5">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-400 capitalize">{user.role || 'Member'}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${getStatusStyles(user.status || '').replace('bg-', 'bg-').split(' ')[0]}`}></div>
                                            <span className={`text-[12px] font-bold capitalize ${getStatusStyles(user.status || '').replace('text-', 'text-').split(' ')[1]}`}>
                                                {user.status || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-[13px] text-slate-500 font-medium">{formatDate(user.lastLogin || user.last_login)}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleOpenModal(user)} className="text-slate-500 hover:text-teal-400 p-2 border border-transparent hover:border-white/10 rounded-lg transition-all">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="text-slate-500 hover:text-rose-400 p-2 border border-transparent hover:border-white/10 rounded-lg transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {userList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Dark Theme for Users */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-[#0a2525] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10 flex flex-col">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-white">{editingId ? 'Edit Profile' : 'Invite New User'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="p-8 space-y-6 flex-1">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">Full Name</label>
                                    <input required className="w-full h-12 bg-[#0d2e2e] border border-slate-800 rounded-2xl px-4 text-sm font-bold text-white placeholder-slate-600 focus:border-teal-400 transition-all outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">Email Address</label>
                                    <input type="email" required className="w-full h-12 bg-[#0d2e2e] border border-slate-800 rounded-2xl px-4 text-sm font-bold text-white placeholder-slate-600 focus:border-teal-400 transition-all outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">System Role</label>
                                    <div className="relative">
                                        <select required className="w-full h-12 bg-[#0d2e2e] border border-slate-800 rounded-2xl px-4 text-sm font-bold text-white appearance-none outline-none focus:border-teal-400 transition-all" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                            <option value="user">Standard User</option>
                                            <option value="admin">Administrator</option>
                                            <option value="editor">Editor</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">{editingId ? 'New Password (Optional)' : 'Passcode'}</label>
                                    <input type="password" required={!editingId} className="w-full h-12 bg-[#0d2e2e] border border-slate-800 rounded-2xl px-4 text-sm font-bold text-white placeholder-slate-600 focus:border-teal-400 transition-all outline-none" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-[#081a1a]">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-8 py-2.5 bg-teal-500 rounded-xl text-sm font-black text-[#051414] hover:bg-teal-400 transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20">
                                    {formSaving && <Loader2 className="animate-spin" size={16} />} Configure Access
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
