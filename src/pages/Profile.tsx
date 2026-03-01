import React from 'react';
import {
    User,
    Mail,
    Phone,
    Briefcase,
    Camera,
    Shield,
    Save,
    X,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Plus,
    Edit2,
    Eye,
    Globe,
    Lock,
    Search,
    Filter,
    ArrowRight,
    Boxes,
    LayoutGrid,
    Settings as SettingsIcon,
    ChevronDown
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { authService } from '../services/authService';
import { companyService } from '../services/companyService';
import { productService } from '../services/productService';
import { serviceService } from '../services/serviceService';
import { categoryService } from '../services/categoryService';
import { Company, Product, Service, Category } from '../types/api';

/**
 * Utility for Tailwind class merging
 */
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    phone?: string;
    jobTitle?: string;
}

type TabType = 'settings' | 'companies' | 'products' | 'services';

const Profile = () => {
    // --- State: General ---
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<TabType>('settings');
    const [user, setUser] = React.useState<UserProfile | null>(null);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [uploading, setUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // --- State: Data ---
    const [userCompanies, setUserCompanies] = React.useState<Company[]>([]);
    const [userProducts, setUserProducts] = React.useState<Product[]>([]);
    const [userServices, setUserServices] = React.useState<Service[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = React.useState<string | number>('');

    // --- State: Loading Tabs ---
    const [tabLoading, setTabLoading] = React.useState(false);

    // --- State: Modals & Forms ---
    const [modal, setModal] = React.useState<{
        isOpen: boolean;
        type: 'company' | 'product' | 'service';
        editingId?: string | number;
    }>({ isOpen: false, type: 'company' });

    const [formSaving, setFormSaving] = React.useState(false);

    // --- State: Account Settings Form ---
    const [settingsFormData, setSettingsFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        jobTitle: ''
    });

    // --- Effects ---
    React.useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const profile = await authService.getProfile();
                setUser(profile);
                setSettingsFormData({
                    name: profile.name || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    jobTitle: profile.jobTitle || ''
                });

                // Fetch companies as they are needed for products/services too
                const resp = await companyService.getUserCompanies();
                setUserCompanies(resp.data);
                if (resp.data.length > 0) {
                    setSelectedCompanyId(resp.data[0].id);
                }

                // Pre-fetch categories
                const catResp = await categoryService.getCategories();
                setCategories(catResp.data);

            } catch (error) {
                console.error('Failed to fetch initial profile data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Change Tab logic
    React.useEffect(() => {
        if (activeTab === 'companies') {
            fetchCompanies();
        } else if (activeTab === 'products' && selectedCompanyId) {
            fetchProducts(selectedCompanyId);
        } else if (activeTab === 'services' && selectedCompanyId) {
            fetchServices(selectedCompanyId);
        }
    }, [activeTab, selectedCompanyId]);

    // --- Data Fetching ---
    const fetchCompanies = async () => {
        setTabLoading(true);
        try {
            const resp = await companyService.getUserCompanies();
            setUserCompanies(resp.data);
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        } finally {
            setTabLoading(false);
        }
    };

    const fetchProducts = async (companyId: string | number) => {
        setTabLoading(true);
        try {
            const resp = await productService.getUserProducts(companyId);
            setUserProducts(resp.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setTabLoading(false);
        }
    };

    const fetchServices = async (companyId: string | number) => {
        setTabLoading(true);
        try {
            const resp = await serviceService.getUserServices(companyId);
            setUserServices(resp.data);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setTabLoading(false);
        }
    };

    // --- Handlers: Settings ---
    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettingsFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSettingsSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setFormSaving(true);
        setMessage(null);
        try {
            await authService.updateProfile(user.id, settingsFormData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setUser(prev => prev ? { ...prev, ...settingsFormData } : null);
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Update failed' });
        } finally {
            setFormSaving(false);
        }
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setUploading(true);
        try {
            const response = await authService.uploadAvatar(user.id, file);
            const newAvatar = response.data?.attributes?.profilePhoto || response.data?.profilePhoto;
            setUser(prev => prev ? { ...prev, avatar: newAvatar } : null);
            setMessage({ type: 'success', text: 'Avatar successfully updated!' });
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Avatar upload failed' });
        } finally {
            setUploading(false);
        }
    };

    // --- Handlers: CRUD Actions ---
    const handleDeleteCompany = async (id: string | number) => {
        if (!confirm('Are you sure you want to delete this company? All its listings will be hidden.')) return;
        try {
            await companyService.deleteCompany(id);
            setUserCompanies(prev => prev.filter(c => c.id !== id));
            setMessage({ type: 'success', text: 'Company deleted' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Deletion failed' });
        }
    };

    const handleDeleteProduct = async (id: string | number) => {
        if (!confirm('Delete this product?')) return;
        try {
            await productService.deleteProduct(id);
            setUserProducts(prev => prev.filter(p => p.id !== id));
            setMessage({ type: 'success', text: 'Product deleted' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Deletion failed' });
        }
    };

    const handleDeleteService = async (id: string | number) => {
        if (!confirm('Delete this service?')) return;
        try {
            await serviceService.deleteService(id);
            setUserServices(prev => prev.filter(s => s.id !== id));
            setMessage({ type: 'success', text: 'Service deleted' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Deletion failed' });
        }
    };

    const handleToggleStatus = async (type: 'company' | 'product' | 'service', id: string | number) => {
        try {
            if (type === 'company') {
                await companyService.toggleStatus(id);
                setUserCompanies(prev => prev.map(c => c.id === id ? { ...c, published: !c.published } : c));
            } else if (type === 'product') {
                await productService.updateProductStatus(id, ''); // Backend might toggle if status empty or using patched endpoint
                setUserProducts(prev => prev.map(p => p.id === id ? { ...p, published: !p.published } : p));
            } else if (type === 'service') {
                await serviceService.updateServiceStatus(id, '');
                setUserServices(prev => prev.map(s => s.id === id ? { ...s, published: !s.published } : s));
            }
        } catch (error) {
            console.error('Toggle status failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold animate-pulse text-sm">Loading Identity Management...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // --- Sub-Components: Form Modal ---
    const RenderModal = () => {
        if (!modal.isOpen) return null;

        const isEditing = !!modal.editingId;
        const title = isEditing ? `Edit ${modal.type}` : `Add New ${modal.type}`;

        // Form Local State
        const [localForm, setLocalForm] = React.useState<any>(() => {
            if (isEditing) {
                if (modal.type === 'company') return userCompanies.find(c => c.id === modal.editingId);
                if (modal.type === 'product') return userProducts.find(p => p.id === modal.editingId);
                if (modal.type === 'service') return userServices.find(s => s.id === modal.editingId);
            }
            return {
                name: { en: '', ar: '' },
                description: { en: '', ar: '' },
                company_id: selectedCompanyId,
                category_id: categories[0]?.id || ''
            };
        });

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setFormSaving(true);
            try {
                if (modal.type === 'company') {
                    if (isEditing) await companyService.updateCompany(modal.editingId!, localForm);
                    else await companyService.createCompany(localForm);
                    fetchCompanies();
                } else if (modal.type === 'product') {
                    if (isEditing) await productService.updateProduct(modal.editingId!, localForm);
                    else await productService.createProduct(localForm);
                    fetchProducts(selectedCompanyId);
                } else if (modal.type === 'service') {
                    if (isEditing) await serviceService.updateService(modal.editingId!, localForm);
                    else await serviceService.createService(localForm);
                    fetchServices(selectedCompanyId);
                }
                setModal({ ...modal, isOpen: false });
                setMessage({ type: 'success', text: `${modal.type} saved successfully!` });
            } catch (err: any) {
                alert(err.message || 'Operation failed');
            } finally {
                setFormSaving(false);
            }
        };

        const updateBilingual = (field: string, lang: 'en' | 'ar', val: string) => {
            setLocalForm((prev: any) => ({
                ...prev,
                [field]: { ...(prev[field] || {}), [lang]: val }
            }));
        };

        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModal({ ...modal, isOpen: false })}></div>
                <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                        <div>
                            <h3 className="text-xl font-bold font-outfit text-slate-900">{title}</h3>
                            <p className="text-xs text-slate-500 font-medium">Please provide accurate details for the platform listings.</p>
                        </div>
                        <button onClick={() => setModal({ ...modal, isOpen: false })} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto premium-scrollbar">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">English Name</label>
                                <input
                                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none"
                                    value={typeof localForm.name === 'string' ? localForm.name : localForm.name?.en || ''}
                                    onChange={(e) => updateBilingual('name', 'en', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block">الإسم بالعربية</label>
                                <input
                                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none text-right"
                                    value={localForm.name?.ar || ''}
                                    onChange={(e) => updateBilingual('name', 'ar', e.target.value)}
                                    dir="rtl"
                                    required
                                />
                            </div>
                        </div>

                        {(modal.type === 'product' || modal.type === 'service') && (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-teal-500 transition-all"
                                            value={localForm.category_id || ''}
                                            onChange={(e) => setLocalForm({ ...localForm, category_id: e.target.value })}
                                            required
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {typeof cat.name === 'string' ? cat.name : cat.name.en}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Company</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:border-teal-500 transition-all"
                                            value={localForm.company_id || ''}
                                            onChange={(e) => setLocalForm({ ...localForm, company_id: e.target.value })}
                                            required
                                            disabled={!!localForm.company_id && !isEditing}
                                        >
                                            {userCompanies.map(comp => (
                                                <option key={comp.id} value={comp.id}>
                                                    {typeof comp.name === 'string' ? comp.name : comp.name.en}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">About / Description (EN)</label>
                            <textarea
                                className="w-full min-h-[100px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none"
                                value={typeof localForm.description === 'string' ? localForm.description : localForm.description?.en || localForm.about?.en || ''}
                                onChange={(e) => updateBilingual(modal.type === 'company' ? 'about' : 'description', 'en', e.target.value)}
                                placeholder="Describe the offering in detail..."
                            />
                        </div>

                        <div className="space-y-2 text-right">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">الوصف بالعربية</label>
                            <textarea
                                className="w-full min-h-[100px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-teal-500 transition-all outline-none text-right"
                                value={localForm.description?.ar || localForm.about?.ar || ''}
                                onChange={(e) => updateBilingual(modal.type === 'company' ? 'about' : 'description', 'ar', e.target.value)}
                                placeholder="...اكتب تفاصيل الإضافة"
                                dir="rtl"
                            />
                        </div>

                        <div className="pt-8 border-t flex justify-end gap-4">
                            <button
                                type="button"
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
                                onClick={() => setModal({ ...modal, isOpen: false })}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={formSaving}
                                className="px-10 py-2.5 bg-slate-900 rounded-xl text-sm font-black text-white hover:bg-teal-600 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {formSaving && <Loader2 className="animate-spin" size={16} />}
                                {isEditing ? 'Save Changes' : `Add ${modal.type}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const StatusBadge = ({ published }: { published?: boolean }) => (
        <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
            published
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-amber-50 text-amber-600 border-amber-100"
        )}>
            {published ? 'Published' : 'Draft'}
        </span>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Page Title & Tabs Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Identity Hub</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium italic">Empower your administrative profile and market presence.</p>
                </div>

                {/* Tab Bar: Premium Glassmorphism */}
                <div className="flex bg-slate-100/80 backdrop-blur p-1.5 rounded-2xl border border-white/50 shadow-inner">
                    {[
                        { id: 'settings', label: 'Identity', icon: User },
                        { id: 'companies', label: 'Companies', icon: Briefcase },
                        { id: 'products', label: 'Products', icon: Boxes },
                        { id: 'services', label: 'Services', icon: LayoutGrid }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all",
                                activeTab === tab.id
                                    ? "bg-white text-teal-600 shadow-md transform scale-[1.02]"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                            )}
                        >
                            <tab.icon size={16} className={cn(activeTab === tab.id ? "text-teal-500" : "opacity-40")} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Notification Bar */}
            {message && (
                <div className={cn(
                    "p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 shadow-xl border-l-[6px]",
                    message.type === 'success'
                        ? "bg-white text-emerald-800 border-emerald-500"
                        : "bg-white text-rose-800 border-rose-500"
                )}>
                    <div className={cn("p-2 rounded-full", message.type === 'success' ? "bg-emerald-100" : "bg-rose-100")}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-wider mb-0.5">{message.type === 'success' ? 'Success' : 'Error'}</p>
                        <p className="text-[13px] font-bold text-slate-600 leading-tight">{message.text}</p>
                    </div>
                    <button onClick={() => setMessage(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Mini-Dashboard (Shared) */}
                <div className="lg:col-span-3 space-y-6">
                    {/* User Summary Card */}
                    <div className="premium-card p-6 flex flex-col items-center text-center relative group">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-slate-100 relative group-hover:rotate-2 transition-transform duration-500">
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=008080&color=fff&size=128`}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    alt="Profile"
                                />
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Loader2 className="text-white animate-spin" size={24} />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleAvatarClick}
                                className="absolute -bottom-2 -right-2 bg-teal-600 text-white p-2.5 rounded-2xl shadow-xl hover:bg-teal-700 hover:scale-110 active:scale-90 transition-all border-2 border-white"
                            >
                                <Camera size={16} />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                        </div>

                        <h3 className="text-lg font-black text-slate-900 font-outfit truncate w-full px-2">{user.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-widest">{user.role}</p>

                        <div className="w-full grid grid-cols-2 gap-2 pt-6 border-t border-slate-50 mt-2">
                            <div className="bg-slate-50/50 p-3 rounded-2xl">
                                <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Items</p>
                                <span className="text-sm font-black text-slate-800">{userCompanies.length + userProducts.length}</span>
                            </div>
                            <div className="bg-slate-50/50 p-3 rounded-2xl">
                                <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Reach</p>
                                <span className="text-sm font-black text-slate-800">1.2k</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Widget */}
                    <div className="premium-card p-6 bg-slate-900 text-white border-0 shadow-2xl shadow-teal-900/10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="flex items-center gap-3 text-teal-400 mb-6">
                            <Shield size={20} />
                            <h4 className="font-black text-[10px] uppercase tracking-widest">Platform Security</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-6 leading-relaxed font-medium">
                            Your account holds <span className="text-teal-400 font-bold">Root Access</span> permissions.
                            Multi-factor authentication is active and monitoring all profile mutations.
                        </p>
                        <div className="h-1 bg-white/10 rounded-full w-full overflow-hidden">
                            <div className="h-full bg-teal-500 w-[85%] rounded-full"></div>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-3 font-bold uppercase tracking-tighter">Security Score: Excellent (85/100)</p>
                    </div>
                </div>

                {/* Right Area: Dynamic Tab Content */}
                <div className="lg:col-span-9 space-y-6">

                    {/* --- TAB: SETTINGS --- */}
                    {activeTab === 'settings' && (
                        <div className="premium-card animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div>
                                    <h4 className="font-black text-xl text-slate-800 font-outfit italic tracking-tighter">Personal Identity</h4>
                                    <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-widest leading-none">Global Metadata & Account Keys</p>
                                </div>
                                <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
                                    <SettingsIcon size={24} />
                                </div>
                            </div>

                            <form onSubmit={handleSettingsSave} className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={settingsFormData.name}
                                                onChange={handleSettingsChange}
                                                className="w-full h-14 pl-12 pr-4 bg-slate-50/50 border border-slate-100 focus:border-teal-400 rounded-2xl text-sm font-black outline-none transition-all shadow-inner focus:bg-white"
                                                placeholder="Identity name..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Authentication Mail</label>
                                        <div className="relative opacity-60">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                value={settingsFormData.email}
                                                className="w-full h-14 pl-12 pr-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-black outline-none cursor-not-allowed"
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Phone</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors">
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={settingsFormData.phone}
                                                onChange={handleSettingsChange}
                                                className="w-full h-14 pl-12 pr-4 bg-slate-50/50 border border-slate-100 focus:border-teal-400 rounded-2xl text-sm font-black outline-none transition-all shadow-inner focus:bg-white"
                                                placeholder="+00 (0) 000 000"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Functional Designation</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors">
                                                <Briefcase size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                name="jobTitle"
                                                value={settingsFormData.jobTitle}
                                                onChange={handleSettingsChange}
                                                className="w-full h-14 pl-12 pr-4 bg-slate-50/50 border border-slate-100 focus:border-teal-400 rounded-2xl text-sm font-black outline-none transition-all shadow-inner focus:bg-white"
                                                placeholder="Executive role..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer p-2 opacity-50 hover:opacity-100">
                                        <Trash2 size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Delete Administrator</span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={formSaving}
                                        className="flex items-center gap-3 px-12 py-3.5 bg-slate-900 rounded-2xl text-sm font-black text-white hover:bg-teal-600 transition-all shadow-2xl shadow-teal-900/20 active:scale-95 disabled:opacity-50"
                                    >
                                        {formSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        <span>SYNCHRONIZE PROFILE</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- TAB: COMPANIES --- */}
                    {activeTab === 'companies' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h4 className="font-black text-xl text-slate-900 font-outfit tracking-tighter italic">Owned Entities</h4>
                                <button
                                    onClick={() => setModal({ isOpen: true, type: 'company' })}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-teal-600 transition-all shadow-lg active:scale-95"
                                >
                                    <Plus size={16} />
                                    <span>NEW COMPANY</span>
                                </button>
                            </div>

                            {tabLoading ? (
                                <div className="premium-card p-12 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="animate-spin text-teal-500" size={32} />
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fetching Assets...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {userCompanies.length === 0 ? (
                                        <div className="col-span-2 premium-card p-12 text-center border-dashed border-2">
                                            <Briefcase size={48} className="mx-auto text-slate-200 mb-4" />
                                            <p className="font-bold text-slate-400">No organizations registered under this profile.</p>
                                        </div>
                                    ) : userCompanies.map((company) => (
                                        <div key={company.id} className="premium-card group hover:scale-[1.01] transition-all duration-300 flex flex-col">
                                            <div className="p-6 flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-teal-200 transition-colors overflow-hidden">
                                                        {company.profilePhoto ? (
                                                            <img src={company.profilePhoto} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Briefcase className="text-slate-400" size={24} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-black text-slate-800 tracking-tight">{typeof company.name === 'string' ? company.name : company.name.en}</h5>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{company.location || 'Global Operations'}</p>
                                                    </div>
                                                </div>
                                                <StatusBadge published={company.published} />
                                            </div>
                                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-1 rounded-b-3xl mt-auto">
                                                <button
                                                    onClick={() => handleToggleStatus('company', company.id)}
                                                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-white transition-all group/btn"
                                                >
                                                    <Globe size={14} className="group-hover/btn:animate-pulse" />
                                                    <span className="text-[9px] font-black uppercase">Visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => setModal({ isOpen: true, type: 'company', editingId: company.id })}
                                                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white transition-all group/btn"
                                                >
                                                    <Edit2 size={14} />
                                                    <span className="text-[9px] font-black uppercase">Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCompany(company.id)}
                                                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-white transition-all group/btn"
                                                >
                                                    <Trash2 size={14} />
                                                    <span className="text-[9px] font-black uppercase">Purge</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- TAB: PRODUCTS --- */}
                    {activeTab === 'products' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <h4 className="font-black text-xl text-slate-900 font-outfit tracking-tighter italic">Product Catalog</h4>
                                    <div className="relative">
                                        <select
                                            value={selectedCompanyId}
                                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                                            className="bg-slate-100 border-none rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none pr-8 cursor-pointer"
                                        >
                                            {userCompanies.map(c => <option key={c.id} value={c.id}>{typeof c.name === 'string' ? c.name : c.name.en}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                                    </div>
                                </div>
                                <button
                                    onClick={() => setModal({ isOpen: true, type: 'product' })}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-teal-600 transition-all shadow-lg active:scale-95"
                                >
                                    <Plus size={16} />
                                    <span>LIST PRODUCT</span>
                                </button>
                            </div>

                            {tabLoading ? (
                                <div className="premium-card p-12 flex items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={32} /></div>
                            ) : (
                                <div className="space-y-4">
                                    {userProducts.length === 0 ? (
                                        <div className="premium-card p-12 text-center border-dashed border-2">
                                            <p className="font-black text-slate-400 text-xs uppercase tracking-widest">No listings discovered for this company.</p>
                                        </div>
                                    ) : userProducts.map((product) => (
                                        <div key={product.id} className="premium-card p-4 flex items-center gap-6 hover:shadow-xl transition-all border-l-[6px] border-l-teal-500">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden border">
                                                <img src={product.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest mb-1">{product.category?.name ? (typeof product.category.name === 'string' ? product.category.name : product.category.name.en) : 'Uncategorized'}</p>
                                                <h5 className="font-black text-slate-800 truncate text-lg tracking-tight leading-none mb-1">{typeof product.name === 'string' ? product.name : product.name.en}</h5>
                                                <p className="text-[11px] text-slate-400 font-bold truncate pr-8">{typeof product.description === 'string' ? product.description : product.description?.en || 'No description available.'}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <StatusBadge published={product.published} />
                                                <div className="flex items-center bg-slate-50 p-1.5 rounded-xl border">
                                                    <button onClick={() => setModal({ isOpen: true, type: 'product', editingId: product.id })} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- TAB: SERVICES --- */}
                    {activeTab === 'services' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <h4 className="font-black text-xl text-slate-900 font-outfit tracking-tighter italic">Service Inventory</h4>
                                    <div className="relative">
                                        <select
                                            value={selectedCompanyId}
                                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                                            className="bg-slate-100 border-none rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none pr-8 cursor-pointer"
                                        >
                                            {userCompanies.map(c => <option key={c.id} value={c.id}>{typeof c.name === 'string' ? c.name : c.name.en}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                                    </div>
                                </div>
                                <button
                                    onClick={() => setModal({ isOpen: true, type: 'service' })}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-teal-600 transition-all shadow-lg active:scale-95"
                                >
                                    <Plus size={16} />
                                    <span>NEW SERVICE</span>
                                </button>
                            </div>

                            {tabLoading ? (
                                <div className="premium-card p-12 flex items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={32} /></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {userServices.length === 0 ? (
                                        <div className="col-span-2 premium-card p-12 text-center border-dashed border-2">
                                            <p className="font-black text-slate-400 text-xs uppercase tracking-widest">No active services offered by this entity.</p>
                                        </div>
                                    ) : userServices.map((service) => (
                                        <div key={service.id} className="premium-card p-6 flex flex-col group relative">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
                                                    <LayoutGrid size={24} />
                                                </div>
                                                <StatusBadge published={service.published} />
                                            </div>
                                            <h5 className="font-black text-slate-800 text-lg tracking-tight mb-2 truncate pr-4">{typeof service.name === 'string' ? service.name : service.name.en}</h5>
                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-4">Service Package</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 mb-6">{typeof service.description === 'string' ? service.description : service.description?.en || 'Reliable service offering.'}</p>

                                            <div className="mt-auto pt-6 border-t flex items-center justify-between">
                                                <div className="flex gap-2">
                                                    <button onClick={() => setModal({ isOpen: true, type: 'service', editingId: service.id })} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDeleteService(service.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                                <button
                                                    onClick={() => handleToggleStatus('service', service.id)}
                                                    className="text-[10px] font-black uppercase text-teal-600 bg-teal-50 px-4 py-1.5 rounded-full hover:bg-teal-100 transition-colors"
                                                >
                                                    {service.published ? 'Retract' : 'Publish'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Layer */}
            <RenderModal />
        </div>
    );
};

export default Profile;
