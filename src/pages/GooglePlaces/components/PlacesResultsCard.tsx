import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, MapPin, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { displayBilingual } from '@utils/ui';
import { cn } from '@utils/core/cn';
import {
  displayName,
  placeIdOf,
  rowAddress,
  rowIsImported,
  rowMapsUrl,
  rowPhone,
  rowWebsite,
} from '@pages/GooglePlaces/utils/placeRowHelpers';

const PAGE_SIZE = 10;
const MAX_PAGE_BUTTONS = 5;

/**
 * Page numbers to show when total pages exceeds {@link MAX_PAGE_BUTTONS} (window around current).
 */
function visiblePageNumbers(current: number, total: number): number[] {
  if (total <= MAX_PAGE_BUTTONS) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(MAX_PAGE_BUTTONS / 2);
  let start = Math.max(1, current - half);
  let end = start + MAX_PAGE_BUTTONS - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - MAX_PAGE_BUTTONS + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export interface PlacesResultsCardProps {
  /** Places returned from search. */
  places: Array<Record<string, unknown>>;
  /** Current results page (1-based). */
  resultsPage: number;
  /** Sets the results page (1-based). */
  onResultsPageChange: (page: number) => void;
  /** Industry default for single-row import payload. */
  industryId: string;
  onIndustryIdChange: (value: string) => void;
  /** Category default for single-row import payload. */
  categoryId: string;
  onCategoryIdChange: (value: string) => void;
  industries: { id: string; name: Record<string, string> }[];
  categories: { id: string | number; name: Record<string, string> }[];
  /** Place id currently being imported (disables that row’s import control). */
  importingPlaceId: string | null;
  /** Global busy state (e.g. search in flight). */
  loading: boolean;
  /** Imports one place by Google Place id. */
  onImportPlace: (googlePlaceId: string) => void;
}

/**
 * Results table with optional industry/category defaults, per-row import, badges, and pagination.
 */
export function PlacesResultsCard({
  places,
  resultsPage,
  onResultsPageChange,
  industryId,
  onIndustryIdChange,
  categoryId,
  onCategoryIdChange,
  industries,
  categories,
  importingPlaceId,
  loading,
  onImportPlace,
}: PlacesResultsCardProps) {
  const { t, i18n } = useTranslation();

  const rowsWithId = React.useMemo(
    () =>
      places
        .map((row) => ({ row, id: placeIdOf(row) }))
        .filter((x): x is { row: Record<string, unknown>; id: string } => Boolean(x.id)),
    [places],
  );

  const total = rowsWithId.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(resultsPage, totalPages);
  const pageNumbers = visiblePageNumbers(safePage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageRows = rowsWithId.slice(startIdx, startIdx + PAGE_SIZE);

  const from = total === 0 ? 0 : startIdx + 1;
  const to = Math.min(startIdx + PAGE_SIZE, total);

  return (
    <div className="premium-card overflow-hidden">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-sm font-bold text-foreground">{t('googlePlacesPage.results')}</h2>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('googlePlacesPage.optionalIndustry')}
            </span>
            <select
              value={industryId}
              onChange={(e) => onIndustryIdChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-muted/60 px-3 text-sm dark:bg-muted/40"
            >
              <option value="">{t('googlePlacesPage.none')}</option>
              {industries.map((i) => (
                <option key={i.id} value={i.id}>
                  {displayBilingual(i.name)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('googlePlacesPage.optionalCategory')}
            </span>
            <select
              value={categoryId}
              onChange={(e) => onCategoryIdChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-muted/60 px-3 text-sm dark:bg-muted/40"
            >
              <option value="">{t('googlePlacesPage.none')}</option>
              {categories.map((c) => (
                <option key={String(c.id)} value={String(c.id)}>
                  {displayBilingual(c.name)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-start">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t('googlePlacesPage.colBusinessName')}
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t('googlePlacesPage.colAddress')}
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t('googlePlacesPage.colPhone')}
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t('googlePlacesPage.colWebsite')}
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t('googlePlacesPage.colStatus')}
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t('googlePlacesPage.colAction')}
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(({ row, id: pid }) => {
              const imported = rowIsImported(row);
              const website = rowWebsite(row);
              const phone = rowPhone(row);
              const address = rowAddress(row);
              const rowLabel = displayName(row, { locale: i18n.language });
              const rowBusy = importingPlaceId === pid;
              return (
                <tr key={pid} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-4 align-top">
                    <div className="text-sm font-bold text-foreground">{rowLabel}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      <span className="font-medium">{t('googlePlacesPage.idLabel')}</span> {pid}
                    </div>
                  </td>
                  <td className="max-w-[14rem] px-4 py-4 align-top text-sm text-muted-foreground">
                    {address || t('googlePlacesPage.cellEmpty')}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 align-top text-sm text-muted-foreground">
                    {phone || t('googlePlacesPage.cellEmpty')}
                  </td>
                  <td className="max-w-[12rem] px-4 py-4 align-top text-sm">
                    {website ? (
                      <a
                        href={website.startsWith('http') ? website : `https://${website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                      >
                        {!imported ? <ExternalLink className="size-3.5 shrink-0" aria-hidden /> : null}
                        <span className="line-clamp-2">{website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    ) : (
                      t('googlePlacesPage.cellEmpty')
                    )}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    {imported ? (
                      <Badge
                        variant="secondary"
                        className="rounded-md border-0 bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
                      >
                        {t('googlePlacesPage.statusImported')}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="rounded-md border-0 bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary"
                      >
                        {t('googlePlacesPage.statusNew')}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    {imported ? (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {t('googlePlacesPage.actionLinked')}
                      </span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={rowMapsUrl(row, pid)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t('googlePlacesPage.openInMaps')}
                          className="inline-flex text-muted-foreground transition-colors hover:text-primary"
                        >
                          <MapPin className="size-5" />
                        </a>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={loading || rowBusy}
                          onClick={() => onImportPlace(pid)}
                          aria-label={t('googlePlacesPage.importRowAriaLabel', { name: rowLabel })}
                          className="h-8 gap-1.5 text-xs font-bold"
                        >
                          {rowBusy ? (
                            <Loader2 className="size-3.5 animate-spin" aria-hidden />
                          ) : (
                            <Upload className="size-3.5" aria-hidden />
                          )}
                          {t('googlePlacesPage.importRow')}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {t('googlePlacesPage.showingResults', {
            from: from.toLocaleString(i18n.language),
            to: to.toLocaleString(i18n.language),
            total: total.toLocaleString(i18n.language),
          })}
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={safePage <= 1}
            onClick={() => onResultsPageChange(safePage - 1)}
            aria-label={t('googlePlacesPage.prevPage')}
            className="size-9 rounded-lg border-border"
          >
            <ChevronLeft className="size-4" />
          </Button>
          {pageNumbers.map((p) => (
            <Button
              key={p}
              type="button"
              variant={p === safePage ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onResultsPageChange(p)}
              aria-label={t('googlePlacesPage.pageNumber', { page: p })}
              aria-current={p === safePage ? 'page' : undefined}
              className={cn(
                'size-9 rounded-lg text-sm font-bold',
                p === safePage ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground',
              )}
            >
              {p}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={safePage >= totalPages}
            onClick={() => onResultsPageChange(safePage + 1)}
            aria-label={t('googlePlacesPage.nextPage')}
            className="size-9 rounded-lg border-primary/50 text-primary hover:bg-primary/10"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
