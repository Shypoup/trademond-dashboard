import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authService } from '@services/authService';
import { companyService } from '@services/companyService';
import { productService } from '@services/productService';
import { serviceService } from '@services/serviceService';
import { categoryService } from '@services/categoryService';
import type { Company, Product, Service, Category } from '@data-types/api';
import type {
    UserProfile,
    TabType,
    ProfileMessage,
    ModalState,
    SettingsFormData,
} from './utils/types';
import { ProfileTabBar } from './components/ProfileTabBar';
import { ProfileSidebar } from './components/ProfileSidebar';
import { NotificationBar } from './components/NotificationBar';
import { SettingsTab } from './components/SettingsTab';
import { CompaniesTab } from './components/CompaniesTab';
import { ProductsTab } from './components/ProductsTab';
import { ServicesTab } from './components/ServicesTab';
import { EntityFormModal } from './components/EntityFormModal';

/**
 * Profile page — orchestrates Identity Hub with tabs for
 * account settings, companies, products, and services management.
 */
const Profile = () => {
    const { t } = useTranslation();

    // --- State: General ---
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<TabType>('settings');
    const [user, setUser] = React.useState<UserProfile | null>(null);
    const [message, setMessage] = React.useState<ProfileMessage | null>(null);
    const [uploading, setUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // --- State: Data ---
    const [userCompanies, setUserCompanies] = React.useState<Company[]>([]);
    const [userProducts, setUserProducts] = React.useState<Product[]>([]);
    const [userServices, setUserServices] = React.useState<Service[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = React.useState<string | number>('');

    // --- State: Loading & Modals ---
    const [tabLoading, setTabLoading] = React.useState(false);
    const [modal, setModal] = React.useState<ModalState>({ isOpen: false, type: 'company' });
    const [formSaving, setFormSaving] = React.useState(false);

    // --- State: Account Settings Form ---
    const [settingsFormData, setSettingsFormData] = React.useState<SettingsFormData>({
        name: '',
        email: '',
        phone: '',
        jobTitle: '',
    });

    // --- Data Fetching Helpers ---
    const fetchCompanies = async () => {
        setTabLoading(true);
        try {
            const resp = await companyService.getCompanies();
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
            const resp = await productService.getProducts({ company_id: companyId });
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
            const resp = await serviceService.getServices({ company_id: companyId });
            setUserServices(resp.data);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setTabLoading(false);
        }
    };

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
                    jobTitle: profile.jobTitle || '',
                });

                const resp = await companyService.getCompanies();
                setUserCompanies(resp.data);
                if (resp.data.length > 0) {
                    setSelectedCompanyId(resp.data[0].id);
                }

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

    React.useEffect(() => {
        if (activeTab === 'companies') {
            fetchCompanies();
        } else if (activeTab === 'products' && selectedCompanyId) {
            fetchProducts(selectedCompanyId);
        } else if (activeTab === 'services' && selectedCompanyId) {
            fetchServices(selectedCompanyId);
        }
    }, [activeTab, selectedCompanyId]);

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
            setMessage({ type: 'success', text: t('profile.profileUpdated') });
            setUser(prev => prev ? { ...prev, ...settingsFormData } : null);
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : t('profile.updateFailed');
            setMessage({ type: 'error', text: msg });
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
            setMessage({ type: 'success', text: t('profile.avatarUpdated') });
            setTimeout(() => window.location.reload(), 1000);
        } catch {
            setMessage({ type: 'error', text: t('profile.avatarFailed') });
        } finally {
            setUploading(false);
        }
    };

    // --- Handlers: CRUD ---
    const handleDeleteCompany = async (id: string | number) => {
        if (!confirm(t('profile.confirmDeleteCompany'))) return;
        try {
            await companyService.deleteCompany(String(id));
            setUserCompanies(prev => prev.filter(c => c.id !== id));
            setMessage({ type: 'success', text: t('profile.companyDeleted') });
        } catch {
            setMessage({ type: 'error', text: t('profile.deletionFailed') });
        }
    };

    const handleDeleteProduct = async (id: string | number) => {
        if (!confirm(t('profile.confirmDeleteProduct'))) return;
        try {
            await productService.deleteProduct(String(id));
            setUserProducts(prev => prev.filter(p => p.id !== id));
            setMessage({ type: 'success', text: t('profile.productDeleted') });
        } catch {
            setMessage({ type: 'error', text: t('profile.deletionFailed') });
        }
    };

    const handleDeleteService = async (id: string | number) => {
        if (!confirm(t('profile.confirmDeleteService'))) return;
        try {
            await serviceService.deleteService(String(id));
            setUserServices(prev => prev.filter(s => s.id !== id));
            setMessage({ type: 'success', text: t('profile.serviceDeleted') });
        } catch {
            setMessage({ type: 'error', text: t('profile.deletionFailed') });
        }
    };

    const handleToggleStatus = async (type: 'company' | 'product' | 'service', id: string | number) => {
        try {
            if (type === 'company') {
                await companyService.togglePublished(String(id));
                setUserCompanies(prev => prev.map(c => c.id === id ? { ...c, published: !c.published } : c));
            } else if (type === 'product') {
                await productService.togglePublished(String(id));
                setUserProducts(prev => prev.map(p => p.id === id ? { ...p, published: !p.published } : p));
            } else if (type === 'service') {
                await serviceService.togglePublished(String(id));
                setUserServices(prev => prev.map(s => s.id === id ? { ...s, published: !s.published } : s));
            }
        } catch (error) {
            console.error('Toggle status failed:', error);
        }
    };

    const handleOpenModal = (type: 'company' | 'product' | 'service', editingId?: string | number) => {
        setModal({ isOpen: true, type, editingId });
    };

    const handleModalSubmit = async (type: 'company' | 'product' | 'service', isEditing: boolean, data: Record<string, unknown>) => {
        setFormSaving(true);
        try {
            if (type === 'company') {
                if (isEditing) await companyService.updateCompany(String(modal.editingId!), data);
                else await companyService.createCompany(data);
                fetchCompanies();
            } else if (type === 'product') {
                if (isEditing) await productService.updateProduct(String(modal.editingId!), data);
                else await productService.updateProduct('', data);
                fetchProducts(selectedCompanyId);
            } else if (type === 'service') {
                if (isEditing) await serviceService.updateService(String(modal.editingId!), data);
                else await serviceService.updateService('', data);
                fetchServices(selectedCompanyId);
            }
            setModal({ ...modal, isOpen: false });
            setMessage({ type: 'success', text: t('profile.entitySaved', { type }) });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t('profile.operationFailed');
            alert(msg);
        } finally {
            setFormSaving(false);
        }
    };

    // --- Loading & Guard ---
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold animate-pulse text-sm">
                        {t('profile.loadingIdentity')}
                    </p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Page Title & Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">
                        {t('profile.title')}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium italic">
                        {t('profile.subtitle')}
                    </p>
                </div>
                <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Notification Bar */}
            {message && (
                <NotificationBar message={message} onDismiss={() => setMessage(null)} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <ProfileSidebar
                    user={user}
                    uploading={uploading}
                    itemCount={userCompanies.length + userProducts.length}
                    fileInputRef={fileInputRef}
                    onAvatarClick={handleAvatarClick}
                    onAvatarUpload={handleAvatarUpload}
                />

                <div className="lg:col-span-9 space-y-6">
                    {activeTab === 'settings' && (
                        <SettingsTab
                            formData={settingsFormData}
                            formSaving={formSaving}
                            onChange={handleSettingsChange}
                            onSubmit={handleSettingsSave}
                        />
                    )}

                    {activeTab === 'companies' && (
                        <CompaniesTab
                            companies={userCompanies}
                            tabLoading={tabLoading}
                            onToggleStatus={handleToggleStatus}
                            onOpenModal={handleOpenModal}
                            onDelete={handleDeleteCompany}
                        />
                    )}

                    {activeTab === 'products' && (
                        <ProductsTab
                            products={userProducts}
                            companies={userCompanies}
                            selectedCompanyId={selectedCompanyId}
                            onSelectCompany={setSelectedCompanyId}
                            tabLoading={tabLoading}
                            onToggleStatus={handleToggleStatus}
                            onOpenModal={handleOpenModal}
                            onDelete={handleDeleteProduct}
                        />
                    )}

                    {activeTab === 'services' && (
                        <ServicesTab
                            services={userServices}
                            companies={userCompanies}
                            selectedCompanyId={selectedCompanyId}
                            onSelectCompany={setSelectedCompanyId}
                            tabLoading={tabLoading}
                            onToggleStatus={handleToggleStatus}
                            onOpenModal={handleOpenModal}
                            onDelete={handleDeleteService}
                        />
                    )}
                </div>
            </div>

            {/* Modal Layer */}
            <EntityFormModal
                modal={modal}
                companies={userCompanies}
                products={userProducts}
                services={userServices}
                categories={categories}
                selectedCompanyId={selectedCompanyId}
                formSaving={formSaving}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
};

export default Profile;
