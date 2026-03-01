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
    AlertCircle
} from 'lucide-react';

const users = [
    { id: 1, name: 'Jordan Vance', email: 'jordan@trademond.com', role: 'Super Admin', permissions: ['Full Access'], status: 'Active Now', lastLogin: '2 mins ago', avatar: 'https://i.pravatar.cc/150?u=jordan' },
    { id: 2, name: 'Sarah Jenkins', email: 's.jenkins@trademond.com', role: 'Admin', permissions: ['Billing', 'Users'], status: 'Active', lastLogin: 'Oct 24, 2023', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { id: 3, name: 'Marcus Thorne', email: 'marcus.t@trademond.com', role: 'Editor', permissions: ['Content'], status: 'Inactive', lastLogin: 'Nov 12, 2023', avatar: 'https://i.pravatar.cc/150?u=marcus' },
    { id: 4, name: 'Elena Rodriguez', email: 'elena.r@trademond.com', role: 'Admin', permissions: ['Reports', 'Users'], status: 'Suspended', lastLogin: 'Aug 05, 2023', avatar: 'https://i.pravatar.cc/150?u=elena' },
];

const Users = () => {
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
                    { label: 'Total Users', value: '12,840', change: '+12.4%', icon: UsersIcon, color: 'text-teal-400' },
                    { label: 'Active Users', value: '11,200', change: '+5.2%', icon: ShieldCheck, color: 'text-teal-400' },
                    { label: 'Pending Requests', value: '145', change: '-2.1%', icon: AlertCircle, color: 'text-rose-400', negative: true },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-[#0a2525] p-6 rounded-3xl border border-white/5 relative group hover:border-[#008080]/30 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-white/5 rounded-xl text-teal-400"><stat.icon size={22} /></div>
                            <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stat.negative ? 'text-rose-400 bg-rose-400/10' : 'text-teal-400 bg-teal-400/10'}`}>
                                {stat.change}
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-slate-500 text-[13px] font-medium uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-white mt-1 font-outfit">{stat.value}</h3>
                        </div>
                        {/* Background glow effect on hover */}
                        <div className="absolute inset-0 bg-[#008080]/0 group-hover:bg-[#008080]/5 rounded-3xl transition-all duration-500 pointer-events-none"></div>
                    </div>
                ))}
            </div>

            <div className="bg-[#0a2525] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex bg-[#0d2e2e] p-1.5 rounded-2xl border border-white/5">
                        <button className="px-6 py-2 rounded-xl text-sm font-bold bg-[#008080] text-white shadow-lg">All Users</button>
                        <button className="px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-300">Admins</button>
                        <button className="px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-300">Editors</button>
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
                        <button className="h-12 px-5 bg-[#0d2e2e] border border-slate-800 rounded-2xl text-slate-400 flex items-center gap-2 hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-widest">
                            <Filter size={18} />
                            <span>Filter</span>
                        </button>
                        <button className="h-12 px-5 bg-[#0d2e2e] border border-slate-800 rounded-2xl text-slate-400 flex items-center gap-2 hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-widest">
                            <Download size={18} />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">User Details</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Role</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Permissions</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Last Login</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl border-2 border-white/5 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                                                <img src={user.avatar} alt={user.name} />
                                            </div>
                                            <div>
                                                <h5 className="text-[14px] font-bold text-white">{user.name}</h5>
                                                <p className="text-xs font-medium text-slate-500 mt-0.5">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-400">{user.role}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2">
                                            {user.permissions.map((p, i) => (
                                                <span key={i} className="text-[10px] font-black bg-white/5 text-slate-400 px-2 py-1 rounded-md uppercase tracking-tighter">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${user.status.includes('Active') ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'bg-rose-500'}`}></div>
                                            <span className={`text-[12px] font-bold capitalize ${user.status.includes('Active') ? 'text-teal-400' : 'text-rose-400'}`}>
                                                {user.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-[13px] text-slate-500 font-medium">{user.lastLogin}</td>
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

                <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <p className="text-sm font-semibold text-slate-500">
                        Showing <span className="text-white">1-10</span> of <span className="text-white">12,840</span> users
                    </p>
                    <div className="flex items-center gap-3">
                        <button className="h-10 px-5 rounded-2xl border border-white/5 text-slate-400 text-xs font-bold hover:bg-white/5 transition-all outline-none">Previous</button>
                        <button className="h-10 px-5 rounded-2xl bg-[#008080] text-white text-xs font-bold shadow-lg shadow-teal-900/20 hover:bg-[#005f5f] transition-all outline-none">Next</button>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-teal-900/40 to-slate-900 p-8 rounded-[32px] border border-[#008080]/20 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#008080]/20 rounded-2xl flex items-center justify-center border border-[#008080]/30 shadow-inner">
                        <ShieldCheck size={32} className="text-teal-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white font-outfit">Permission Integrity Check</h4>
                        <p className="text-slate-400 text-sm mt-1">All user permissions are synced across "Trademond" clusters. Last global audit performed 14 minutes ago. No anomalies detected.</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-[#008080] text-white rounded-2xl font-bold text-sm hover:shadow-teal-400/20 shadow-lg transition-all">
                    Run Manual Audit
                </button>
            </div>
        </div>
    );
};

export default Users;
