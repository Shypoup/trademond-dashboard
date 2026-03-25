import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Eye, Ban, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { quoteRequestService } from '@services/quoteRequestService';
import type { QuoteRequest } from '@data-types/api';
import type { ApiResponse } from '@data-types/api';
import { formatDate } from '@utils/ui';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@utils/core/cn';

/**
 * Admin quote requests: list, filters, detail, admin notes, lifecycle actions.
 */
const QuoteRequests = () => {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = React.useState<QuoteRequest[]>([]);
  const [meta, setMeta] = React.useState<ApiResponse<QuoteRequest>['meta'] | null>(null);
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [active, setActive] = React.useState<QuoteRequest | null>(null);
  const [adminNotes, setAdminNotes] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { per_page: 15, page };
      if (statusFilter) params['filter[status]'] = statusFilter;
      const res = await quoteRequestService.getQuoteRequests(params);
      setRows((res.data ?? []) as QuoteRequest[]);
      setMeta(res.meta ?? null);
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, t, i18n.language]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openDetail = (row: QuoteRequest) => {
    setActive(row);
    setAdminNotes(row.admin_notes ?? '');
    setSheetOpen(true);
  };

  const saveNotes = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await quoteRequestService.updateQuoteRequest(active.id, { admin_notes: adminNotes });
      toast.success(t('quoteRequestsPage.notesSaved'));
      setSheetOpen(false);
      await load();
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setSaving(false);
    }
  };

  const forceClose = async () => {
    if (!active) return;
    if (!window.confirm(t('quoteRequestsPage.confirmForceClose'))) return;
    setSaving(true);
    try {
      await quoteRequestService.forceCloseQuoteRequest(active.id);
      toast.success(t('quoteRequestsPage.forceClosed'));
      setSheetOpen(false);
      await load();
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setSaving(false);
    }
  };

  const softDelete = async () => {
    if (!active) return;
    if (!window.confirm(t('quoteRequestsPage.confirmDelete'))) return;
    setSaving(true);
    try {
      await quoteRequestService.deleteQuoteRequest(active.id);
      toast.success(t('quoteRequestsPage.deleted'));
      setSheetOpen(false);
      await load();
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setSaving(false);
    }
  };

  const restore = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await quoteRequestService.restoreQuoteRequest(active.id);
      toast.success(t('quoteRequestsPage.restored'));
      setSheetOpen(false);
      await load();
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = async () => {
    try {
      const params: Record<string, unknown> = {};
      if (statusFilter) params['filter[status]'] = statusFilter;
      const blob = await quoteRequestService.exportQuoteRequests(params);
      const url = window.URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-requests-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(t('quoteRequestsPage.exportStarted'));
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    }
  };

  const statusOptions: QuoteRequest['status'][] = [
    'pending',
    'viewed',
    'in_progress',
    'quoted',
    'accepted',
    'declined',
    'expired',
    'closed',
    'cancelled',
  ];

  if (loading && rows.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={20} />
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-outfit">{t('sidebar.quoteRequests')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('quoteRequestsPage.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => void exportCsv()}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          {t('quoteRequestsPage.exportCsv')}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('quoteRequestsPage.filterStatus')}</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">{t('common.all')}</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="premium-card overflow-hidden">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('quoteRequestsPage.colId')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('quoteRequestsPage.colSubject')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('quoteRequestsPage.colStatus')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('quoteRequestsPage.colCreated')}</th>
              <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 font-mono text-xs text-slate-600">{row.id}</td>
                <td className="max-w-xs truncate px-6 py-4 text-sm text-slate-800">{row.subject ?? '—'}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] text-slate-700">
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground">{row.created_at ? formatDate(row.created_at) : '—'}</td>
                <td className="px-6 py-4 text-end">
                  <button
                    type="button"
                    onClick={() => openDetail(row)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-teal-700 hover:bg-teal-50"
                  >
                    <Eye size={16} />
                    {t('quoteRequestsPage.view')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !loading && <p className="px-6 py-12 text-center text-sm text-muted-foreground">{t('common.noData')}</p>}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <span>
            {t('quoteRequestsPage.pageOf', { page: meta.current_page, total: meta.last_page })}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.current_page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1 font-bold disabled:opacity-40"
            >
              {t('common.back')}
            </button>
            <button
              type="button"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1 font-bold disabled:opacity-40"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{t('quoteRequestsPage.detailTitle')}</SheetTitle>
          </SheetHeader>
          {active && (
            <div className="space-y-4">
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-[11px] font-bold uppercase text-muted-foreground">{t('quoteRequestsPage.colId')}</dt>
                  <dd className="font-mono text-xs text-slate-700">{active.id}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase text-muted-foreground">{t('quoteRequestsPage.colStatus')}</dt>
                  <dd className="font-mono text-xs">{active.status}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase text-muted-foreground">{t('quoteRequestsPage.message')}</dt>
                  <dd className="whitespace-pre-wrap text-slate-700">{active.message ?? '—'}</dd>
                </div>
              </dl>
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('quoteRequestsPage.adminNotes')}</span>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveNotes()}
                  className={cn(
                    'rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50',
                  )}
                >
                  {t('quoteRequestsPage.saveNotes')}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void forceClose()}
                  className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900"
                >
                  <Ban size={16} />
                  {t('quoteRequestsPage.forceClose')}
                </button>
                {active.deleted_at ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void restore()}
                    className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-900"
                  >
                    <RotateCcw size={16} />
                    {t('quoteRequestsPage.restore')}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void softDelete()}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-900"
                  >
                    <Trash2 size={16} />
                    {t('quoteRequestsPage.softDelete')}
                  </button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default QuoteRequests;
