import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils/core/cn';

export type TagsStatusFilterValue = '' | 'active' | 'hidden';
export type TagsNeedsReviewFilterValue = '' | 'yes' | 'no';
export type TagsSortKey = 'name' | 'slug' | 'status' | 'needs_review' | 'created_at';

export interface TagsFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: TagsStatusFilterValue;
  onStatusFilterChange: (v: TagsStatusFilterValue) => void;
  needsReviewFilter: TagsNeedsReviewFilterValue;
  onNeedsReviewFilterChange: (v: TagsNeedsReviewFilterValue) => void;
  sortKey: TagsSortKey;
  sortDesc: boolean;
  onSortKeyChange: (v: TagsSortKey) => void;
  onSortDescChange: (v: boolean) => void;
  perPage: number;
  onPerPageChange: (v: number) => void;
  className?: string;
}

/**
 * Search, optional filters, sort, and page size for the admin tags index.
 */
export function TagsFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  needsReviewFilter,
  onNeedsReviewFilterChange,
  sortKey,
  sortDesc,
  onSortKeyChange,
  onSortDescChange,
  perPage,
  onPerPageChange,
  className,
}: TagsFiltersProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-4 md:flex-row md:flex-wrap md:items-end',
        className,
      )}
    >
      <div className="min-w-[200px] flex-1 space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {t('common.search')}
        </label>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
          placeholder={t('tagsPage.searchPlaceholder')}
        />
      </div>

      <div className="min-w-[140px] space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {t('tagsPage.filterStatus')}
        </label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as TagsStatusFilterValue)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
        >
          <option value="">{t('tagsPage.filterStatusAll')}</option>
          <option value="active">{t('tagsPage.filterStatusActive')}</option>
          <option value="hidden">{t('tagsPage.filterStatusHidden')}</option>
        </select>
      </div>

      <div className="min-w-[160px] space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {t('tagsPage.filterNeedsReview')}
        </label>
        <select
          value={needsReviewFilter}
          onChange={(e) =>
            onNeedsReviewFilterChange(e.target.value as TagsNeedsReviewFilterValue)
          }
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
        >
          <option value="">{t('tagsPage.filterNeedsReviewAll')}</option>
          <option value="yes">{t('tagsPage.filterNeedsReviewYes')}</option>
          <option value="no">{t('tagsPage.filterNeedsReviewNo')}</option>
        </select>
      </div>

      <div className="min-w-[160px] space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {t('tagsPage.sortLabel')}
        </label>
        <div className="flex gap-2">
          <select
            value={sortKey}
            onChange={(e) => onSortKeyChange(e.target.value as TagsSortKey)}
            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
          >
            <option value="name">{t('tagsPage.sortName')}</option>
            <option value="slug">{t('tagsPage.sortSlug')}</option>
            <option value="status">{t('tagsPage.sortStatus')}</option>
            <option value="needs_review">{t('tagsPage.sortNeedsReview')}</option>
            <option value="created_at">{t('tagsPage.sortCreatedAt')}</option>
          </select>
          <button
            type="button"
            onClick={() => onSortDescChange(!sortDesc)}
            className="shrink-0 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs font-bold uppercase text-muted-foreground hover:bg-muted"
            aria-pressed={sortDesc}
          >
            {sortDesc ? t('tagsPage.sortDesc') : t('tagsPage.sortAsc')}
          </button>
        </div>
      </div>

      <div className="min-w-[100px] space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {t('tagsPage.perPage')}
        </label>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
        >
          {[15, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
