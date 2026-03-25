import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, MapPin } from 'lucide-react';
import { placesProxyService, type PlacesLanguage } from '@services/placesProxyService';
import { JsonInspector } from '@components/JsonInspector';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';

/**
 * Admin Places proxy: autocomplete and place details for address selection.
 */
const Places = () => {
  const { t, i18n } = useTranslation();
  const sessionToken = React.useMemo(() => crypto.randomUUID(), []);
  const [language, setLanguage] = React.useState<PlacesLanguage>('en');
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [predictions, setPredictions] = React.useState<Array<Record<string, unknown>>>([]);
  const [details, setDetails] = React.useState<unknown>(null);
  const [lastAutocompleteRaw, setLastAutocompleteRaw] = React.useState<unknown>(null);

  const parsePredictions = (raw: unknown): Array<Record<string, unknown>> => {
    if (!raw || typeof raw !== 'object') return [];
    const r = raw as Record<string, unknown>;
    const data = r.data;
    let list: unknown[] = [];
    if (Array.isArray(data)) list = data;
    else if (data && typeof data === 'object' && Array.isArray((data as { predictions?: unknown[] }).predictions)) {
      list = (data as { predictions: unknown[] }).predictions;
    } else if (Array.isArray(r.predictions)) list = r.predictions;
    return list.filter((p): p is Record<string, unknown> => !!p && typeof p === 'object');
  };

  const predictionId = (p: Record<string, unknown>): string => {
    const id =
      (typeof p.place_id === 'string' && p.place_id) ||
      (typeof p.placeId === 'string' && p.placeId) ||
      (typeof p.id === 'string' && p.id) ||
      '';
    return id;
  };

  const predictionLabel = (p: Record<string, unknown>): string => {
    const d = p.description ?? p.main_text ?? p.structured_formatting;
    if (typeof d === 'string') return d;
    if (d && typeof d === 'object' && 'main_text' in d) {
      const m = (d as { main_text?: string }).main_text;
      if (typeof m === 'string') return m;
    }
    return JSON.stringify(p);
  };

  const runAutocomplete = React.useCallback(async () => {
    const q = input.trim();
    if (q.length < 3) {
      setPredictions([]);
      setLastAutocompleteRaw(null);
      return;
    }
    setLoading(true);
    try {
      const raw = await placesProxyService.autocomplete(q, sessionToken, language);
      setLastAutocompleteRaw(raw);
      setPredictions(parsePredictions(raw));
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
      setPredictions([]);
      setLastAutocompleteRaw(null);
    } finally {
      setLoading(false);
    }
  }, [input, language, sessionToken, t, i18n.language]);

  React.useEffect(() => {
    const h = window.setTimeout(() => {
      void runAutocomplete();
    }, 350);
    return () => window.clearTimeout(h);
  }, [runAutocomplete]);

  const loadDetails = async (placeId: string) => {
    setLoading(true);
    try {
      const raw = await placesProxyService.getDetails(placeId);
      setDetails(raw);
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-outfit">{t('sidebar.placesLookup')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('placesPage.subtitle')}</p>
      </div>

      <div className="premium-card space-y-4 p-6">
        <p className="text-xs text-muted-foreground">{t('placesPage.sessionHint')}</p>
        <div className="flex flex-wrap gap-4">
          <label className="min-w-[200px] flex-1 space-y-1 text-sm">
            <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('placesPage.language')}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as PlacesLanguage)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="en">en</option>
              <option value="ar">ar</option>
            </select>
          </label>
          <label className="min-w-[240px] flex-[2] space-y-1 text-sm">
            <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('placesPage.addressQuery')}</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder={t('placesPage.minChars')}
            />
          </label>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" size={18} />
            {t('common.loading')}
          </div>
        )}
      </div>

      {predictions.length > 0 && (
        <div className="premium-card overflow-hidden">
          <div className="border-b border-border px-6 py-3">
            <h2 className="text-sm font-bold text-slate-800">{t('placesPage.predictions')}</h2>
          </div>
          <ul className="divide-y divide-border">
            {predictions.map((p) => {
              const pid = predictionId(p);
              if (!pid) return null;
              return (
                <li key={pid}>
                  <button
                    type="button"
                    onClick={() => void loadDetails(pid)}
                    className="flex w-full items-start gap-3 px-6 py-3 text-start hover:bg-slate-50"
                  >
                    <MapPin className="mt-0.5 shrink-0 text-teal-600" size={18} />
                    <span className="text-sm font-medium text-slate-800">{predictionLabel(p)}</span>
                    <span className="ms-auto font-mono text-[10px] text-slate-400">{pid}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {details !== null && (
        <div className="premium-card p-4">
          <h3 className="mb-2 text-sm font-bold text-slate-800">{t('placesPage.details')}</h3>
          <JsonInspector data={details} />
        </div>
      )}

      {lastAutocompleteRaw !== null && predictions.length === 0 && input.trim().length >= 3 && !loading && (
        <div className="premium-card p-4">
          <h3 className="mb-2 text-sm font-bold text-slate-800">{t('placesPage.autocompleteRaw')}</h3>
          <JsonInspector data={lastAutocompleteRaw} />
        </div>
      )}
    </div>
  );
};

export default Places;
