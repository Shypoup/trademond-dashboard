import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { companyService } from '@services/companyService';
import { tagService } from '@services/tagService';
import { authService } from '@services/authService';
import { Company, Tag } from '@data-types/api';
import { displayBilingual } from '@utils/ui';
import { getCompanyData, EMPTY_COMPANY_FORM, toBilingualParts } from './utils/companyHelpers';
import type { CompanyFormData } from './utils/companyHelpers';
import { CompanyTable } from './components/CompanyTable';
import { CompanyFormSheet } from './components/CompanyFormSheet';

/**
 * Company Management page.
 *
 * Orchestrates company CRUD operations and delegates rendering
 * to {@link CompanyTable} and {@link CompanyFormSheet}.
 */
const Companies = () => {
    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(true);
    const [companyList, setCompanyList] = React.useState<Company[]>([]);
    const [totalCompanies, setTotalCompanies] = React.useState(0);
    const [loginOwnerId, setLoginOwnerId] = React.useState<string>('');

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | number | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState<CompanyFormData>({ ...EMPTY_COMPANY_FORM });
    const [allExpertises, setAllExpertises] = React.useState<Tag[]>([]);

    // -----------------------------------------------------------------------
    // Data fetching
    // -----------------------------------------------------------------------

    /** Fetches the company list from the API. */
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

    /** Fetches all available expertise tags. */
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

    /**
     * Fetches the logged-in user and uses their `id` as the default `owner_id`
     * for the company registration form.
     */
    React.useEffect(() => {
        const fetchOwnerIdFromLogin = async () => {
            try {
                const profile = await authService.getProfile();
                const ownerId = String(profile.id);
                setLoginOwnerId(ownerId);
            } catch (error) {
                console.error('Failed to load owner id from login profile:', error);
            }
        };

        fetchOwnerIdFromLogin();
    }, []);

    React.useEffect(() => {
        if (!loginOwnerId) return;
        if (!isModalOpen) return;
        if (editingId !== null) return;
        setFormData(prev => ({ ...prev, owner_id: loginOwnerId }));
    }, [loginOwnerId, isModalOpen, editingId]);

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    /** Opens the sheet in create or edit mode depending on the argument. */
    const handleOpenModal = (company?: Company) => {
        if (company) {
            const d = getCompanyData(company);
            setEditingId(d.id);
            const name = toBilingualParts(d.name);
            const slogan = toBilingualParts(d.slogan);
            setFormData({
                name,
                slogan,
                location: displayBilingual(d.location) || '',
                acronym: d.acronym || '',
                handle: d.handle || '',
                owner_id: d.ownerId || loginOwnerId || '',
                industry_id: d.industryId || '',
                expertise_ids: d.expertiseIds || [],
                established: d.established ? String(d.established) : '',
                searchable: d.searchable,
                active: d.active,
                published: d.published,
            });
        } else {
            setEditingId(null);
            setFormData({ ...EMPTY_COMPANY_FORM, owner_id: loginOwnerId || '' });
        }
        setIsModalOpen(true);
    };

    /** Deletes a company after user confirmation. */
    const handleDelete = async (id: string | number) => {
        if (!window.confirm(t('companies.confirmDelete'))) return;
        try {
            await companyService.deleteCompany(String(id));
            setCompanyList(prev => prev.filter(c => c.id !== id));
            setTotalCompanies(prev => prev - 1);
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    /** Toggles the published state for a company. */
    const handleToggleStatus = async (id: string | number) => {
        try {
            await companyService.togglePublished(String(id));
            await fetchCompanies();
        } catch (error) {
            console.error('Toggle status failed', error);
        }
    };

    /** Submits the create / edit form. */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            const basePayload: Record<string, unknown> = {
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
            alert(t('companies.saveFailed'));
        } finally {
            setFormSaving(false);
        }
    };

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    if (loading && companyList.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold animate-pulse text-sm">
                        {t('companies.loading')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">
                        {t('companies.management')}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {t('companies.verifiedCount', { count: totalCompanies })}
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-lg"
                >
                    <Plus size={18} />
                    <span>{t('companies.registerCompany')}</span>
                </button>
            </div>

            {/* Company table */}
            <CompanyTable
                companies={companyList}
                totalCompanies={totalCompanies}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
            />

            {/* Create / Edit sheet */}
            <CompanyFormSheet
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingId={editingId}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                formSaving={formSaving}
                allExpertises={allExpertises}
                loginOwnerId={loginOwnerId}
            />
        </div>
    );
};

export default Companies;
