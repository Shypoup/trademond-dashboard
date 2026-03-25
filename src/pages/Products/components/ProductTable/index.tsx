import React from 'react';
import {
    Search,
    ExternalLink,
    Edit,
    Trash2,
    Loader2,
    ToggleLeft,
    ToggleRight,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from '@data-types/api';
import { displayBilingual, formatCurrency } from '@utils/ui';
import { getProductData, getStatus, timeAgo, ROWS_OPTIONS } from '../../utils/productHelpers';

/**
 * Props for the ProductTable component.
 */
export interface ProductTableProps {
    /** Products to display in the current page */
    paginatedList: Product[];
    /** Total number of filtered products */
    filteredCount: number;
    /** Set of selected product IDs */
    selected: Set<string>;
    /** ID of the product currently being toggled (e.g. "active-123") */
    togglingId: string | null;
    /** Current page number (1-indexed) */
    page: number;
    /** Total number of pages */
    totalPages: number;
    /** Number of rows per page */
    rowsPerPage: number;
    /** Callback when page changes */
    onPageChange: (page: number) => void;
    /** Callback when rows per page changes */
    onRowsPerPageChange: (rows: number) => void;
    /** Callback to toggle selection of a single product */
    onToggleSelect: (id: string) => void;
    /** Callback to toggle selection of all visible products */
    onToggleSelectAll: () => void;
    /** Callback to open the detail drawer for a product */
    onViewDetail: (product: Product) => void;
    /** Callback to open the edit form for a product */
    onEdit: (product: Product) => void;
    /** Callback to initiate product deletion */
    onDelete: (id: string | number) => void;
    /** Callback to toggle active status */
    onToggleActive: (id: string | number) => void;
    /** Callback to toggle published status */
    onTogglePublished: (id: string | number) => void;
}

/**
 * Product data table with selection, action buttons, and pagination controls.
 */
export const ProductTable: React.FC<ProductTableProps> = ({
    paginatedList,
    filteredCount,
    selected,
    togglingId,
    page,
    totalPages,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onToggleSelect,
    onToggleSelectAll,
    onViewDetail,
    onEdit,
    onDelete,
    onToggleActive,
    onTogglePublished,
}) => {
    /** Builds an array of page numbers with ellipsis markers. */
    const pageNumbers = (): (number | '...')[] => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push('...');
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
            if (page < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border bg-muted/40">
                            <th className="pl-5 pr-3 py-3 w-10">
                                <input
                                    type="checkbox"
                                    checked={paginatedList.length > 0 && selected.size === paginatedList.length}
                                    onChange={onToggleSelectAll}
                                    className="cursor-pointer rounded border-border text-primary focus:ring-ring"
                                />
                            </th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Company</th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Views</th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Price</th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Updated</th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {paginatedList.map((p) => {
                            const data = getProductData(p);
                            const status = getStatus(data);
                            const isSelected = selected.has(String(p.id));
                            return (
                                <tr key={p.id} className={`transition-colors ${isSelected ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-muted/50'}`}>
                                    <td className="pl-5 pr-3 py-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleSelect(String(p.id))}
                                            className="cursor-pointer rounded border-border text-primary focus:ring-ring"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                                                <img
                                                    src={data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayBilingual(data.name))}&background=1e293b&color=94a3b8&size=44`}
                                                    alt={displayBilingual(data.name)}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="max-w-[160px] truncate text-[13.5px] font-semibold text-foreground">{displayBilingual(data.name)}</span>
                                                    {data.premium && (
                                                        <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">Premium</span>
                                                    )}
                                                </div>
                                                {data.sku && (
                                                    <p className="mt-0.5 text-[11px] text-muted-foreground">SKU: {data.sku}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-[13px] font-semibold text-primary">{displayBilingual(data.companyName)}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-[13px] text-muted-foreground">{displayBilingual(data.categoryName)}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Badge variant="outline" className={`${status.bg} ${status.text} border-transparent font-bold text-[11px]`}>
                                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${status.dot}`} />
                                            {status.label}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="text-[13px] font-bold text-foreground">{data.views > 0 ? data.views.toLocaleString() : '—'}</span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="text-[14px] font-black text-foreground">
                                            {data.price !== null && data.price !== '' && data.price !== undefined
                                                ? formatCurrency(data.price)
                                                : '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-[12px] font-medium text-muted-foreground">{timeAgo(data.updatedAt || data.createdAt)}</span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon-sm" onClick={() => onViewDetail(p)} className="text-muted-foreground hover:bg-muted hover:text-primary">
                                                <ExternalLink size={15} />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon-sm"
                                                onClick={() => onToggleActive(p.id)}
                                                disabled={togglingId === `active-${p.id}`}
                                                className={data.active ? 'text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400' : 'text-muted-foreground hover:bg-muted'}
                                            >
                                                {togglingId === `active-${p.id}` ? <Loader2 size={15} className="animate-spin" /> : data.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon-sm"
                                                onClick={() => onTogglePublished(p.id)}
                                                disabled={togglingId === `pub-${p.id}`}
                                                className={data.published ? 'text-sky-600 hover:bg-sky-500/10 dark:text-sky-400' : 'text-muted-foreground hover:bg-muted'}
                                            >
                                                {togglingId === `pub-${p.id}` ? <Loader2 size={15} className="animate-spin" /> : data.published ? <Eye size={15} /> : <EyeOff size={15} />}
                                            </Button>
                                            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(p)} className="text-muted-foreground hover:bg-muted hover:text-primary">
                                                <Edit size={15} />
                                            </Button>
                                            <Button variant="ghost" size="icon-sm" onClick={() => onDelete(p.id)} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                                                <Trash2 size={15} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {paginatedList.length === 0 && (
                            <tr>
                                <td colSpan={9} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                            <Search size={18} />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">No products found</p>
                                        <p className="text-xs text-muted-foreground/80">Try adjusting your filters</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3">
                <div className="flex items-center gap-4">
                    <p className="text-xs text-muted-foreground">
                        Showing <span className="font-semibold text-foreground">{filteredCount === 0 ? 0 : (page - 1) * rowsPerPage + 1}-{Math.min(page * rowsPerPage, filteredCount)}</span> of <span className="font-semibold text-foreground">{filteredCount.toLocaleString()}</span> products
                    </p>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rows:</span>
                        {ROWS_OPTIONS.map(n => (
                            <button
                                key={n}
                                onClick={() => onRowsPerPageChange(n)}
                                className={`rounded px-2 py-0.5 text-xs font-semibold transition-colors ${rowsPerPage === n ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft size={15} />
                    </button>
                    {pageNumbers().map((pg, i) =>
                        pg === '...'
                            ? <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">...</span>
                            : <button
                                key={pg}
                                onClick={() => onPageChange(pg as number)}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${page === pg ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                            >
                                {pg}
                            </button>
                    )}
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight size={15} />
                    </button>
                </div>
            </div>
        </>
    );
};
