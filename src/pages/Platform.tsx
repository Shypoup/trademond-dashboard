import React from 'react';
import {
    Users,
    Briefcase,
    Package,
    Wrench,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Activity,
    ShieldCheck,
    AlertCircle,
    MoreVertical,
    Plus,
    ArrowRight
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
    PieChart,
    Pie,
    Cell
} from 'recharts';

const mainStats = [
    { label: 'Total Users', value: '1,248,392', change: '+12.4%', color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Active Users', value: '842,102', change: '+5.2%', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Companies', value: '45,210', change: '+8.1%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Companies', value: '32,104', change: '+3.2%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const secondaryStats = [
    { label: 'Total Products', value: '8,421,300', badge: '8.4M Items', sub: 'Inventory growth: 15% WoW' },
    { label: 'Pending Products', value: '1,240', urgentIcon: true, sub: 'Est. processing: 4.2 hours' },
    { label: 'Total Services', value: '1,102,450', badge: '1.1M Listed', sub: 'Service velocity: 10% WoW' },
    { label: 'Pending Services', value: '430', urgentIcon: true, sub: 'Est. processing: 2.1 hours' },
];

const revenueStats = [
    { label: 'Monthly Revenue', value: '$4,281,400', change: '+22%', target: 'Target: $5,000,000 (85%)' },
    { label: 'Active Subscriptions', value: '12,450', change: '+442', target: 'Premium Tier: 82%' },
    { label: 'New Signups (30D)', value: '15,240', change: '+15%', target: 'Avg CPC: $0.42' },
    { label: 'Churn Rate', value: '1.84%', change: '+0.4%', target: 'Benchmark: 2.50%', neg: true },
];

const signupHistory = [
    { name: 'Mon', value: 300 },
    { name: 'Tue', value: 450 },
    { name: 'Wed', value: 200 },
    { name: 'Thu', value: 500 },
    { name: 'Fri', value: 900 },
    { name: 'Sat', value: 400 },
    { name: 'Sun', value: 450 },
];

const roleData = [
    { name: 'Buyers', value: 873874, color: '#008080' },
    { name: 'Sellers', value: 374518, color: '#e2e8f0' },
    { name: 'Admins', value: 2410, color: '#0f172a' },
];

const revenueForecast = [
    { name: 'Jan', actual: 3000, predicted: 3200 },
    { name: 'Feb', actual: 4000, predicted: 4200 },
    { name: 'Mar', actual: 3500, predicted: 3800 },
    { name: 'Apr', actual: 5000, predicted: 5500 },
    { name: 'May', actual: 7000, predicted: 7500 },
];

import { platformService } from '../services/platformService';
import { PlatformStats } from '../types/api';

const Platform = () => {
    const [loading, setLoading] = React.useState(true);
    const [platformData, setPlatformData] = React.useState<PlatformStats | null>(null);

    React.useEffect(() => {
        const fetchPlatformData = async () => {
            try {
                const data = await platformService.getOverviewStats();
                setPlatformData(data);
            } catch (error) {
                console.error('Error fetching platform data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlatformData();
    }, []);

    const dynamicMainStats = [
        { label: 'Total Users', value: platformData?.total_users.toLocaleString() || '1,248,392', change: `+${platformData?.growth.users}%`, color: 'text-teal-600', bg: 'bg-teal-50' },
        { label: 'Active Users', value: platformData?.active_users.toLocaleString() || '842,102', change: '+5.2%', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Companies', value: platformData?.total_companies.toLocaleString() || '45,210', change: '+8.1%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Active Companies', value: '32,104', change: '+3.2%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold animate-pulse text-sm">Querying Platform Metrics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Platform Overview</h2>
                    <p className="text-slate-500 text-sm mt-1">Enterprise marketplace status and global system performance monitor.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 px-4 py-2.5 rounded-xl">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
                        <span className="text-[11px] font-bold text-slate-600 uppercase">Production Environment</span>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-lg">
                        <Plus size={18} />
                        <span>Create Announcement</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dynamicMainStats.map((stat, idx) => (
                    <div key={idx} className="premium-card p-6 border-b-4 border-slate-100 hover:border-teal-500 transition-all group">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{stat.label}</p>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mt-2 font-outfit tracking-tight">{stat.value}</h3>
                        <div className={`h-1 w-full rounded-full bg-slate-100 mt-4 overflow-hidden`}>
                            <div className={`h-full ${stat.bg.replace('bg-', 'bg-').split('-')[0] === 'bg-teal' ? 'bg-teal-500' : 'bg-slate-400'} transition-all duration-1000 w-[60%] group-hover:w-[80%]`}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {secondaryStats.map((stat, idx) => (
                    <div key={idx} className="premium-card p-6 group hover:translate-y-[-4px] transition-all">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">{stat.label}</p>
                            {stat.badge && (
                                <span className="text-[9px] font-bold bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded uppercase">{stat.badge}</span>
                            )}
                            {stat.urgentIcon && (
                                <AlertCircle size={16} className="text-amber-500" />
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mt-2 font-outfit">{stat.value}</h3>
                        <p className="text-[11px] text-slate-400 mt-1 font-medium">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {revenueStats.map((stat, idx) => (
                    <div key={idx} className="premium-card p-6 bg-gradient-to-br from-white to-slate-50/10">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-none">{stat.label}</p>
                            <span className={`text-[11px] font-bold ${stat.neg ? 'text-rose-500' : 'text-teal-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mt-3 font-outfit">{stat.value}</h3>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.target}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="premium-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-bold text-slate-800 text-[14px]">User Signups</h4>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">Last 7 Days</span>
                        </div>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={signupHistory}>
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {signupHistory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 4 ? '#008080' : '#e2e8f0'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="premium-card p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-bold text-slate-800 text-[14px]">Listings Added</h4>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">Last 7 Days</span>
                        </div>
                        <div className="h-48 -mx-6 -mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={signupHistory}>
                                    <Area type="monotone" dataKey="value" stroke="#008080" strokeWidth={3} fill="#0d948810" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 premium-card p-8 flex flex-col items-center">
                    <h4 className="font-bold text-slate-800 w-full mb-8">User Role Distribution</h4>
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {roleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-slate-800 font-outfit">70%</span>
                            <span className="text-xs font-bold text-slate-400 uppercase">Buyers</span>
                        </div>
                    </div>
                    <div className="w-full mt-8 space-y-3">
                        {roleData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-800 font-outfit">{item.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1 premium-card p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="font-bold text-slate-800">Revenue Forecast (USD)</h4>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div><span className="text-[10px] font-bold text-slate-400">Actual</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div><span className="text-[10px] font-bold text-slate-400">Predicted</span></div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-end gap-1">
                        <div className="h-full flex items-end gap-4 px-4 overflow-hidden relative">
                            {revenueForecast.map((item, idx) => (
                                <div key={idx} className="flex-1 flex items-end gap-1 h-full">
                                    <div className="w-full bg-[#00808015] rounded-t-lg transition-all hover:bg-[#00808025]" style={{ height: `${(item.actual / 7500) * 100}%` }}></div>
                                    <div className="w-full bg-[#e2e8f080] rounded-t-lg border-t border-x border-slate-200 border-dashed" style={{ height: `${(item.predicted / 7500) * 100}%` }}></div>
                                </div>
                            ))}
                            {/* Horizontal grid lines */}
                            <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between pointer-events-none opacity-20">
                                {[1, 2, 3, 4].map(l => <div key={l} className="border-t border-slate-400 w-full dashed"></div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="premium-card flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-teal-50 rounded-lg text-teal-600"><ShieldCheck size={18} /></div>
                            <h4 className="font-bold text-slate-800">Pending Approvals</h4>
                        </div>
                        <button className="text-[11px] font-bold text-teal-600 uppercase">View All</button>
                    </div>
                    <div className="p-6 space-y-4">
                        {[
                            { label: 'New Companies', count: 42 },
                            { label: 'Product Listings', count: 1240 },
                            { label: 'Service Listings', count: 430 },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-all cursor-pointer">
                                <span className="text-[13px] font-bold text-slate-600">{item.label}</span>
                                <span className="bg-teal-50 text-teal-600 text-[11px] font-black px-2 py-0.5 rounded-full min-w-[32px] text-center">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="premium-card flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600"><AlertCircle size={18} /></div>
                            <h4 className="font-bold text-slate-800">Flagged Content</h4>
                        </div>
                        <button className="text-[11px] font-bold text-teal-600 uppercase">Review All</button>
                    </div>
                    <div className="p-6 space-y-6">
                        {[
                            { title: 'Copyright Infringement', desc: 'Listed by TechGlobal Inc.', time: '2m ago' },
                            { title: 'Restricted Item Policy', desc: 'Chemical Compound ID: 292', time: '14m ago' },
                            { title: 'Inappropriate Review Content', desc: 'User ID: 8829-X', time: '1h ago' },
                        ].map((report, idx) => (
                            <div key={idx} className="flex gap-4 group cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center border border-rose-100 group-hover:bg-rose-100 transition-colors">
                                    <AlertCircle size={16} className="text-rose-600" />
                                </div>
                                <div className="flex-1 border-b border-slate-50 pb-4">
                                    <div className="flex justify-between">
                                        <h5 className="text-[13px] font-bold text-slate-800">{report.title}</h5>
                                        <span className="text-[10px] text-slate-400">{report.time}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{report.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="premium-card p-6 flex flex-col bg-slate-900 border-slate-800">
                    <div className="flex items-center gap-2 text-rose-500 mb-6">
                        <AlertCircle size={20} className="animate-pulse" />
                        <h4 className="font-bold uppercase tracking-[0.2em] text-[11px]">Critical Tickets</h4>
                        <span className="ml-auto text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded uppercase">Urgent</span>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                            <div className="flex justify-between">
                                <h5 className="text-white text-xs font-bold">Payment Failure: #TK-2902</h5>
                                <span className="text-[10px] text-rose-400 font-bold">Priority S1</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2">Global payment gateway 'B' reporting 404 errors on checkout.</p>
                        </div>

                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                            <div className="flex justify-between">
                                <h5 className="text-white text-xs font-bold">Sync Delay: #TK-2910</h5>
                                <span className="text-[10px] text-amber-400 font-bold">Priority S2</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2">Catalog sync with AWS S3 experiencing 300ms increased latency.</p>
                        </div>
                    </div>

                    <button className="w-full mt-6 py-3 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                        <span>Open Command Center</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Platform;
