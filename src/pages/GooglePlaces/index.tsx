import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Search, History, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import {
  googlePlacesAdminService,
  type GooglePlacesLanguage,
  type GooglePlacesImportPlaceRow,
} from '@services/googlePlacesAdminService';
import { taxonomyService } from '@services/taxonomyService';
import { categoryService } from '@services/categoryService';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';
import { cn } from '@utils/core/cn';
import { PlacesFilterRow } from '@pages/GooglePlaces/components/PlacesFilterRow';
import { PlacesResultsCard } from '@pages/GooglePlaces/components/PlacesResultsCard';
import { GooglePlacesImportsTable } from '@pages/GooglePlaces/components/GooglePlacesImportsTable';
import { GooglePlacesUsageReport } from '@pages/GooglePlaces/components/GooglePlacesUsageReport';
import {
  type GooglePlacesQuotaBanner,
  parsePlacesFromSearchResponse,
  placeIdOf,
  quotaBannerFromSearchResponse,
  quotaBannerFromUsage,
} from '@pages/GooglePlaces/utils/placeRowHelpers';

type Tab = 'search' | 'imports' | 'usage';

/**
 * Extracts array from list API responses.
 */
function asRows(res: unknown): unknown[] {
  if (!res || typeof res !== 'object') return [];
  const r = res as Record<string, unknown>;
  const data = r.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(r.results)) return r.results;
  return [];
}

/**
 * Admin Google Places search, import, history, and usage.
 */
const GooglePlaces = () => {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = React.useState<Tab>('search');
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [importsLoading, setImportsLoading] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [region, setRegion] = React.useState('');
  const [city, setCity] = React.useState('');
  const [language, setLanguage] = React.useState<GooglePlacesLanguage>('en');
  const [places, setPlaces] = React.useState<Array<Record<string, unknown>>>([]);
  const [resultsPage, setResultsPage] = React.useState(1);
  const [bulkImporting, setBulkImporting] = React.useState(false);
  const [industryId, setIndustryId] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [industries, setIndustries] = React.useState<{ id: string; name: Record<string, string> }[]>([]);
  const [categories, setCategories] = React.useState<{ id: string | number; name: Record<string, string> }[]>([]);
  const [imports, setImports] = React.useState<unknown[]>([]);
  const [usageFrom, setUsageFrom] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [usageTo, setUsageTo] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [usageRaw, setUsageRaw] = React.useState<unknown>(null);
  const [usageLoading, setUsageLoading] = React.useState(false);
  const [quota, setQuota] = React.useState<GooglePlacesQuotaBanner | null>(null);

  React.useEffect(() => {
    const loadTax = async () => {
      try {
        const [indRes, catRes] = await Promise.all([
          taxonomyService.getIndustries({ per_page: 200 }),
          categoryService.getCategories({ per_page: 300 }),
        ]);
        setIndustries((indRes.data ?? []) as { id: string; name: Record<string, string> }[]);
        setCategories((catRes.data ?? []) as { id: string | number; name: Record<string, string> }[]);
      } catch (e) {
        showApiErrorToast(e, t, i18n.language);
      }
    };
    void loadTax();
  }, [t, i18n.language]);

  React.useEffect(() => {
    const loadQuota = async () => {
      try {
        const fromD = new Date();
        fromD.setDate(fromD.getDate() - 30);
        const from = fromD.toISOString().slice(0, 10);
        const to = new Date().toISOString().slice(0, 10);
        const res = await googlePlacesAdminService.getUsage({ from, to });
        const banner = quotaBannerFromUsage(res);
        if (banner) setQuota(banner);
      } catch {
        setQuota(null);
      }
    };
    void loadQuota();
  }, []);

  const runSearch = async () => {
    if (!query.trim()) {
      toast.error(t('googlePlacesPage.queryRequired'));
      return;
    }
    setSearchLoading(true);
    try {
      const res = await googlePlacesAdminService.search({
        query: query.trim(),
        region: region.trim() || undefined,
        city: city.trim() || undefined,
        language,
      });
      setPlaces(parsePlacesFromSearchResponse(res));
      const searchQuota = quotaBannerFromSearchResponse(res);
      if (searchQuota) setQuota(searchQuota);
      setResultsPage(1);
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
      setPlaces([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const BULK_IMPORT_CHUNK = 20;

  const runBulkImport = async (googlePlaceIds: string[]) => {
    if (googlePlaceIds.length === 0) return;
    if (!categoryId.trim() || !industryId.trim()) {
      toast.error(t('googlePlacesPage.importTaxonomyRequired'));
      return;
    }
    setBulkImporting(true);
    try {
      for (let i = 0; i < googlePlaceIds.length; i += BULK_IMPORT_CHUNK) {
        const slice = googlePlaceIds.slice(i, i + BULK_IMPORT_CHUNK);
        const placesPayload: GooglePlacesImportPlaceRow[] = slice.map((googlePlaceId) => ({
          googlePlaceId,
          industryId: industryId || null,
          categoryId: categoryId || null,
        }));
        await googlePlacesAdminService.importPlaces({
          language,
          places: placesPayload,
        });
      }
      toast.success(t('googlePlacesPage.importQueued'));
      setPlaces((prev) =>
        prev.map((row) => {
          const pid = placeIdOf(row);
          if (pid && googlePlaceIds.includes(pid)) return { ...row, alreadyImported: true };
          return row;
        }),
      );
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setBulkImporting(false);
    }
  };

  const loadImports = React.useCallback(async () => {
    setImportsLoading(true);
    try {
      const res = await googlePlacesAdminService.listImports({ per_page: 50 });
      setImports(asRows(res));
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setImportsLoading(false);
    }
  }, [t, i18n.language]);

  const loadUsage = React.useCallback(async () => {
    setUsageLoading(true);
    try {
      const res = await googlePlacesAdminService.getUsage({ from: usageFrom, to: usageTo });
      setUsageRaw(res);
      const banner = quotaBannerFromUsage(res);
      if (banner) setQuota(banner);
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
      setUsageRaw(null);
    } finally {
      setUsageLoading(false);
    }
  }, [usageFrom, usageTo, t, i18n.language]);

  React.useEffect(() => {
    if (tab === 'imports') void loadImports();
    if (tab === 'usage') void loadUsage();
  }, [tab, loadImports, loadUsage]);

  const tabs: { id: Tab; icon: typeof Search; labelKey: string }[] = [
    { id: 'search', icon: Search, labelKey: 'googlePlacesPage.tabSearch' },
    { id: 'imports', icon: History, labelKey: 'googlePlacesPage.tabImports' },
    { id: 'usage', icon: BarChart3, labelKey: 'googlePlacesPage.tabUsage' },
  ];

  const quotaPct =
    quota?.variant === 'usedTotal' && quota.limit > 0
      ? Math.min(100, Math.round((quota.used / quota.limit) * 100))
      : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-foreground">{t('googlePlacesPage.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('googlePlacesPage.subtitle')}</p>
        </div>
        {quota?.variant === 'usedTotal' ? (
          <div className="lg:max-w-xs lg:text-end">
            <div className="text-[10px] font-bold uppercase tracking-wide text-primary">{t('googlePlacesPage.quotaUsage')}</div>
            <div className="mt-1 text-lg font-bold tabular-nums text-primary">
              {quota.used.toLocaleString(i18n.language)} / {quota.limit.toLocaleString(i18n.language)}
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary/20 lg:ms-auto lg:max-w-[14rem]"
              role="progressbar"
              aria-valuenow={quotaPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('googlePlacesPage.quotaUsage')}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${quotaPct}%` }}
              />
            </div>
          </div>
        ) : null}
        {quota?.variant === 'remaining' ? (
          <div className="lg:max-w-xs lg:text-end">
            <div className="text-[10px] font-bold uppercase tracking-wide text-primary">{t('googlePlacesPage.quotaRemaining')}</div>
            <div
              className="mt-1 text-lg font-bold tabular-nums text-primary"
              aria-label={t('googlePlacesPage.quotaRemaining')}
            >
              {quota.remaining.toLocaleString(i18n.language)}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition-colors',
              tab === id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-muted',
            )}
          >
            <Icon size={16} />
            {t(labelKey)}
          </button>
        ))}
      </div>

      {tab === 'search' && (
        <div className="space-y-6">
          <div className="premium-card space-y-4 p-6">
            <PlacesFilterRow
              query={query}
              onQueryChange={setQuery}
              region={region}
              onRegionChange={setRegion}
              city={city}
              onCityChange={setCity}
              language={language}
              onLanguageChange={setLanguage}
              loading={searchLoading}
              onSearch={() => void runSearch()}
            />
          </div>

          {places.length > 0 ? (
            <PlacesResultsCard
              places={places}
              resultsPage={resultsPage}
              onResultsPageChange={setResultsPage}
              industryId={industryId}
              onIndustryIdChange={setIndustryId}
              categoryId={categoryId}
              onCategoryIdChange={setCategoryId}
              industries={industries}
              categories={categories}
              bulkImporting={bulkImporting}
              loading={searchLoading || bulkImporting}
              onBulkImport={(ids) => void runBulkImport(ids)}
            />
          ) : null}
        </div>
      )}

      {tab === 'imports' && (
        <div className="premium-card p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-foreground">{t('googlePlacesPage.importHistory')}</h2>
            <button
              type="button"
              onClick={() => void loadImports()}
              className="text-sm font-bold text-primary hover:underline"
            >
              {t('common.refresh')}
            </button>
          </div>
          {importsLoading && imports.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin" size={18} />
              {t('common.loading')}
            </div>
          ) : imports.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
          ) : (
            <GooglePlacesImportsTable rows={imports} />
          )}
        </div>
      )}

      {tab === 'usage' && (
        <div className="space-y-4">
          <div className="premium-card flex flex-wrap items-end gap-4 p-6">
            <label className="space-y-1 text-sm">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t('analyticsExportPage.dateFrom')}
              </span>
              <input
                type="date"
                value={usageFrom}
                onChange={(e) => setUsageFrom(e.target.value)}
                className="h-10 rounded-lg border border-border bg-muted/60 px-3 text-sm dark:bg-muted/40"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t('analyticsExportPage.dateTo')}
              </span>
              <input
                type="date"
                value={usageTo}
                onChange={(e) => setUsageTo(e.target.value)}
                className="h-10 rounded-lg border border-border bg-muted/60 px-3 text-sm dark:bg-muted/40"
              />
            </label>
            <button
              type="button"
              disabled={usageLoading}
              onClick={() => void loadUsage()}
              className="h-10 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {t('googlePlacesPage.loadUsage')}
            </button>
          </div>
          <GooglePlacesUsageReport payload={usageRaw} loading={usageLoading} />
        </div>
      )}
    </div>
  );
};

export default GooglePlaces;
