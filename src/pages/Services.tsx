import React from 'react';
import {
    Search,
    Plus,
    Filter,
    ChevronDown,
    MoreHorizontal,
    Wrench,
    Store,
    LayoutDashboard,
    Clock,
    XCircle,
    CheckCircle2,
    ShieldAlert
} from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { Service } from '../types/api';
import { displayBilingual, getStatusStyles } from '../utils/ui';

const Services = () => {
    const [loading, setLoading] = React.useState(true);
    const [serviceList, setServiceList] = React.useState<Service[]>([]);
    const [totalServices, setTotalServices] = React.useState(0);

    React.useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await serviceService.getServices();
                if (response.data) {
                    setServiceList(response.data);
                    setTotalServices(response.meta?.total || response.data.length);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold animate-pulse text-sm">Querying Global Services...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Services Management</h2>
                    <p className="text-slate-500 text-sm mt-1">{totalServices.toLocaleString()} registered services providing cross-border value</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-lg">
                    <Plus size={18} />
                    <span>Create Service</span>
                </button>
            </div>

            <div className="premium-card overflow-hidden bg-white">
                <div className="p-4 border-b border-slate-50 flex flex-wrap items-center gap-4 bg-slate-50/30">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute inset-y-0 left-4 flex items-center mt-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Filter by service name, company..."
                            className="w-full h-11 pl-12 pr-4 bg-white border border-slate-200 focus:border-teal-400 rounded-xl text-sm outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company Provider</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tags</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {serviceList.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                                                <img src={s.profilePhoto || `https://ui-avatars.com/api/?name=${displayBilingual(s.name)}&background=random`} alt={displayBilingual(s.name)} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h5 className="text-[14px] font-bold text-slate-800">{displayBilingual(s.name)}</h5>
                                                <p className="text-xs text-slate-400 truncate max-w-[200px]">{displayBilingual(s.description)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-bold text-teal-600 hover:underline cursor-pointer">
                                            {s.company?.name ? displayBilingual(s.company.name) : (s as any).company || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex gap-2 flex-wrap">
                                            {s.tags?.slice(0, 2).map((tag, i) => (
                                                <span key={i} className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-md uppercase tracking-tighter">
                                                    {displayBilingual(tag.name)}
                                                </span>
                                            ))}
                                            {(s.tags?.length || 0) > 2 && (
                                                <span className="text-[10px] bg-teal-50 text-teal-600 font-bold px-2 py-1 rounded-md uppercase tracking-tighter">
                                                    +{(s.tags?.length || 0) - 2}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusStyles(s.published ? 'published' : 'draft')}`}>
                                            {s.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-slate-300 hover:text-slate-600 p-2 border border-transparent hover:border-slate-100 rounded-lg transition-all">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
                    <p className="text-xs font-semibold text-slate-400">
                        Showing <span className="text-slate-900 font-bold">1-10</span> of <span className="text-slate-900 font-bold">{totalServices.toLocaleString()}</span> services
                    </p>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, '...', Math.ceil(totalServices / 10) || 1].map((page, idx) => (
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
        </div>
    );
};

export default Services;
