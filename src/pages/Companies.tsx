import React from 'react';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Building2,
    MapPin,
    Globe,
    ShieldCheck,
    Clock,
    AlertCircle,
    X,
    Loader2,
    Tag as TagIcon
} from 'lucide-react';
import { companyService } from '../services/companyService';
import { tagService } from '../services/tagService';
import { Company, Tag } from '../types/api';
import { displayBilingual, getStatusStyles, formatDate } from '../utils/ui';

/**
 * Normalizes a company record coming from either a flat or json:api-style payload.
 *
 * Supports:
 * - Legacy flat `Company` objects.
 * - New payloads where data lives under `attributes` and related info under `relationships`.
 */
const getCompanyData = (item: any) => {
    const c = item as any;
    const attrs = c.attributes || c;
    const rels = c.relationships || {};

    return {
        id: c.id,
        name: attrs.name || c.name || { en: '', ar: '' },
        handle: attrs.handle || c.handle || '',
        acronym: attrs.acronym || c.acronym || '',
        slogan: attrs.slogan || c.slogan || { en: '', ar: '' },
        profilePhoto: attrs.profilePhoto || attrs.profile_photo || c.profilePhoto || '',
        active: attrs.active !== undefined ? attrs.active : (c.active !== undefined ? c.active : true),
        published: attrs.published !== undefined ? attrs.published : (c.published !== undefined ? c.published : true),
        searchable: attrs.searchable !== undefined ? attrs.searchable : (c.searchable !== undefined ? c.searchable : true),
        verified: attrs.verified !== undefined ? attrs.verified : (c.verified !== undefined ? c.verified : false),
        createdAt: attrs.createdAt || attrs.created_at || c.created_at || '',
        location: rels.primaryCountry?.name || c.location || '',
        industryId: rels.industry?.id || c.industry_id || '',
        industryName: rels.industry?.name || '',
        ownerId: rels.owner?.id || c.owner_id || '',
        ownerName: rels.owner?.name || '',
        ownerEmail: rels.owner?.email || '',
        ranking: attrs.ranking ?? c.ranking ?? null,
        established: attrs.established ?? c.established ?? null,
        expertiseIds: Array.isArray(rels.expertises) ? rels.expertises.map((e: any) => String(e.id)) : (c.expertise_ids || []),
    };
};

const Companies = () => {
    const [loading, setLoading] = React.useState(true);
    const [companyList, setCompanyList] = React.useState<Company[]>([]);
    const [totalCompanies, setTotalCompanies] = React.useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | number | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: { en: '', ar: '' },
        slogan: { en: '', ar: '' },
        location: '',
        acronym: '',
        handle: '',
        owner_id: '',
        industry_id: '',
        expertise_ids: [] as string[],
        established: '',
        searchable: true,
        active: true,
        published: true,
    });
    const [allExpertises, setAllExpertises] = React.useState<Tag[]>([]);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const response = await companyService.getCompanies();

            if (response && response.data) {
                const dataArr = (Array.isArray(response.data) ? response.data : Object.values(response.data)) as Company[];
                setCompanyList(dataArr);
                setTotalCompanies(response.meta?.total || dataArr.length);
            } else if (Array.isArray(response)) {
                setCompanyList(response as Company[]);
                setTotalCompanies(response.length);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExpertises = async () => {
        try {
            const tagsRes = await tagService.getTags({ per_page: 200 });
            if (tagsRes && tagsRes.data) setAllExpertises(tagsRes.data as Tag[]);
            else if (Array.isArray(tagsRes)) setAllExpertises(tagsRes as Tag[]);
        } catch (error) {
            console.error('Error fetching expertises:', error);
        }
    };

    React.useEffect(() => {
        fetchCompanies();
        fetchExpertises();
    }, []);

    const handleOpenModal = (company?: Company) => {
        if (company) {
            const d = getCompanyData(company);
            setEditingId(d.id);
            setFormData({
                name: { en: d.name.en || '', ar: d.name.ar || '' },
                slogan: { en: d.slogan?.en || '', ar: d.slogan?.ar || '' },
                location: displayBilingual(d.location) || '',
                acronym: d.acronym || '',
                handle: d.handle || '',
                owner_id: d.ownerId || '',
                industry_id: d.industryId || '',
                expertise_ids: d.expertiseIds || [],
                established: d.established ? String(d.established) : '',
                searchable: d.searchable,
                active: d.active,
                published: d.published,
            });
        } else {
            setEditingId(null);
            setFormData({
                name: { en: '', ar: '' },
                slogan: { en: '', ar: '' },
                location: '',
                acronym: '',
                handle: '',
                owner_id: '',
                industry_id: '',
                expertise_ids: [],
                established: '',
                searchable: true,
                active: true,
                published: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Are you sure you want to delete this company?')) return;
        try {
            await companyService.deleteCompany(String(id));
            setCompanyList(prev => prev.filter(c => c.id !== id));
            setTotalCompanies(prev => prev - 1);
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleToggleStatus = async (id: string | number) => {
        try {
            await companyService.togglePublished(String(id));
            await fetchCompanies();
        } catch (error) {
            console.error('Toggle status failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            const basePayload: any = {
                owner_id: formData.owner_id,
                name: formData.name,
                slogan: formData.slogan,
                acronym: formData.acronym,
                handle: formData.handle,
                industry_id: formData.industry_id,
                expertise_ids: formData.expertise_ids,
                searchable: formData.searchable,
                active: formData.active,
                published: formData.published,
            };

            if (formData.established) {
                basePayload.established = Number(formData.established);
            }

            if (editingId) {
                await companyService.updateCompany(String(editingId), basePayload);
            } else {
                await companyService.createCompany(basePayload);
            }
            await fetchCompanies();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save company');
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

    if (loading && companyList.length === 0) {
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
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Company Management</h2>
                    <p className="text-slate-500 text-sm mt-1">{totalCompanies.toLocaleString()} verified companies on the platform</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-lg"
                >
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
                            {companyList.map((c) => {
                                const d = getCompanyData(c);
                                return (
                                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                                                    <img
                                                        src={d.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayBilingual(d.name))}&background=008080&color=fff`}
                                                        alt={displayBilingual(d.name)}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h5 className="text-[14px] font-bold text-slate-800">
                                                        {displayBilingual(d.name)}
                                                    </h5>
                                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                                                        {d.acronym || 'No Acronym'}
                                                    </p>
                                                    {d.handle && (
                                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                                            {d.handle}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1 text-xs text-slate-600 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    <span>{displayBilingual(d.location) || 'Distributed'}</span>
                                                </div>
                                                {d.industryName && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                                        <Globe size={13} className="text-slate-300" />
                                                        <span>{displayBilingual(d.industryName)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <button
                                                onClick={() => handleToggleStatus(d.id)}
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors hover:opacity-80 ${getStatusStyles(d.active ? 'active' : 'inactive')}`}
                                                title="Click to toggle status"
                                            >
                                                {d.active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5 text-xs text-slate-500 font-medium">
                                            {formatDate(d.createdAt)}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleOpenModal(c)}
                                                    className="text-slate-400 hover:text-blue-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(d.id)}
                                                    className="text-slate-400 hover:text-rose-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {companyList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No companies found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
                    <p className="text-xs font-semibold text-slate-400">
                        Showing total <span className="text-slate-900 font-bold">{totalCompanies.toLocaleString()}</span> companies
                    </p>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b bg-slate-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold font-outfit text-slate-900">
                                        {editingId ? 'Edit Company' : 'Register Company'}
                                    </h3>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                                        1
                                    </span>
                                    <span>Identity</span>
                                </div>
                                <div className="h-px w-6 bg-slate-200" />
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">
                                        2
                                    </span>
                                    <span>Location &amp; Meta</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh]">
                            <div className="p-8 space-y-8 overflow-y-auto premium-scrollbar flex-1">
                                {/* Identity */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                English Name
                                            </label>
                                            <input
                                                required
                                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none"
                                                value={formData.name.en}
                                                onChange={e => updateBilingual('name', 'en', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block">
                                                الإسم بالعربية
                                            </label>
                                            <input
                                                required
                                                dir="rtl"
                                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none text-right"
                                                value={formData.name.ar}
                                                onChange={e => updateBilingual('name', 'ar', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Slogan (EN)
                                            </label>
                                            <input
                                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none"
                                                value={formData.slogan.en}
                                                onChange={e => setFormData(prev => ({ ...prev, slogan: { ...prev.slogan, en: e.target.value } }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block">
                                                الشعار (بالعربية)
                                            </label>
                                            <input
                                                dir="rtl"
                                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none text-right"
                                                value={formData.slogan.ar}
                                                onChange={e => setFormData(prev => ({ ...prev, slogan: { ...prev.slogan, ar: e.target.value } }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Acronym
                                            </label>
                                            <input
                                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none uppercase placeholder:lowercase"
                                                value={formData.acronym}
                                                onChange={e => setFormData({ ...formData, acronym: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Handle
                                            </label>
                                            <input
                                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none"
                                                placeholder="@handle"
                                                value={formData.handle}
                                                onChange={e => setFormData({ ...formData, handle: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Established Year
                                            </label>
                                            <input
                                                type="number"
                                                min="1800"
                                                max={new Date().getFullYear()}
                                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none"
                                                value={formData.established}
                                                onChange={e => setFormData({ ...formData, established: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Meta & taxonomy */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Owner ULID
                                            </label>
                                            <input
                                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono focus:bg-white focus:border-teal-500 transition-all outline-none"
                                                value={formData.owner_id}
                                                onChange={e => setFormData({ ...formData, owner_id: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Industry ULID
                                            </label>
                                            <input
                                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono focus:bg-white focus:border-teal-500 transition-all outline-none"
                                                value={formData.industry_id}
                                                onChange={e => setFormData({ ...formData, industry_id: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            Expertises
                                            <span className="text-slate-300 font-bold ml-1">
                                                ({formData.expertise_ids.length})
                                            </span>
                                        </label>
                                        <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[90px]">
                                            {allExpertises.map(tag => {
                                                const id = String(tag.id);
                                                const isSelected = formData.expertise_ids.includes(id);
                                                return (
                                                    <button
                                                        key={id}
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                expertise_ids: prev.expertise_ids.includes(id)
                                                                    ? prev.expertise_ids.filter(tid => tid !== id)
                                                                    : [...prev.expertise_ids, id],
                                                            }))
                                                        }
                                                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                                                            isSelected
                                                                ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/10'
                                                                : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600'
                                                        }`}
                                                    >
                                                        <span className="inline-flex items-center gap-1">
                                                            <TagIcon size={11} className="opacity-60" />
                                                            {displayBilingual(tag.name)}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                            {allExpertises.length === 0 && (
                                                <p className="text-xs text-slate-400 italic">
                                                    No expertises loaded from API.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Governance */}
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-teal-600 uppercase tracking-widest">
                                        Governance &amp; Visibility
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-slate-800">Searchable</p>
                                                <p className="text-[10px] text-slate-400 font-medium">Include in internal search.</p>
                                            </div>
                                            <div className="relative inline-flex items-center cursor-pointer scale-90">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.searchable}
                                                    onChange={e => setFormData({ ...formData, searchable: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-slate-800">Active</p>
                                                <p className="text-[10px] text-slate-400 font-medium">Eligible for operations.</p>
                                            </div>
                                            <div className="relative inline-flex items-center cursor-pointer scale-90">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.active}
                                                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-slate-800">Published</p>
                                                <p className="text-[10px] text-slate-400 font-medium">Visible to marketplace.</p>
                                            </div>
                                            <div className="relative inline-flex items-center cursor-pointer scale-90">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.published}
                                                    onChange={e => setFormData({ ...formData, published: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-4 bg-slate-50">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-10 py-2.5 bg-teal-600 rounded-xl text-sm font-black text-white hover:bg-teal-700 transition-all flex items-center gap-2">
                                    {formSaving && <Loader2 className="animate-spin" size={16} />} Save Company
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Companies;
