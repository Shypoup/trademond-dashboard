import React from 'react';
import {
    Users,
    UserCheck,
    Briefcase,
    Clock,
    Package,
    Wrench,
    DollarSign,
    ArrowUpRight,
    TrendingUp,
    ExternalLink,
    MoreVertical,
    ShieldAlert,
    Ticket
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const stats = [
    { label: 'Total Users', value: '12,840', change: '+12.5%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Users', value: '11,200', change: '+5.2%', icon: UserCheck, color: 'text-teal-500', bg: 'bg-teal-50' },
    { label: 'Total Companies', value: '3,450', icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Pending Approvals', value: '42', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', urgent: true },
    { label: 'Total Products', value: '45,200', icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Pending Products', value: '128', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Total Services', value: '12,400', icon: Wrench, color: 'text-pink-500', bg: 'bg-pink-50' },
    { label: 'Revenue', value: '$245,000', change: '+8.2%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const signupData = [
    { name: 'Week 1', value: 400 },
    { name: 'Week 2', value: 300 },
    { name: 'Week 3', value: 600 },
    { name: 'Week 4', value: 450 },
    { name: 'Week 5', value: 800 },
];

const listingData = [
    { name: 'Mon', value: 45 },
    { name: 'Tue', value: 75 },
    { name: 'Wed', value: 30 },
    { name: 'Thu', value: 55 },
    { name: 'Fri', value: 40 },
    { name: 'Sat', value: 65 },
];

const approvals = [
    { name: 'Nexus Logistics', type: 'COMPANY VERIFICATION', status: 'New', time: 'Just now' },
    { name: 'Solar Panel Pro V3', type: 'PRODUCT LISTING', status: '2h ago', time: 'Urgent' },
    { name: 'Global Trade Inc.', type: 'ADDRESS UPDATE', status: 'Pending', time: 'Yesterday' },
    { name: 'Astra Zen Limited', type: 'NEW SERVICE', status: 'New', time: 'Just now' },
];

const Dashboard = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Admin Overview</h2>
                    <p className="text-slate-500 text-sm mt-1">Platform metrics and health snapshot for today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                        <Clock size={16} />
                        <span>Last 30 Days</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-md">
                        <ExternalLink size={16} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="premium-card p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                                <stat.icon size={22} />
                            </div>
                            {stat.change && (
                                <div className="flex items-center gap-0.5 text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold">
                                    <TrendingUp size={12} />
                                    <span>{stat.change}</span>
                                </div>
                            )}
                            {stat.urgent && (
                                <div className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    Requires Action
                                </div>
                            )}
                        </div>
                        <div className="mt-4">
                            <p className="text-slate-500 text-[13px] font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-outfit">{stat.value}</h3>
                        </div>
                        {/* Subtle background decoration */}
                        <div className="absolute -right-2 -bottom-2 text-slate-50/50">
                            <stat.icon size={80} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="premium-card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="font-bold text-slate-800">User Signups Trend</h4>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                            <span className="text-xs font-semibold text-slate-500">This Month</span>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={signupData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#008080" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#008080" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#008080" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="premium-card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="font-bold text-slate-800">Listings Added Trend</h4>
                        <select className="bg-slate-50 text-[11px] font-bold text-slate-500 border-none outline-none pr-6 rounded-lg uppercase tracking-wider">
                            <option>Last 4 Weeks</option>
                        </select>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={listingData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {listingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 1 || index === 3 ? '#008080' : '#cbd5e1'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="premium-card flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h4 className="font-bold text-slate-800">Pending Approvals</h4>
                        <button className="text-[11px] font-bold text-teal-600 uppercase hover:underline">View All</button>
                    </div>
                    <div className="p-6 space-y-6 flex-1">
                        {approvals.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                    {item.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-[13px] font-bold text-slate-800 truncate">{item.name}</h5>
                                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">{item.type}</p>
                                </div>
                                <div className={item.status === 'New' ? 'bg-amber-50 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-bold' : 'text-slate-400 text-[10px] font-semibold'}>
                                    {item.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="premium-card flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800">Recent Reports</h4>
                            <span className="bg-rose-50 text-rose-500 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <div className="w-1 h-1 bg-rose-500 rounded-full"></div>
                                Urgent
                            </span>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="p-4 bg-rose-50/30 border border-rose-100 rounded-2xl relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div className="bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-tighter px-1.5 rounded block">High Priority</div>
                                <span className="text-[10px] text-rose-500 font-bold">Flagged User</span>
                            </div>
                            <h5 className="font-bold text-slate-800 mt-2">User @JohnDoe22 reported for spam</h5>
                            <p className="text-[11px] text-slate-500 mt-1">Reported by 3 unique companies in 24h.</p>
                            <div className="flex gap-2 mt-4">
                                <button className="flex-1 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors">Suspend</button>
                                <button className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">Dismiss</button>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl group hover:border-teal-200 transition-colors cursor-pointer">
                            <h5 className="font-bold text-slate-800 text-[13px]">Counterfeit product claim #9021</h5>
                            <p className="text-[11px] text-slate-400 mt-1 italic">Listing: "Original Designer Watch Luxury"</p>
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-[10px] text-slate-400">Sent to moderation 1h ago</span>
                                <ArrowUpRight size={14} className="text-slate-300 group-hover:text-teal-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="premium-card flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h4 className="font-bold text-slate-800">Support Tickets</h4>
                        <span className="bg-teal-50 text-teal-600 text-[10px] font-bold px-2 py-0.5 rounded-md">12 Active</span>
                    </div>
                    <div className="p-6 space-y-6">
                        {[
                            { name: 'Sarah Williams', msg: "Can't login to dashboard", time: '12:45 PM', avatar: 'https://ui-avatars.com/api/?name=SW&background=60a5fa&color=fff' },
                            { name: 'Mark Thompson', msg: 'Refund request #3391', time: '11:20 AM', avatar: 'https://ui-avatars.com/api/?name=MT&background=818cf8&color=fff' },
                            { name: 'Linda Chen', msg: 'Question about subsc...', time: '09:05 AM', avatar: 'https://ui-avatars.com/api/?name=LC&background=f472b6&color=fff' },
                        ].map((ticket, idx) => (
                            <div key={idx} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-xl transition-colors">
                                <div className="w-10 h-10 rounded-full border border-slate-100 overflow-hidden">
                                    <img src={ticket.avatar} alt={ticket.name} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between">
                                        <h5 className="text-[13px] font-bold text-slate-800">{ticket.name}</h5>
                                        <span className="text-[10px] text-slate-400">{ticket.time}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5 italic">{ticket.msg}</p>
                                </div>
                            </div>
                        ))}
                        <button className="w-full mt-4 py-2.5 border border-teal-100 text-teal-600 rounded-xl text-xs font-bold hover:bg-teal-50 transition-all uppercase tracking-wide">
                            View Support Inbox
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
