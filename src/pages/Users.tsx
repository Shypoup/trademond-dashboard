import React from 'react';
import {
    Users as UsersIcon,
    UserPlus,
    Search,
    Filter,
    Download,
    MoreVertical,
    CheckCircle2,
    ShieldCheck,
    UserX,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { userService } from '../services/userService';
import { User } from '../types/api';
import { getStatusStyles, formatDate } from '../utils/ui';

const Users = () => {
    const [loading, setLoading] = React.useState(true);
    const [userList, setUserList] = React.useState<User[]>([]);
    const [totalUsers, setTotalUsers] = React.useState(0);

    React.useEffect(() => {
        const fetchUsers = async () => {
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
        fetchUsers();
    }, []);

    if (loading) {
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
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">User Management</h2>
                    <p className="text-slate-500 text-sm mt-1">Configure user roles, permissions and monitor access levels.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-lg">
                    <UserPlus size={18} />
                    <span>Invite New User</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Users', value: totalUsers.toLocaleString(), change: '+0.0%', icon: UsersIcon, color: 'text-teal-400' },
                    { label: 'Active Users', value: userList.filter(u => u.status?.includes('Active')).length.toLocaleString(), change: '+0.0%', icon: ShieldCheck, color: 'text-teal-400' },
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
                                        <button className="text-slate-600 hover:text-white transition-colors">
                                            <MoreVertical size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
