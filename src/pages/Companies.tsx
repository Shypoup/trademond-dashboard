import React from 'react';
import {
    Search,
    Plus,
    Filter,
    ChevronDown,
    MoreHorizontal,
    RotateCcw,
    Building2,
    MapPin,
    Globe,
    ShieldCheck,
    Clock,
    AlertCircle
} from 'lucide-react';
import { companyService } from '../services/companyService';
import { Company } from '../types/api';
import { displayBilingual, getStatusStyles, formatDate } from '../utils/ui';

const Companies = () => {
    const [loading, setLoading] = React.useState(true);
    const [companyList, setCompanyList] = React.useState<Company[]>([]);
    const [totalCompanies, setTotalCompanies] = React.useState(0);

    React.useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await companyService.getCompanies();
                if (response.data) {
                    setCompanyList(response.data);
                    setTotalCompanies(response.meta?.total || response.data.length);
                }
            } catch (error) {
                console.error('Error fetching companies:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold animate-pulse text-sm">Loading Company Directory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Company Management</h2>
                    <p className="text-slate-500 text-sm mt-1">{totalCompanies.toLocaleString()} verified companies on the platform</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-lg">
                    <Plus size={18} />
                    <span>Register Company</span>
                </button>
            </div>

            <div className="premium-card overflow-hidden bg-white">
                <div className="p-4 border-b border-slate-50 flex flex-wrap items-center gap-4 bg-slate-50/30">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute inset-y-0 left-4 flex items-center mt-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by company name, location..."
                            className="w-full h-11 pl-12 pr-4 bg-white border border-slate-200 focus:border-teal-400 rounded-xl text-sm outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {companyList.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                                                <img src={c.profilePhoto || `https://ui-avatars.com/api/?name=${displayBilingual(c.name)}&background=random`} alt={displayBilingual(c.name)} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h5 className="text-[14px] font-bold text-slate-800">{displayBilingual(c.name)}</h5>
                                                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold text-[10px]">{c.acronym || 'No Acronym'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                            <MapPin size={14} className="text-slate-400" />
                                            <span>{c.location || 'Distributed'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(c.active ? 'active' : 'inactive')}`}>
                                            {c.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-slate-500 font-medium">
                                        {formatDate(c.created_at)}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-slate-300 hover:text-slate-600 p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-all">
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
                        Showing <span className="text-slate-900 font-bold">1-10</span> of <span className="text-slate-900 font-bold">{totalCompanies.toLocaleString()}</span> companies
                    </p>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, '...', Math.ceil(totalCompanies / 10) || 1].map((page, idx) => (
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

export default Companies;
