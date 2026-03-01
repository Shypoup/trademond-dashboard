import React from 'react';
import {
    Search,
    Plus,
    Filter,
    ChevronDown,
    MoreHorizontal,
    RotateCcw,
    Eye,
    Edit,
    Trash2,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    TrendingUp,
    ShieldAlert
} from 'lucide-react';

const products = [
    {
        id: 1,
        name: 'UltraCore Industrial Drill',
        sku: 'TRD-9920-X1',
        company: 'Apex Tools Ltd.',
        category: 'Power Tools',
        status: 'Approved',
        views: '4,281',
        price: '$299.00',
        updated: '2 hrs ago',
        premium: true,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100&h=100&fit=crop'
    },
    {
        id: 2,
        name: 'Organic Cotton Tee Pack',
        sku: 'TX-CLO-002',
        company: 'EcoThreads Global',
        category: 'Apparel',
        status: 'Pending',
        views: '152',
        price: '$45.00',
        updated: '5 hrs ago',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop'
    },
    {
        id: 3,
        name: 'VisionPro 27" LED Monitor',
        sku: 'EL-MON-V27',
        company: 'Zeta Electronics',
        category: 'Electronics',
        status: 'Rejected',
        views: '920',
        price: '$349.99',
        updated: '1 day ago',
        premium: true,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&h=100&fit=crop'
    },
    {
        id: 4,
        name: 'Hydraulic Floor Jack 3T',
        sku: 'AU-JACK-3000',
        company: 'Apex Tools Ltd.',
        category: 'Automotive',
        status: 'Suspended',
        views: '1,024',
        price: '$89.00',
        updated: '3 days ago',
        image: 'https://images.unsplash.com/photo-1517524008436-bbdb45724213?w=100&h=100&fit=crop'
    },
];

const statusStyles: Record<string, string> = {
    Approved: 'bg-emerald-50 text-emerald-600',
    Pending: 'bg-amber-50 text-amber-600',
    Rejected: 'bg-rose-50 text-rose-600',
    Suspended: 'bg-slate-100 text-slate-500',
};

const Products = () => {
    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Products Management</h2>
                    <p className="text-slate-500 text-sm mt-1">12,450 total products registered in the platform</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-lg hover:shadow-teal-100">
                    <Plus size={18} />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="premium-card overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex flex-wrap items-center gap-4 bg-slate-50/30">
                    <div className="flex-1 min-w-[300px] relative group">
                        <Search className="absolute inset-y-0 left-4 flex items-center mt-3 text-slate-400 group-focus-within:text-teal-500 transition-colors pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Filter by product name, SKU..."
                            className="w-full h-11 pl-12 pr-4 bg-white border border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-50 rounded-xl text-sm transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {['Category', 'Status', 'Company'].map((filter) => (
                            <button key={filter} className="h-11 px-4 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors">
                                <span>{filter}</span>
                                <ChevronDown size={14} className="text-slate-400" />
                            </button>
                        ))}
                        <button className="h-11 px-3 border border-slate-200 bg-white rounded-xl text-slate-400 hover:bg-slate-50 transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <button className="h-10 px-4 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors">
                            <span>Bulk Actions</span>
                            <ChevronDown size={14} className="text-slate-400" />
                        </button>
                        <button className="h-10 w-10 border border-slate-200 bg-white rounded-xl text-slate-400 flex items-center justify-center hover:bg-slate-50 transition-colors">
                            <RotateCcw size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-12 text-center">
                                    <input type="checkbox" className="rounded-md border-slate-300 text-teal-600 focus:ring-teal-500" />
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Views</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Price</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Updated</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5 text-center">
                                        <input type="checkbox" className="rounded-md border-slate-300 text-teal-600 focus:ring-teal-500" />
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 relative group-hover:scale-105 transition-transform duration-300">
                                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h5 className="text-[14px] font-bold text-slate-800">{p.name}</h5>
                                                    {p.premium && (
                                                        <span className="text-[9px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">Premium</span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-medium text-slate-400 mt-0.5">SKU: {p.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-bold text-teal-600 hover:underline cursor-pointer">{p.company}</span>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-slate-600 font-medium">{p.category}</td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[p.status]}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-slate-600 font-bold text-right">{p.views}</td>
                                    <td className="px-6 py-5 text-xs text-slate-900 font-bold text-right">{p.price}</td>
                                    <td className="px-6 py-5 text-xs text-slate-400 font-medium text-right">{p.updated}</td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-slate-300 hover:text-slate-600 transition-colors p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-100">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
                    <p className="text-xs font-semibold text-slate-400">
                        Showing <span className="text-slate-900">1-10</span> of <span className="text-slate-900">12,450</span> products
                    </p>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, '...', 1245].map((page, idx) => (
                            <button
                                key={idx}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === 1 ? 'bg-teal-600 text-white shadow-md shadow-teal-100' : 'text-slate-500 hover:bg-white hover:border border border-transparent hover:border-slate-200'}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card p-6 border-l-4 border-teal-500 bg-gradient-to-br from-white to-teal-50/20">
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-teal-50 rounded-xl text-teal-600"><Eye size={22} /></div>
                        <div className="text-[11px] font-bold text-teal-600 bg-teal-50/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <TrendingUp size={12} />
                            <span>+12%</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-slate-500 text-[13px] font-medium uppercase tracking-wider">Global Views</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1 font-outfit">1.2M</h3>
                    </div>
                </div>

                <div className="premium-card p-6 border-l-4 border-amber-500 bg-gradient-to-br from-white to-amber-50/20">
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 w-fit"><Clock size={22} /></div>
                    <div className="mt-4">
                        <p className="text-slate-500 text-[13px] font-medium uppercase tracking-wider">Pending Review</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1 font-outfit">428</h3>
                    </div>
                </div>

                <div className="premium-card p-6 border-l-4 border-rose-500 bg-gradient-to-br from-white to-rose-50/20">
                    <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 w-fit"><ShieldAlert size={22} /></div>
                    <div className="mt-4">
                        <p className="text-slate-500 text-[13px] font-medium uppercase tracking-wider">Suspended</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1 font-outfit">24</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
