import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Search,
    Edit,
    Trash2,
    MapPin,
    Globe,
    ChevronLeft,
    ChevronRight,
    Shield,
    ShieldCheck,
    Building2,
} from 'lucide-react';
import { Company } from '@data-types/api';
import { displayBilingual, formatDate } from '@utils/ui';
import { getCompanyData } from '../../utils/companyHelpers';

/** Props for the {@link CompanyTable} component. */
export interface CompanyTableProps {
    /** Paginated company records to render. */
    companies: Company[];
    /** Total count of filtered companies. */
    filteredCount: number;
    /** Current page number (1-based). */
    page: number;
    /** Total pages available. */
    totalPages: number;
    /** Rows displayed per page. */
    rowsPerPage: number;
    /** Current search query. */
    search: string;
    /** Callback when search value changes. */
    onSearchChange: (value: string) => void;
    /** Page navigation callback. */
    onPageChange: (page: number) => void;
    /** Rows-per-page change callback. */
    onRowsPerPageChange: (n: number) => void;
    /** Callback when the user clicks edit for a company. */
    onEdit: (company: Company) => void;
    /** Callback when the user clicks delete for a company. */
    onDelete: (company: Company) => void;
    /** Callback when the user toggles the published state. */
    onToggleStatus: (id: string | number) => void;
}

/**
 * Company directory table with integrated search bar, status badges,
 * inline actions, and pagination controls.
 */
export const CompanyTable: React.FC<CompanyTableProps> = ({
    companies,
    filteredCount,
    page,
    totalPages,
    rowsPerPage,
    search,
    onSearchChange,
    onPageChange,
    onRowsPerPageChange,
    onEdit,
    onDelete,
    onToggleStatus,
}) => {
    const { t } = useTranslation();

    return (
        <div className="premium-card overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 border-b border-border bg-muted/40 p-4">
                <div className="relative min-w-[280px] flex-1">
                    <Search className="absolute inset-y-0 start-4 mt-3 flex items-center text-muted-foreground" size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={t('companies.searchPlaceholder')}
                        className="h-10 w-full rounded-xl border border-border bg-background ps-11 pe-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
                    />
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Building2 size={14} />
                    <span>
                        {t('companies.filteredCount', { count: filteredCount })}
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {t('companies.company')}
                            </th>
                            <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {t('companies.location')}
                            </th>
                            <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {t('common.status')}
                            </th>
                            <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {t('companies.joined')}
                            </th>
                            <th className="px-6 py-3.5 text-end text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {t('common.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {companies.map((c) => {
                            const d = getCompanyData(c);
                            return (
                                <tr key={d.id} className="hover:bg-muted/50 transition-colors group">
                                    {/* Company info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                                                <img
                                                    src={d.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayBilingual(d.name))}&background=008080&color=fff&size=44`}
                                                    alt={displayBilingual(d.name)}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="truncate text-sm font-bold text-foreground">
                                                        {displayBilingual(d.name)}
                                                    </h5>
                                                    {d.verified && (
                                                        <ShieldCheck size={14} className="text-teal-500 shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {d.acronym && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            {d.acronym}
                                                        </span>
                                                    )}
                                                    {d.handle && (
                                                        <span className="text-[11px] text-muted-foreground">
                                                            @{d.handle}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Location */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={13} className="shrink-0 text-muted-foreground" />
                                                <span className="truncate max-w-[180px]">
                                                    {displayBilingual(d.location) || t('companies.distributed')}
                                                </span>
                                            </div>
                                            {d.industryName && (
                                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                                                    <Globe size={12} className="shrink-0 text-muted-foreground" />
                                                    <span className="truncate max-w-[180px]">
                                                        {displayBilingual(d.industryName)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Status badges */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <button
                                                onClick={() => onToggleStatus(d.id)}
                                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold transition-colors hover:opacity-80 ${
                                                    d.active
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                        : 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300'
                                                }`}
                                                title={t('companies.toggleStatus')}
                                            >
                                                <Shield size={10} />
                                                {d.active ? t('common.active') : t('common.inactive')}
                                            </button>
                                            <span
                                                className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                    d.published
                                                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}
                                            >
                                                {d.published ? t('common.published') : t('common.unpublished')}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-4 text-xs text-muted-foreground font-medium whitespace-nowrap">
                                        {formatDate(d.createdAt)}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-end">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEdit(c)}
                                                className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary"
                                                title={t('common.edit')}
                                            >
                                                <Edit size={15} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(c)}
                                                className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                                                title={t('common.delete')}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {companies.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Building2 size={36} className="text-muted-foreground/30" />
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {t('companies.noCompaniesFound')}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-3.5">
                <div className="flex items-center gap-3">
                    <p className="text-xs font-medium text-muted-foreground">
                        {t('companies.rowsPerPage')}
                    </p>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                        className="h-7 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring/30"
                    >
                        {[10, 25, 50].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                        {t('companies.pageOf', { page, totalPages })}
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
