import React from 'react';
import { Filter, RotateCcw, ChevronDown } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { displayBilingual } from '@utils/ui';
import { BilingualText } from '@data-types/api';

/**
 * Props for the ProductToolbar component.
 */
export interface ProductToolbarProps {
    /** Current search query string */
    search: string;
    /** Callback when search query changes */
    onSearchChange: (value: string) => void;
    /** Current category filter value */
    filterCategory: string;
    /** Callback when category filter changes */
    onFilterCategoryChange: (value: string) => void;
    /** Current status filter value */
    filterStatus: string;
    /** Callback when status filter changes */
    onFilterStatusChange: (value: string) => void;
    /** Current company filter value */
    filterCompany: string;
    /** Callback when company filter changes */
    onFilterCompanyChange: (value: string) => void;
    /** Available categories for the filter dropdown */
    categories: Array<{ id: string | number; name: BilingualText }>;
    /** Available companies for the filter dropdown */
    companies: Array<{ id: string | number; name: BilingualText }>;
    /** Number of currently selected products */
    selectedCount: number;
    /** Callback to reset all filters and refresh data */
    onResetFilters: () => void;
}

/**
 * Toolbar with search input, filter dropdowns, refresh, and bulk action controls.
 */
export const ProductToolbar: React.FC<ProductToolbarProps> = ({
    search,
    onSearchChange,
    filterCategory,
    onFilterCategoryChange,
    filterStatus,
    onFilterStatusChange,
    filterCompany,
    onFilterCompanyChange,
    categories,
    companies,
    selectedCount,
    onResetFilters,
}) => {
    return (
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                    type="text"
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="Filter by product name, SKU..."
                    className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
                />
            </div>

            <Select value={filterCategory} onValueChange={(val) => onFilterCategoryChange(val ?? 'all')}>
                <SelectTrigger className="h-9 w-fit min-w-[130px] bg-white border-slate-200 text-slate-600 font-medium px-3">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                            {displayBilingual(c.name)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(val) => onFilterStatusChange(val ?? 'all')}>
                <SelectTrigger className="h-9 w-fit min-w-[110px] bg-white border-slate-200 text-slate-600 font-medium px-3">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
            </Select>

            <Select value={filterCompany} onValueChange={(val) => onFilterCompanyChange(val ?? 'all')}>
                <SelectTrigger className="h-9 w-fit min-w-[130px] bg-white border-slate-200 text-slate-600 font-medium px-3">
                    <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                            {displayBilingual(c.name)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <button
                onClick={onResetFilters}
                title="Reset Filters & Refresh"
                className="h-9 w-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-colors"
            >
                <RotateCcw size={15} />
            </button>

            {selectedCount > 0 && (
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">{selectedCount} selected</span>
                    <button className="h-9 px-4 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                        Bulk Actions <ChevronDown size={13} />
                    </button>
                </div>
            )}
        </div>
    );
};
