import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Search, Upload, History, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import {
  googlePlacesAdminService,
  type GooglePlacesLanguage,
  type GooglePlacesImportPlaceRow,
} from '@services/googlePlacesAdminService';
import { taxonomyService } from '@services/taxonomyService';
import { categoryService } from '@services/categoryService';
import { displayBilingual } from '@utils/ui';
import { JsonInspector } from '@components/JsonInspector';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';
import { cn } from '@utils/core/cn';

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
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [region, setRegion] = React.useState('');
  const [city, setCity] = React.useState('');
  const [language, setLanguage] = React.useState<GooglePlacesLanguage>('en');
  const [searchRaw, setSearchRaw] = React.useState<unknown>(null);
  const [places, setPlaces] = React.useState<Array<Record<string, unknown>>>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
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

  const parsePlaces = React.useCallback((raw: unknown) => {
    const root = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    const data = root.data;
    let list: unknown[] = [];
    if (Array.isArray(data)) list = data;
    else if (data && typeof data === 'object' && Array.isArray((data as { places?: unknown[] }).places)) {
      list = (data as { places: unknown[] }).places;
    } else if (Array.isArray(root.places)) list = root.places;
    else if (Array.isArray(root.results)) list = root.results;
    return list
      .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object')
      .map((p) => p);
  }, []);

  const runSearch = async () => {
    if (!query.trim()) {
      toast.error(t('googlePlacesPage.queryRequired'));
      return;
    }
    setLoading(true);
    try {
      const res = await googlePlacesAdminService.search({
        query: query.trim(),
        region: region.trim() || undefined,
        city: city.trim() || undefined,
        language,
      });
      setSearchRaw(res);
      setPlaces(parsePlaces(res));
      setSelectedIds(new Set());
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
      setSearchRaw(null);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const placeIdOf = (row: Record<string, unknown>): string => {
    const id =
      (typeof row.google_place_id === 'string' && row.google_place_id) ||
      (typeof row.place_id === 'string' && row.place_id) ||
      (typeof row.id === 'string' && row.id) ||
      '';
    return id;
  };

  const displayName = (row: Record<string, unknown>): string => {
    const n = row.name ?? row.display_name ?? row.title;
    return typeof n === 'string' ? n : JSON.stringify(n);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runImport = async () => {
    if (selectedIds.size === 0) {
      toast.error(t('googlePlacesPage.selectPlaces'));
      return;
    }
    setLoading(true);
    try {
      const placesPayload: GooglePlacesImportPlaceRow[] = [...selectedIds].map((googlePlaceId) => ({
        googlePlaceId,
        industryId: industryId || null,
        categoryId: categoryId || null,
      }));
      const res = await googlePlacesAdminService.importPlaces({
        language,
        places: placesPayload,
      });
      toast.success(t('googlePlacesPage.importQueued'));
      setSearchRaw(res);
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setLoading(false);
    }
  };

  const loadImports = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await googlePlacesAdminService.listImports({ per_page: 50 });
      setImports(asRows(res));
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setLoading(false);
    }
  }, [t, i18n.language]);

  const loadUsage = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await googlePlacesAdminService.getUsage({ from: usageFrom, to: usageTo });
      setUsageRaw(res);
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
      setUsageRaw(null);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-outfit">{t('sidebar.googlePlaces')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('googlePlacesPage.subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors',
              tab === id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
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
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('googlePlacesPage.query')}</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder={t('googlePlacesPage.queryPlaceholder')}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('googlePlacesPage.region')}</span>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('googlePlacesPage.city')}</span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('googlePlacesPage.language')}</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as GooglePlacesLanguage)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="en">en</option>
                  <option value="ar">ar</option>
                  <option value="both">both</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => void runSearch()}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              {t('googlePlacesPage.runSearch')}
            </button>
          </div>

          {places.length > 0 && (
            <div className="premium-card overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-sm font-bold text-slate-800">{t('googlePlacesPage.results')}</h2>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 text-xs">
                    <span className="font-bold uppercase text-slate-400">{t('googlePlacesPage.optionalIndustry')}</span>
                    <select
                      value={industryId}
                      onChange={(e) => setIndustryId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="">{t('googlePlacesPage.none')}</option>
                      {industries.map((i) => (
                        <option key={i.id} value={i.id}>
                          {displayBilingual(i.name)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-bold uppercase text-slate-400">{t('googlePlacesPage.optionalCategory')}</span>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                <button
                  type="button"
                  disabled={loading || selectedIds.size === 0}
                  onClick={() => void runImport()}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  <Upload size={16} />
                  {t('googlePlacesPage.importSelected', { count: selectedIds.size })}
                </button>
              </div>
              <table className="w-full border-collapse text-start">
                <thead>
                  <tr className="border-b border-border">
                    <th className="w-10 px-4 py-3" />
                    <th className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">{t('googlePlacesPage.colPlace')}</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">{t('googlePlacesPage.colId')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {places.map((row) => {
                    const pid = placeIdOf(row);
                    if (!pid) return null;
                    return (
                      <tr key={pid} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(pid)}
                            onChange={() => toggleSelect(pid)}
                            className="rounded border-slate-300"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{displayName(row)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{pid}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {searchRaw !== null && (
            <div className="premium-card p-4">
              <h3 className="mb-2 text-sm font-bold text-slate-800">{t('googlePlacesPage.rawResponse')}</h3>
              <JsonInspector data={searchRaw} />
            </div>
          )}
        </div>
      )}

      {tab === 'imports' && (
        <div className="premium-card p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-800">{t('googlePlacesPage.importHistory')}</h2>
            <button
              type="button"
              onClick={() => void loadImports()}
              className="text-sm font-bold text-teal-700 hover:underline"
            >
              {t('common.refresh')}
            </button>
          </div>
          {loading && imports.length === 0 ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="animate-spin" size={18} />
              {t('common.loading')}
            </div>
          ) : imports.length === 0 ? (
            <p className="text-sm text-slate-400">{t('common.noData')}</p>
          ) : (
            <JsonInspector data={imports} />
          )}
        </div>
      )}

      {tab === 'usage' && (
        <div className="space-y-4">
          <div className="premium-card flex flex-wrap items-end gap-4 p-6">
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('analyticsExportPage.dateFrom')}</span>
              <input
                type="date"
                value={usageFrom}
                onChange={(e) => setUsageFrom(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('analyticsExportPage.dateTo')}</span>
              <input
                type="date"
                value={usageTo}
                onChange={(e) => setUsageTo(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              disabled={loading}
              onClick={() => void loadUsage()}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {t('googlePlacesPage.loadUsage')}
            </button>
          </div>
          <div className="premium-card p-4">
            <JsonInspector data={usageRaw} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GooglePlaces;
