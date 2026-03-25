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
import { COLORS } from '@utils/core/colors';

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

import { platformService } from '@services/platformService';
import { PlatformStats } from '@data-types/api';

const Dashboard = () => {
    const [loading, setLoading] = React.useState(true);
    const [platformData, setPlatformData] = React.useState<PlatformStats | null>(null);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await platformService.getOverviewStats();
                setPlatformData(data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const dynamicStats = [
        { label: 'Total Users', value: platformData?.total_users.toLocaleString() || '12,840', change: `+${platformData?.growth.users}%`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Active Users', value: platformData?.active_users.toLocaleString() || '11,200', change: '+5.2%', icon: UserCheck, color: 'text-teal-500', bg: 'bg-teal-50' },
        { label: 'Total Companies', value: platformData?.total_companies.toLocaleString() || '3,450', icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'Pending Approvals', value: platformData?.pending_approvals.toLocaleString() || '42', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', urgent: true },
        { label: 'Total Products', value: platformData?.total_products.toLocaleString() || '45,200', icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'Pending Products', value: '128', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Total Services', value: platformData?.total_services != null ? platformData.total_services.toLocaleString() : '12,400', icon: Wrench, color: 'text-pink-500', bg: 'bg-pink-50' },
        { label: 'Revenue', value: platformData ? `$${platformData.revenue.toLocaleString()}` : '$245,000', change: `+${platformData?.growth.revenue}%`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-muted-foreground animate-pulse">Synchronizing Platform Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">Admin Overview</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Platform metrics and health snapshot for today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-muted">
                        <Clock size={16} />
                        <span>Last 30 Days</span>
                    </button>
                    <button type="button" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90">
                        <ExternalLink size={16} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dynamicStats.map((stat, idx) => (
                    <div key={idx} className="premium-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex justify-between items-start">
                            <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl group-hover:scale-110 transition-transform`}>
                                <stat.icon size={22} />
                            </div>
                            {stat.change && (
                                <div className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                    <TrendingUp size={12} />
                                    <span>{stat.change}</span>
                                </div>
                            )}
                            {stat.urgent && (
                                <div className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                    Requires Action
                                </div>
                            )}
                        </div>
                        <div className="mt-4">
                            <p className="text-[13px] font-medium text-muted-foreground">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1 font-outfit">{stat.value}</h3>
                        </div>
                        {/* Subtle background decoration */}
                        <div className="absolute -right-2 -bottom-2 text-muted-foreground/5 transition-colors group-hover:text-primary/10">
                            <stat.icon size={80} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="premium-card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="font-bold text-foreground">User Signups Trend</h4>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                            <span className="text-xs font-semibold text-muted-foreground">This Month</span>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={signupData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.brandCyan} stopOpacity={0.1} />
                                        <stop offset="95%" stopColor={COLORS.brandCyan} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="value" stroke={COLORS.brandCyan} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="premium-card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="font-bold text-foreground">Listings Added Trend</h4>
                        <select className="rounded-lg border-none bg-muted/50 pr-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground outline-none">
                            <option>Last 4 Weeks</option>
                        </select>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={listingData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'var(--color-muted)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {listingData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === 1 || index === 3 ? COLORS.brandCyan : 'var(--color-muted)'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="premium-card flex flex-col">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h4 className="font-bold text-foreground">Pending Approvals</h4>
                        <button className="text-[11px] font-bold text-teal-600 uppercase hover:underline">View All</button>
                    </div>
                    <div className="p-6 space-y-6 flex-1">
                        {approvals.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-bold text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                    {item.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-[13px] font-bold text-foreground truncate">{item.name}</h5>
                                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{item.type}</p>
                                </div>
                                <div
                                    className={
                                        item.status === 'New'
                                            ? 'rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                            : 'text-[10px] font-semibold text-muted-foreground'
                                    }
                                >
                                    {item.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="premium-card flex flex-col">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground">Recent Reports</h4>
                            <span className="flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                                <div className="w-1 h-1 bg-rose-500 rounded-full"></div>
                                Urgent
                            </span>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="relative overflow-hidden rounded-2xl border border-rose-200/80 bg-rose-50/30 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
                            <div className="flex items-start justify-between">
                                <div className="block rounded bg-rose-50 px-1.5 text-[9px] font-black uppercase tracking-tighter text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                    High Priority
                                </div>
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">Flagged User</span>
                            </div>
                            <h5 className="font-bold text-foreground mt-2">User @JohnDoe22 reported for spam</h5>
                            <p className="mt-1 text-[11px] text-muted-foreground">Reported by 3 unique companies in 24h.</p>
                            <div className="flex gap-2 mt-4">
                                <button className="flex-1 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors">Suspend</button>
                                <button className="flex-1 rounded-lg border border-border bg-card py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-muted">Dismiss</button>
                            </div>
                        </div>

                        <div className="group cursor-pointer rounded-2xl border border-border bg-muted/40 p-4 transition-colors hover:border-primary/30">
                            <h5 className="text-[13px] font-bold text-foreground">Counterfeit product claim #9021</h5>
                            <p className="mt-1 text-[11px] italic text-muted-foreground">Listing: "Original Designer Watch Luxury"</p>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">Sent to moderation 1h ago</span>
                                <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="premium-card flex flex-col">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h4 className="font-bold text-foreground">Support Tickets</h4>
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">12 Active</span>
                    </div>
                    <div className="p-6 space-y-6">
                        {[
                            { name: 'Sarah Williams', msg: "Can't login to dashboard", time: '12:45 PM', avatar: 'https://ui-avatars.com/api/?name=SW&background=60a5fa&color=fff' },
                            { name: 'Mark Thompson', msg: 'Refund request #3391', time: '11:20 AM', avatar: 'https://ui-avatars.com/api/?name=MT&background=818cf8&color=fff' },
                            { name: 'Linda Chen', msg: 'Question about subsc...', time: '09:05 AM', avatar: 'https://ui-avatars.com/api/?name=LC&background=f472b6&color=fff' },
                        ].map((ticket, idx) => (
                            <div key={idx} className="group -m-2 flex cursor-pointer items-center gap-4 rounded-xl p-2 transition-colors hover:bg-muted/50">
                                <div className="h-10 w-10 overflow-hidden rounded-full border border-border">
                                    <img src={ticket.avatar} alt={ticket.name} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between">
                                        <h5 className="text-[13px] font-bold text-foreground">{ticket.name}</h5>
                                        <span className="text-[10px] text-muted-foreground">{ticket.time}</span>
                                    </div>
                                    <p className="mt-0.5 truncate text-[11px] italic text-muted-foreground">{ticket.msg}</p>
                                </div>
                            </div>
                        ))}
                        <button className="mt-4 w-full rounded-xl border border-border py-2.5 text-xs font-bold uppercase tracking-wide text-primary transition-all hover:bg-muted">
                            View Support Inbox
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
