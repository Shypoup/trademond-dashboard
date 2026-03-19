import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Building2, ShieldCheck, Globe, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { companyService } from '@services/companyService';
import { tagService } from '@services/tagService';
import { userService } from '@services/userService';
import { authService } from '@services/authService';
import { Company, Tag, User } from '@data-types/api';
import { displayBilingual } from '@utils/ui';
import { getCompanyData, EMPTY_COMPANY_FORM, toBilingualParts } from './utils/companyHelpers';
import type { CompanyFormData } from './utils/companyHelpers';
import { CompanyTable } from './components/CompanyTable';
import { CompanyFormSheet } from './components/CompanyFormSheet';
import { DeleteCompanyDialog } from './components/DeleteCompanyDialog';

/**
 * Company Management page.
 *
 * Orchestrates company CRUD operations with search, pagination,
 * toast notifications, and a proper delete confirmation dialog.
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
    const [allUsers, setAllUsers] = React.useState<User[]>([]);

    const [search, setSearch] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [deleteTarget, setDeleteTarget] = React.useState<Company | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    // -----------------------------------------------------------------------
    // Data fetching
    // -----------------------------------------------------------------------

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
        } catch {
            toast.error(t('companies.fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    const fetchExpertises = async () => {
        try {
            const tagsRes = await tagService.getTags({ per_page: 200 });
            if (tagsRes && tagsRes.data) setAllExpertises(tagsRes.data as Tag[]);
            else if (Array.isArray(tagsRes)) setAllExpertises(tagsRes as Tag[]);
        } catch {
            /* non-critical — form still works */
        }
    };

    const fetchUsers = async () => {
        try {
            const usersRes = await userService.getUsers({ per_page: 200 });
            if (usersRes && usersRes.data) setAllUsers(usersRes.data as User[]);
            else if (Array.isArray(usersRes)) setAllUsers(usersRes as User[]);
        } catch {
            /* non-critical — form still works */
        }
    };

    React.useEffect(() => {
        fetchCompanies();
        fetchExpertises();
        fetchUsers();
    }, []);

    React.useEffect(() => {
        const fetchOwnerIdFromLogin = async () => {
            try {
                const profile = await authService.getProfile();
                setLoginOwnerId(String(profile.id));
            } catch {
                /* non-critical */
            }
        };
        fetchOwnerIdFromLogin();
    }, []);

    React.useEffect(() => {
        if (!loginOwnerId || !isModalOpen || editingId !== null) return;
        setFormData(prev => ({ ...prev, owner_id: loginOwnerId }));
    }, [loginOwnerId, isModalOpen, editingId]);

    // -----------------------------------------------------------------------
    // Filtering & pagination
    // -----------------------------------------------------------------------

    const filtered = React.useMemo(() => {
        if (!search.trim()) return companyList;
        const q = search.toLowerCase();
        return companyList.filter(c => {
            const d = getCompanyData(c);
            const name = displayBilingual(d.name).toLowerCase();
            const handle = (d.handle || '').toLowerCase();
            const acronym = (d.acronym || '').toLowerCase();
            return name.includes(q) || handle.includes(q) || acronym.includes(q);
        });
    }, [companyList, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const paginatedList = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // -----------------------------------------------------------------------
    // Stats
    // -----------------------------------------------------------------------

    const stats = React.useMemo(() => {
        let active = 0;
        let verified = 0;
        let published = 0;
        for (const c of companyList) {
            const d = getCompanyData(c);
            if (d.active) active++;
            if (d.verified) verified++;
            if (d.published) published++;
        }
        return { total: companyList.length, active, verified, published };
    }, [companyList]);

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

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

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await companyService.deleteCompany(String(deleteTarget.id));
            setCompanyList(prev => prev.filter(c => c.id !== deleteTarget.id));
            setTotalCompanies(prev => prev - 1);
            toast.success(t('companies.deleteSuccess'));
        } catch {
            toast.error(t('companies.deleteFailed'));
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    const handleToggleStatus = async (id: string | number) => {
        try {
            await companyService.togglePublished(String(id));
            setCompanyList(prev =>
                prev.map((c) => {
                    if (c.id !== id) return c;
                    const raw = c as unknown as Record<string, unknown>;
                    const attrs = raw.attributes as Record<string, unknown> | undefined;
                    if (attrs) {
                        return { ...raw, attributes: { ...attrs, published: !attrs.published } } as unknown as Company;
                    }
                    return { ...raw, published: !raw.published } as unknown as Company;
                }),
            );
            toast.success(t('companies.statusToggled'));
        } catch {
            toast.error(t('companies.toggleFailed'));
        }
    };

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
                toast.success(t('companies.updateSuccess'));
            } else {
                await companyService.createCompany(basePayload);
                toast.success(t('companies.createSuccess'));
            }
            await fetchCompanies();
            setIsModalOpen(false);
        } catch {
            toast.error(t('companies.saveFailed'));
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
                    className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 rounded-xl text-sm font-bold text-white hover:bg-teal-700 transition-all shadow-sm"
                >
                    <Plus size={18} />
                    <span>{t('companies.registerCompany')}</span>
                </button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<Building2 size={18} className="text-slate-500" />}
                    label={t('companies.totalCompanies')}
                    value={stats.total}
                    bg="bg-slate-50"
                />
                <StatCard
                    icon={<ShieldCheck size={18} className="text-emerald-500" />}
                    label={t('companies.activeCompanies')}
                    value={stats.active}
                    bg="bg-emerald-50"
                />
                <StatCard
                    icon={<Globe size={18} className="text-teal-500" />}
                    label={t('companies.verifiedCompanies')}
                    value={stats.verified}
                    bg="bg-teal-50"
                />
                <StatCard
                    icon={<Eye size={18} className="text-blue-500" />}
                    label={t('companies.publishedCompanies')}
                    value={stats.published}
                    bg="bg-blue-50"
                />
            </div>

            {/* Company table */}
            <CompanyTable
                companies={paginatedList as Company[]}
                filteredCount={filtered.length}
                page={page}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                search={search}
                onSearchChange={(val) => { setSearch(val); setPage(1); }}
                onPageChange={setPage}
                onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(1); }}
                onEdit={handleOpenModal}
                onDelete={(c) => setDeleteTarget(c)}
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
                allUsers={allUsers}
                loginOwnerId={loginOwnerId}
            />

            {/* Delete confirmation dialog */}
            <DeleteCompanyDialog
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                companyName={deleteTarget ? displayBilingual(getCompanyData(deleteTarget).name) : undefined}
            />
        </div>
    );
};

export default Companies;

// ---------------------------------------------------------------------------
// Internal sub-component
// ---------------------------------------------------------------------------

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    bg: string;
}

/** Small stat card shown at the top of the page. */
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, bg }) => (
    <div className={`rounded-xl border border-slate-100 px-4 py-3.5 flex items-center gap-3 ${bg}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100">
            {icon}
        </div>
        <div>
            <p className="text-lg font-bold text-slate-800">{value}</p>
            <p className="text-[11px] font-medium text-slate-500">{label}</p>
        </div>
    </div>
);
