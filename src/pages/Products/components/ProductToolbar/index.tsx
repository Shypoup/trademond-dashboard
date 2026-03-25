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
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/40 px-5 py-4">
            <div className="relative min-w-[220px] flex-1">
                <Filter className="pointer-events-none absolute start-3 top-1/2 size-[15px] -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="Filter by product name, SKU..."
                    className="h-9 w-full rounded-lg border border-border bg-background ps-9 pe-4 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
            </div>

            <Select value={filterCategory} onValueChange={(val) => onFilterCategoryChange(val ?? 'all')}>
                <SelectTrigger className="h-9 w-fit min-w-[130px] border-border bg-background px-3 font-medium text-foreground">
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
                <SelectTrigger className="h-9 w-fit min-w-[110px] border-border bg-background px-3 font-medium text-foreground">
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
                <SelectTrigger className="h-9 w-fit min-w-[130px] border-border bg-background px-3 font-medium text-foreground">
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
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
                <RotateCcw size={15} />
            </button>

            {selectedCount > 0 && (
                <div className="ms-auto flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">{selectedCount} selected</span>
                    <button type="button" className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-muted px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted/80">
                        Bulk Actions <ChevronDown size={13} />
                    </button>
                </div>
            )}
        </div>
    );
};
