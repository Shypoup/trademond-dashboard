import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  analyticsExportService,
  type AnalyticsExportFormat,
  type AnalyticsVisitEntityType,
} from '@services/analyticsExportService';
import { JsonInspector } from '@components/JsonInspector';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';

/**
 * Extracts export job id from async export API responses (shape may vary).
 */
function extractExportId(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const data = b.data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.id === 'string') return d.id;
    if (typeof d.export_id === 'string') return d.export_id;
  }
  if (typeof b.id === 'string') return b.id;
  if (typeof b.export_id === 'string') return b.export_id;
  return null;
}

/**
 * Admin analytics bulk export: starts jobs and polls status.
 */
const AnalyticsExport = () => {
  const { t, i18n } = useTranslation();
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const weekAgo = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }, []);

  const [dateFrom, setDateFrom] = React.useState(weekAgo);
  const [dateTo, setDateTo] = React.useState(today);
  const [format, setFormat] = React.useState<AnalyticsExportFormat>('csv');
  const [entityType, setEntityType] = React.useState<AnalyticsVisitEntityType>('all');
  const [busy, setBusy] = React.useState<'visits' | 'searches' | null>(null);
  const [pollId, setPollId] = React.useState<string | null>(null);
  const [pollStatus, setPollStatus] = React.useState<unknown>(null);
  const [polling, setPolling] = React.useState(false);

  React.useEffect(() => {
    if (!pollId) return;
    let cancelled = false;
    setPolling(true);

    const tick = async () => {
      try {
        const status = await analyticsExportService.getExportStatus(pollId);
        if (cancelled) return;
        setPollStatus(status);
        const raw = status as Record<string, unknown>;
        const data = raw.data as Record<string, unknown> | undefined;
        const state = (data?.status ?? raw.status) as string | undefined;
        if (state === 'completed' || state === 'failed') {
          setPolling(false);
          if (state === 'completed') toast.success(t('analyticsExportPage.jobFinished'));
          if (state === 'failed') toast.error(t('analyticsExportPage.jobFailed'));
          return;
        }
      } catch (e) {
        if (!cancelled) showApiErrorToast(e, t, i18n.language);
      }
      if (!cancelled) {
        window.setTimeout(tick, 2000);
      }
    };

    void tick();
    return () => {
      cancelled = true;
    };
  }, [pollId, t, i18n.language]);

  const startVisits = async () => {
    setBusy('visits');
    setPollId(null);
    setPollStatus(null);
    try {
      const res = await analyticsExportService.exportVisits({
        format,
        date_from: dateFrom,
        date_to: dateTo,
        entity_type: entityType,
      });
      setPollStatus(res);
      const id = extractExportId(res);
      if (id) {
        setPollId(id);
        toast.message(t('analyticsExportPage.jobStarted'));
      } else {
        toast.message(t('analyticsExportPage.checkResponse'));
      }
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setBusy(null);
    }
  };

  const startSearches = async () => {
    setBusy('searches');
    setPollId(null);
    setPollStatus(null);
    try {
      const res = await analyticsExportService.exportSearches({
        format,
        date_from: dateFrom,
        date_to: dateTo,
      });
      setPollStatus(res);
      const id = extractExportId(res);
      if (id) {
        setPollId(id);
        toast.message(t('analyticsExportPage.jobStarted'));
      } else {
        toast.message(t('analyticsExportPage.checkResponse'));
      }
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-outfit">{t('sidebar.analyticsExport')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('analyticsExportPage.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="premium-card space-y-4 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">{t('analyticsExportPage.visitsTitle')}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('analyticsExportPage.dateFrom')}</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('analyticsExportPage.dateTo')}</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="space-y-1 text-sm">
            <span className="text-[11px] font-bold uppercase text-slate-400">{t('analyticsExportPage.format')}</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as AnalyticsExportFormat)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="csv">csv</option>
              <option value="json">json</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[11px] font-bold uppercase text-slate-400">{t('analyticsExportPage.entityType')}</span>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as AnalyticsVisitEntityType)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="all">{t('common.all')}</option>
              <option value="company">{t('companies.company')}</option>
              <option value="product">{t('products.title')}</option>
              <option value="service">{t('sidebar.services')}</option>
            </select>
          </label>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void startVisits()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {busy === 'visits' ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            {t('analyticsExportPage.startVisits')}
          </button>
        </section>

        <section className="premium-card space-y-4 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">{t('analyticsExportPage.searchesTitle')}</h2>
          <p className="text-xs text-slate-500">{t('analyticsExportPage.searchesHint')}</p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void startSearches()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {busy === 'searches' ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            {t('analyticsExportPage.startSearches')}
          </button>
        </section>
      </div>

      <div className="premium-card bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-800">{t('analyticsExportPage.lastResponse')}</h3>
          {polling && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Loader2 className="animate-spin" size={14} />
              {t('analyticsExportPage.polling')}
            </span>
          )}
        </div>
        <JsonInspector data={pollStatus} />
      </div>
    </div>
  );
};

export default AnalyticsExport;
