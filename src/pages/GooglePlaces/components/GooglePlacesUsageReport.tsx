import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { isGooglePlacesUsageReportEmpty, parseGooglePlacesUsageReport } from '@pages/GooglePlaces/utils/usageReportHelpers';

export interface GooglePlacesUsageReportProps {
  /** Raw `/admin/google-places/usage` response body. */
  payload: unknown;
  /** When true, shows an in-card loading state (list request in flight). */
  loading: boolean;
}

const labelClass = 'text-[10px] font-bold uppercase tracking-wide text-muted-foreground';
const statBox = 'rounded-lg border border-border bg-muted/30 p-4';

/**
 * Humanizes an API endpoint key, using `googlePlacesPage.endpoint.*` when defined.
 */
function formatEndpointLabel(
  key: string,
  t: ReturnType<typeof useTranslation>['t'],
  exists: (k: string) => boolean,
): string {
  const path = `googlePlacesPage.endpoint.${key}`;
  if (exists(path)) return t(path);
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Renders Google Places usage statistics (summary, by endpoint, by day).
 */
export function GooglePlacesUsageReport({ payload, loading }: GooglePlacesUsageReportProps) {
  const { t, i18n } = useTranslation();
  const report = React.useMemo(() => parseGooglePlacesUsageReport(payload), [payload]);

  const formatUsd = React.useCallback(
    (n: number) =>
      new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n),
    [i18n.language],
  );

  const formatPeriodDate = React.useCallback(
    (isoDate: string) => {
      try {
        return new Date(isoDate + 'T12:00:00').toLocaleDateString(i18n.language, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      } catch {
        return isoDate;
      }
    },
    [i18n.language],
  );

  const formatStat = (v: number | null) =>
    v == null || Number.isNaN(v) ? t('googlePlacesPage.cellEmpty') : v.toLocaleString(i18n.language);

  if (loading) {
    return (
      <div className="premium-card flex items-center justify-center gap-2 p-12 text-muted-foreground">
        <Loader2 className="size-5 animate-spin shrink-0" aria-hidden />
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  if (!report || isGooglePlacesUsageReportEmpty(report)) {
    return (
      <div className="premium-card p-6">
        <p className="text-sm text-muted-foreground">{t('googlePlacesPage.usageEmpty')}</p>
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-sm font-bold text-foreground">{t('googlePlacesPage.usageSectionSummary')}</h2>
      </div>
      <div className="space-y-6 p-6">
        {report.period ? (
          <div>
            <p className={labelClass}>{t('googlePlacesPage.usagePeriod')}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {formatPeriodDate(report.period.from)} – {formatPeriodDate(report.period.to)}
            </p>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className={statBox}>
            <p className={labelClass}>{t('googlePlacesPage.usageTotalRequests')}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{formatStat(report.totalRequests)}</p>
          </div>
          <div className={statBox}>
            <p className={labelClass}>{t('googlePlacesPage.usageEstimatedCost')}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
              {report.estimatedCostUsd != null && !Number.isNaN(report.estimatedCostUsd)
                ? formatUsd(report.estimatedCostUsd)
                : t('googlePlacesPage.cellEmpty')}
            </p>
          </div>
          <div className={statBox}>
            <p className={labelClass}>{t('googlePlacesPage.usageDailyLimit')}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{formatStat(report.dailyLimit)}</p>
          </div>
          <div className={statBox}>
            <p className={labelClass}>{t('googlePlacesPage.usageTodayUsed')}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-primary">{formatStat(report.todayUsed)}</p>
          </div>
          <div className={statBox}>
            <p className={labelClass}>{t('googlePlacesPage.usageTodayRemaining')}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{formatStat(report.todayRemaining)}</p>
          </div>
        </div>

        {report.byEndpoint.length > 0 ? (
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {t('googlePlacesPage.usageSectionByEndpoint')}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[28rem] border-collapse text-start">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {t('googlePlacesPage.usageColEndpoint')}
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {t('googlePlacesPage.usageColRequests')}
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {t('googlePlacesPage.usageColCost')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.byEndpoint.map((row) => (
                    <tr key={row.key} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {formatEndpointLabel(row.key, t, i18n.exists.bind(i18n))}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">
                        {row.requests.toLocaleString(i18n.language)}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">{formatUsd(row.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {report.byDay.length > 0 ? (
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {t('googlePlacesPage.usageSectionByDay')}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[28rem] border-collapse text-start">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {t('googlePlacesPage.usageColDate')}
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {t('googlePlacesPage.usageColRequests')}
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {t('googlePlacesPage.usageColCost')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.byDay.map((row, idx) => (
                    <tr key={`${row.date}-${idx}`} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{formatPeriodDate(row.date)}</td>
                      <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">
                        {row.requests.toLocaleString(i18n.language)}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">{formatUsd(row.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
