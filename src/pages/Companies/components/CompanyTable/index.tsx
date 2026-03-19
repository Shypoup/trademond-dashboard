import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Search,
    Edit,
    Trash2,
    MapPin,
    Globe,
} from 'lucide-react';
import { Company } from '@data-types/api';
import { displayBilingual, getStatusStyles, formatDate } from '@utils/ui';
import { getCompanyData } from '../../utils/companyHelpers';

/** Props for the {@link CompanyTable} component. */
export interface CompanyTableProps {
    /** List of company records to render. */
    companies: Company[];
    /** Total number of companies (may differ from `companies.length` when paginated). */
    totalCompanies: number;
    /** Callback when the user clicks the edit button for a company. */
    onEdit: (company: Company) => void;
    /** Callback when the user clicks the delete button for a company. */
    onDelete: (id: string | number) => void;
    /** Callback when the user clicks the status badge to toggle published state. */
    onToggleStatus: (id: string | number) => void;
}

/**
 * Displays the company directory as a searchable table with inline actions.
 * Includes a search toolbar, data rows, and a summary footer.
 */
export const CompanyTable: React.FC<CompanyTableProps> = ({
    companies,
    totalCompanies,
    onEdit,
    onDelete,
    onToggleStatus,
}) => {
    const { t } = useTranslation();

    return (
        <div className="premium-card overflow-hidden bg-white">
            {/* Search toolbar */}
            <div className="p-4 border-b border-slate-50 flex flex-wrap items-center gap-4 bg-slate-50/30">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute inset-y-0 start-4 flex items-center mt-3 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={t('companies.searchPlaceholder')}
                        className="w-full h-11 ps-12 pe-4 bg-white border border-slate-200 focus:border-teal-400 rounded-xl text-sm outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {t('companies.company')}
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {t('companies.location')}
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {t('common.status')}
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {t('companies.joined')}
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-end">
                                {t('common.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {companies.map((c) => {
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
                                                    {d.acronym || t('companies.noAcronym')}
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
                                                <span>{displayBilingual(d.location) || t('companies.distributed')}</span>
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
                                            onClick={() => onToggleStatus(d.id)}
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors hover:opacity-80 ${getStatusStyles(d.active ? 'active' : 'inactive')}`}
                                            title={t('companies.toggleStatus')}
                                        >
                                            {d.active ? t('common.active') : t('common.inactive')}
                                        </button>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-slate-500 font-medium">
                                        {formatDate(d.createdAt)}
                                    </td>
                                    <td className="px-6 py-5 text-end">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => onEdit(c)}
                                                className="text-slate-400 hover:text-blue-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(d.id)}
                                                className="text-slate-400 hover:text-rose-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {companies.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    {t('companies.noCompaniesFound')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
                <p className="text-xs font-semibold text-slate-400">
                    {t('companies.showingTotal', { count: totalCompanies })}
                </p>
            </div>
        </div>
    );
};
