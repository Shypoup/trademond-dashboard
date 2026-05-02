import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { displayBilingual } from '@utils/ui';
import { cn } from '@utils/core/cn';
import { PlacesThemedSelect } from '@pages/GooglePlaces/components/PlacesThemedSelect';

export interface PlacesBulkImportBarProps {
  /** Number of places selected for bulk import. */
  selectedCount: number;
  /** Selected category id for the import payload. */
  categoryId: string;
  /** Fires when the category select changes. */
  onCategoryIdChange: (value: string) => void;
  /** Selected industry id for the import payload. */
  industryId: string;
  /** Fires when the industry select changes. */
  onIndustryIdChange: (value: string) => void;
  /** Category options from API. */
  categories: { id: string | number; name: Record<string, string> }[];
  /** Industry options from API. */
  industries: { id: string; name: Record<string, string> }[];
  /** Clears all row selections. */
  onClearSelection: () => void;
  /** Queues import for all selected place ids. */
  onImportSelected: () => void;
  /** True while a bulk import request is in flight. */
  bulkImporting: boolean;
  /** Disables actions (e.g. global search loading). */
  disabled?: boolean;
}

/**
 * Sticky bulk-action strip: selection count, category & industry selects, clear, and primary import control.
 * Import is disabled until both category and industry are chosen.
 */
export function PlacesBulkImportBar({
  selectedCount,
  categoryId,
  onCategoryIdChange,
  industryId,
  onIndustryIdChange,
  categories,
  industries,
  onClearSelection,
  onImportSelected,
  bulkImporting,
  disabled = false,
}: PlacesBulkImportBarProps) {
  const { t } = useTranslation();

  const categoryOptions = React.useMemo(
    () =>
      categories.map((c) => ({
        value: String(c.id),
        label: displayBilingual(c.name),
      })),
    [categories],
  );

  const industryOptions = React.useMemo(
    () =>
      industries.map((i) => ({
        value: String(i.id),
        label: displayBilingual(i.name),
      })),
    [industries],
  );

  if (selectedCount <= 0) return null;

  const taxonomyComplete = categoryId.trim() !== '' && industryId.trim() !== '';

  return (
    <div
      role="region"
      aria-label={t('googlePlacesPage.bulkBarRegionAria')}
      className={cn(
        'sticky bottom-0 z-10 mx-2 mb-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg',
        'dark:border-border dark:bg-card/95 dark:shadow-xl',
      )}
    >
      <div className="mx-auto flex max-w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="inline-flex w-fit rounded-md bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
            {t('googlePlacesPage.selectedCount', { count: selectedCount })}
          </span>

          <label className="flex min-w-[10rem] flex-col gap-1 sm:max-w-[14rem]">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('googlePlacesPage.bulkBarCategory')}
            </span>
            <PlacesThemedSelect
              value={categoryId}
              onValueChange={onCategoryIdChange}
              options={categoryOptions}
              optionalNone
              noneLabel={t('googlePlacesPage.none')}
              disabled={disabled || bulkImporting}
              aria-label={t('googlePlacesPage.bulkBarCategory')}
            />
          </label>

          <label className="flex min-w-[10rem] flex-col gap-1 sm:max-w-[14rem]">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('googlePlacesPage.bulkBarIndustry')}
            </span>
            <PlacesThemedSelect
              value={industryId}
              onValueChange={onIndustryIdChange}
              options={industryOptions}
              optionalNone
              noneLabel={t('googlePlacesPage.none')}
              disabled={disabled || bulkImporting}
              aria-label={t('googlePlacesPage.bulkBarIndustry')}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClearSelection}
            disabled={disabled || bulkImporting}
            className="text-sm font-bold text-primary underline-offset-4 hover:underline disabled:opacity-50"
          >
            {t('googlePlacesPage.clearSelection')}
          </button>
          <Button
            type="button"
            size="default"
            disabled={disabled || bulkImporting || !taxonomyComplete}
            onClick={onImportSelected}
            aria-label={
              taxonomyComplete
                ? t('googlePlacesPage.importBusinesses')
                : t('googlePlacesPage.importTaxonomyRequiredAria')
            }
            className="h-11 gap-2 bg-primary px-6 font-bold text-primary-foreground hover:bg-primary/90"
          >
            {bulkImporting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="size-4" aria-hidden />
            )}
            {t('googlePlacesPage.importBusinesses')}
          </Button>
        </div>
      </div>
    </div>
  );
}
