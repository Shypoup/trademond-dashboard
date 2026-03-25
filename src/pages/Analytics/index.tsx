import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  analyticsService,
  type AnalyticsPeriod,
} from '@services/analyticsService';
import { JsonInspector } from '@components/JsonInspector';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';
import { cn } from '@utils/core/cn';

type AnalyticsTab =
  | 'overview'
  | 'visits'
  | 'searches'
  | 'topSearchTerms'
  | 'zeroResultQueries'
  | 'queueHealth';

const PERIODS: AnalyticsPeriod[] = ['7d', '30d', '90d', '1y'];

/**
 * Platform analytics dashboard: reads from `/admin/analytics/*` and renders JSON panels.
 */
const Analytics = () => {
  const { t, i18n } = useTranslation();
  const [period, setPeriod] = React.useState<AnalyticsPeriod>('30d');
  const [tab, setTab] = React.useState<AnalyticsTab>('overview');
  const [payload, setPayload] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      let data: unknown;
      switch (tab) {
        case 'overview':
          data = await analyticsService.getOverview(period);
          break;
        case 'visits':
          data = await analyticsService.getVisits(period);
          break;
        case 'searches':
          data = await analyticsService.getSearches(period);
          break;
        case 'topSearchTerms':
          data = await analyticsService.getTopSearchTerms(period, 50);
          break;
        case 'zeroResultQueries':
          data = await analyticsService.getZeroResultQueries(period, 50);
          break;
        case 'queueHealth':
          data = await analyticsService.getQueueHealth();
          break;
        default:
          data = null;
      }
      setPayload(data);
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [tab, period, t, i18n.language]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const tabs: { id: AnalyticsTab; labelKey: string }[] = [
    { id: 'overview', labelKey: 'analyticsPage.tabOverview' },
    { id: 'visits', labelKey: 'analyticsPage.tabVisits' },
    { id: 'searches', labelKey: 'analyticsPage.tabSearches' },
    { id: 'topSearchTerms', labelKey: 'analyticsPage.tabTopTerms' },
    { id: 'zeroResultQueries', labelKey: 'analyticsPage.tabZeroResults' },
    { id: 'queueHealth', labelKey: 'analyticsPage.tabQueue' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-outfit">{t('sidebar.analytics')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('analyticsPage.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {t('analyticsPage.period')}
            </span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as AnalyticsPeriod)}
              disabled={tab === 'queueHealth'}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-slate-800 disabled:opacity-50"
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={16} className={cn(loading && 'animate-spin')} />
            {t('common.refresh')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-bold transition-colors',
              tab === id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      <div className="premium-card p-4">
        {loading && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" size={18} />
            {t('common.loading')}
          </div>
        )}
        <JsonInspector data={payload} className="max-h-[min(70vh,720px)]" />
      </div>
    </div>
  );
};

export default Analytics;
