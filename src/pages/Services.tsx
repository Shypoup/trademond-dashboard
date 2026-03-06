import React from 'react';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    X,
    Loader2,
    ChevronDown,
    MoreHorizontal
} from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { companyService } from '../services/companyService';
import { categoryService } from '../services/categoryService';
import { Service, Company, Category } from '../types/api';
import { displayBilingual, getStatusStyles } from '../utils/ui';

const Services = () => {
    const [loading, setLoading] = React.useState(true);
    const [serviceList, setServiceList] = React.useState<Service[]>([]);
    const [totalServices, setTotalServices] = React.useState(0);
    const [companies, setCompanies] = React.useState<Company[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | number | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: { en: '', ar: '' },
        description: { en: '', ar: '' },
        company_id: '',
        category_id: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [srvRes, compRes, catRes] = await Promise.all([
                serviceService.getServices(),
                companyService.getCompanies(),
                categoryService.getCategories()
            ]);

            if (srvRes.data) {
                setServiceList(srvRes.data);
                setTotalServices(srvRes.meta?.total || srvRes.data.length);
            }
            if (compRes.data) setCompanies(compRes.data);
            if (catRes.data) setCategories(catRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (service?: Service) => {
        if (service) {
            setEditingId(service.id);
            setFormData({
                name: typeof service.name === 'string' ? { en: service.name, ar: '' } : service.name,
                description: typeof service.description === 'string' ? { en: service.description, ar: '' } : (service.description || { en: '', ar: '' }),
                company_id: String(service.company_id || (service.company as any)?.id || ''),
                category_id: String(service.category_id || (service.category as any)?.id || '')
            });
        } else {
            setEditingId(null);
            setFormData({
                name: { en: '', ar: '' },
                description: { en: '', ar: '' },
                company_id: String(companies[0]?.id || ''),
                category_id: String(categories[0]?.id || '')
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await serviceService.deleteService(String(id));
            setServiceList(prev => prev.filter(s => s.id !== id));
            setTotalServices(prev => prev - 1);
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            if (editingId) {
                await serviceService.updateService(String(editingId), formData);
            } else {
                await serviceService.updateService('', formData);
            }
            await fetchData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save service');
        } finally {
            setFormSaving(false);
        }
    };

    const updateBilingual = (field: string, lang: 'en' | 'ar', val: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: { ...(prev[field] || {}), [lang]: val }
        }));
    };

    if (loading && serviceList.length === 0) {
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
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Services Management</h2>
                    <p className="text-slate-500 text-sm mt-1">{totalServices.toLocaleString()} registered services providing cross-border value</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-lg"
                >
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
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
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
                                                <img src={s.profilePhoto || `https://ui-avatars.com/api/?name=${displayBilingual(s.name)}&background=008080&color=fff`} alt={displayBilingual(s.name)} className="w-full h-full object-cover" />
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
                                    <td className="px-6 py-5 text-xs text-slate-600 font-medium">
                                        {s.category?.name ? displayBilingual(s.category.name) : (s as any).category || 'N/A'}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusStyles(s.published ? 'published' : 'draft')}`}>
                                            {s.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 pr-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleOpenModal(s)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {serviceList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No services found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
                    <p className="text-xs font-semibold text-slate-400">
                        Showing total <span className="text-slate-900 font-bold">{totalServices.toLocaleString()}</span> services
                    </p>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-slate-900">{editingId ? 'Edit Service' : 'Create New Service'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh]">
                            <div className="p-8 space-y-6 overflow-y-auto premium-scrollbar flex-1">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">English Name</label>
                                        <input required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none" value={formData.name.en} onChange={e => updateBilingual('name', 'en', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block">الإسم بالعربية</label>
                                        <input required dir="rtl" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none text-right" value={formData.name.ar} onChange={e => updateBilingual('name', 'ar', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                                        <div className="relative">
                                            <select required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-teal-500 transition-all" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                                <option value="">Select Category...</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{displayBilingual(c.name)}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Company</label>
                                        <div className="relative">
                                            <select required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-teal-500 transition-all" value={formData.company_id} onChange={e => setFormData({ ...formData, company_id: e.target.value })}>
                                                <option value="">Select Company...</option>
                                                {companies.map(c => <option key={c.id} value={c.id}>{displayBilingual(c.name)}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Description (EN)</label>
                                        <textarea className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none resize-none" value={formData.description.en} onChange={e => updateBilingual('description', 'en', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block">الوصف (عربي)</label>
                                        <textarea dir="rtl" className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none resize-none text-right" value={formData.description.ar} onChange={e => updateBilingual('description', 'ar', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-4 bg-slate-50">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-10 py-2.5 bg-teal-600 rounded-xl text-sm font-black text-white hover:bg-teal-700 transition-all flex items-center gap-2">
                                    {formSaving && <Loader2 className="animate-spin" size={16} />} Save Service
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
