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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/40">
                <div className="flex-1 min-w-[280px] relative">
                    <Search className="absolute inset-y-0 start-4 flex items-center mt-3 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={t('companies.searchPlaceholder')}
                        className="w-full h-10 ps-11 pe-4 bg-white border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/10 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
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
                        <tr className="border-b border-slate-100 bg-slate-50/30">
                            <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {t('companies.company')}
                            </th>
                            <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {t('companies.location')}
                            </th>
                            <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {t('common.status')}
                            </th>
                            <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {t('companies.joined')}
                            </th>
                            <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-end">
                                {t('common.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {companies.map((c) => {
                            const d = getCompanyData(c);
                            return (
                                <tr key={d.id} className="hover:bg-slate-50/60 transition-colors group">
                                    {/* Company info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-11 h-11 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 shrink-0">
                                                <img
                                                    src={d.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayBilingual(d.name))}&background=008080&color=fff&size=44`}
                                                    alt={displayBilingual(d.name)}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="text-sm font-bold text-slate-800 truncate">
                                                        {displayBilingual(d.name)}
                                                    </h5>
                                                    {d.verified && (
                                                        <ShieldCheck size={14} className="text-teal-500 shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {d.acronym && (
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                                            {d.acronym}
                                                        </span>
                                                    )}
                                                    {d.handle && (
                                                        <span className="text-[11px] text-slate-400">
                                                            @{d.handle}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Location */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-xs text-slate-600 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={13} className="text-slate-400 shrink-0" />
                                                <span className="truncate max-w-[180px]">
                                                    {displayBilingual(d.location) || t('companies.distributed')}
                                                </span>
                                            </div>
                                            {d.industryName && (
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                                    <Globe size={12} className="text-slate-300 shrink-0" />
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
                                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors hover:opacity-80 ${
                                                    d.active
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : 'bg-rose-50 text-rose-500 border-rose-100'
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
                                    <td className="px-6 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                                        {formatDate(d.createdAt)}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-end">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEdit(c)}
                                                className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-all"
                                                title={t('common.edit')}
                                            >
                                                <Edit size={15} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(c)}
                                                className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-all"
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
                                        <Building2 size={36} className="text-slate-200" />
                                        <p className="text-sm text-slate-400 font-medium">
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
            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <p className="text-xs font-medium text-slate-400">
                        {t('companies.rowsPerPage')}
                    </p>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                        className="h-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 px-2 outline-none focus:border-teal-400"
                    >
                        {[10, 25, 50].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">
                        {t('companies.pageOf', { page, totalPages })}
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
