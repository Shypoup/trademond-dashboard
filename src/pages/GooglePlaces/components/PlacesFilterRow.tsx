import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Loader2, MapPin, Search, Store } from 'lucide-react';
import type { GooglePlacesLanguage } from '@services/googlePlacesAdminService';
import { cn } from '@utils/core/cn';
import { PlacesThemedSelect } from '@pages/GooglePlaces/components/PlacesThemedSelect';

export interface PlacesFilterRowProps {
  /** Current keyword query. */
  query: string;
  /** Updates keyword query. */
  onQueryChange: (value: string) => void;
  /** Region string sent to the API. */
  region: string;
  /** Updates region. */
  onRegionChange: (value: string) => void;
  /** City filter. */
  city: string;
  /** Updates city. */
  onCityChange: (value: string) => void;
  /** Response language mode. */
  language: GooglePlacesLanguage;
  /** Updates language mode. */
  onLanguageChange: (value: GooglePlacesLanguage) => void;
  /** True while the search request is in flight. */
  loading: boolean;
  /** Fires the search action. */
  onSearch: () => void;
}

const inputShell =
  'relative w-full min-w-0 rounded-lg border border-border bg-muted/60 dark:bg-muted/40';

const fieldLabel = 'text-[10px] font-bold uppercase tracking-wide text-muted-foreground';

/**
 * Single-row filters: keyword, city, region, language, and icon-only search (matches import UI mockup).
 */
export function PlacesFilterRow({
  query,
  onQueryChange,
  region,
  onRegionChange,
  city,
  onCityChange,
  language,
  onLanguageChange,
  loading,
  onSearch,
}: PlacesFilterRowProps) {
  const { t } = useTranslation();

  const languageOptions = React.useMemo(
    () => [
      { value: 'en' as const, label: t('googlePlacesPage.langOptionEn') },
      { value: 'ar' as const, label: t('googlePlacesPage.langOptionAr') },
      { value: 'both' as const, label: t('googlePlacesPage.langOptionBoth') },
    ],
    [t],
  );

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-nowrap lg:items-end">
      <label className={cn('flex min-w-0 flex-1 flex-col gap-1.5')}>
        <span className={fieldLabel}>{t('googlePlacesPage.businessKeyword')}</span>
        <div className={inputShell}>
          <Store className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="text"
            name="google-places-keyword"
            autoComplete="off"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="relative z-[1] h-10 w-full min-w-0 rounded-lg border-0 bg-transparent py-2 ps-9 pe-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder={t('googlePlacesPage.queryPlaceholder')}
          />
        </div>
      </label>

      <label className={cn('flex min-w-0 flex-1 flex-col gap-1.5')}>
        <span className={fieldLabel}>{t('googlePlacesPage.city')}</span>
        <div className={inputShell}>
          <MapPin className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="text"
            name="google-places-city"
            autoComplete="off"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="relative z-[1] h-10 w-full min-w-0 rounded-lg border-0 bg-transparent py-2 ps-9 pe-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder={t('googlePlacesPage.cityPlaceholder')}
          />
        </div>
      </label>

      <label className={cn('flex min-w-0 flex-1 flex-col gap-1.5')}>
        <span className={fieldLabel}>{t('googlePlacesPage.region')}</span>
        <div className={inputShell}>
          <Globe className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="text"
            name="google-places-region"
            autoComplete="off"
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="relative z-[1] h-10 w-full min-w-0 rounded-lg border-0 bg-transparent py-2 ps-9 pe-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder={t('googlePlacesPage.regionPlaceholder')}
          />
        </div>
      </label>

      <label className={cn('flex w-full min-w-[9rem] flex-col gap-1.5 lg:max-w-[12rem]')}>
        <span className={fieldLabel}>{t('googlePlacesPage.language')}</span>
        <PlacesThemedSelect
          value={language}
          onValueChange={(v) => onLanguageChange(v as GooglePlacesLanguage)}
          options={languageOptions}
          aria-label={t('googlePlacesPage.language')}
          triggerClassName="lg:max-w-[12rem]"
        />
      </label>

      <div className="flex pb-0.5 lg:shrink-0">
        <button
          type="button"
          disabled={loading}
          onClick={onSearch}
          aria-label={t('googlePlacesPage.runSearch')}
          className={cn(
            'inline-flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-colors',
            'hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          {loading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Search className="size-5" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
