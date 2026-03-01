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
import { productService } from '../services/productService';
import { Product } from '../types/api';
import { displayBilingual, formatCurrency, getStatusStyles } from '../utils/ui';

const Products = () => {
    const [loading, setLoading] = React.useState(true);
    const [productList, setProductList] = React.useState<Product[]>([]);
    const [totalProducts, setTotalProducts] = React.useState(0);

    React.useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productService.getProducts();
                if (response.data) {
                    setProductList(response.data);
                    setTotalProducts(response.meta?.total || response.data.length);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold animate-pulse text-sm">Loading Product Catalog...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Products Management</h2>
                    <p className="text-slate-500 text-sm mt-1">{totalProducts.toLocaleString()} total products registered in the platform</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-lg hover:shadow-teal-100">
                    <Plus size={18} />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="premium-card overflow-hidden bg-white">
                <div className="p-4 border-b border-slate-50 flex flex-wrap items-center gap-4 bg-slate-50/30">
                    <div className="flex-1 min-w-[300px] relative group">
                        <Search className="absolute inset-y-0 left-4 flex items-center mt-3 text-slate-400 group-focus-within:text-teal-500 transition-colors pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Filter by product name, SKU..."
                            className="w-full h-11 pl-12 pr-4 bg-white border border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-50 rounded-xl text-sm transition-all outline-none"
                        />
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
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {productList.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5 text-center">
                                        <input type="checkbox" className="rounded-md border-slate-300 text-teal-600 focus:ring-teal-500" />
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 relative group-hover:scale-105 transition-transform duration-300">
                                                <img src={(p as any).image || p.profilePhoto || ""} alt={displayBilingual(p.name)} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h5 className="text-[14px] font-bold text-slate-800">{displayBilingual(p.name)}</h5>
                                                    {p.premium && (
                                                        <span className="text-[9px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">Premium</span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-medium text-slate-400 mt-0.5">SKU: {p.sku || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-bold text-teal-600 hover:underline cursor-pointer">
                                            {p.company?.name ? displayBilingual(p.company.name) : (p as any).company || "N/A"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-slate-600 font-medium">
                                        {p.category?.name ? displayBilingual(p.category.name) : (p as any).category || "N/A"}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(p.status || 'pending')}`}>
                                            {p.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-slate-600 font-bold text-right">{p.views || 0}</td>
                                    <td className="px-6 py-5 text-xs text-slate-900 font-bold text-right">{formatCurrency(p.price)}</td>
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
                        Showing <span className="text-slate-900 font-bold">1-10</span> of <span className="text-slate-900 font-bold">{totalProducts.toLocaleString()}</span> products
                    </p>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, '...', Math.ceil(totalProducts / 10) || 1].map((page, idx) => (
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
