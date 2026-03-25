import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Search, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { quoteResponseService } from '@services/quoteResponseService';
import type { QuoteResponse } from '@data-types/api';
import { formatDate } from '@utils/ui';
import { JsonInspector } from '@components/JsonInspector';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';
import { cn } from '@utils/core/cn';

/**
 * Admin quote response detail: lookup by ULID (no list endpoint in API).
 */
const QuoteResponses = () => {
  const { t, i18n } = useTranslation();
  const [ulid, setUlid] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [row, setRow] = React.useState<QuoteResponse | null>(null);
  const [raw, setRaw] = React.useState<unknown>(null);
  const [adminNotes, setAdminNotes] = React.useState('');

  const load = async () => {
    const id = ulid.trim();
    if (!id) {
      toast.error(t('quoteResponsesPage.idRequired'));
      return;
    }
    setLoading(true);
    try {
      const res = await quoteResponseService.getQuoteResponse(id);
      const body = res as { data?: QuoteResponse };
      const data = body.data;
      if (!data) {
        setRow(null);
        setRaw(res);
        return;
      }
      setRow(data);
      setRaw(res);
      setAdminNotes(data?.admin_notes ?? '');
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
      setRow(null);
      setRaw(null);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!row) return;
    setSaving(true);
    try {
      await quoteResponseService.updateQuoteResponse(row.id, { admin_notes: adminNotes });
      toast.success(t('quoteResponsesPage.notesSaved'));
      await load();
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setSaving(false);
    }
  };

  const softDelete = async () => {
    if (!row) return;
    if (!window.confirm(t('quoteResponsesPage.confirmDelete'))) return;
    setSaving(true);
    try {
      await quoteResponseService.deleteQuoteResponse(row.id);
      toast.success(t('quoteResponsesPage.deleted'));
      setRow(null);
      setRaw(null);
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setSaving(false);
    }
  };

  const restore = async () => {
    if (!row) return;
    setSaving(true);
    try {
      await quoteResponseService.restoreQuoteResponse(row.id);
      toast.success(t('quoteResponsesPage.restored'));
      await load();
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-outfit">{t('sidebar.quoteResponses')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('quoteResponsesPage.subtitle')}</p>
      </div>

      <div className="premium-card flex flex-wrap items-end gap-3 p-6">
        <label className="min-w-[240px] flex-1 space-y-1 text-sm">
          <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('quoteResponsesPage.responseUlid')}</span>
          <input
            value={ulid}
            onChange={(e) => setUlid(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
            placeholder={t('quoteResponsesPage.placeholderUlid')}
          />
        </label>
        <button
          type="button"
          disabled={loading}
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          {t('quoteResponsesPage.load')}
        </button>
      </div>

      {row && (
        <div className="premium-card space-y-4 p-6">
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-[11px] font-bold uppercase text-muted-foreground">{t('quoteResponsesPage.quoteRequest')}</dt>
              <dd className="font-mono text-xs text-slate-700">{row.quote_request_id}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase text-muted-foreground">{t('quoteResponsesPage.price')}</dt>
              <dd className="text-slate-800">
                {row.price != null ? `${row.price} ${row.currency ?? ''}` : '—'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-bold uppercase text-muted-foreground">{t('quoteResponsesPage.message')}</dt>
              <dd className="whitespace-pre-wrap text-slate-700">{row.message ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase text-muted-foreground">{t('quoteResponsesPage.validUntil')}</dt>
              <dd className="text-xs text-slate-600">{row.valid_until ? formatDate(row.valid_until) : '—'}</dd>
            </div>
          </dl>
          <label className="space-y-1 text-sm">
            <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('quoteRequestsPage.adminNotes')}</span>
            <textarea
              rows={3}
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
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {t('quoteRequestsPage.saveNotes')}
            </button>
            {row.deleted_at ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => void restore()}
                className={cn(
                  'inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-900',
                )}
              >
                <RotateCcw size={16} />
                {t('quoteResponsesPage.restore')}
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={() => void softDelete()}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-900"
              >
                <Trash2 size={16} />
                {t('quoteResponsesPage.softDelete')}
              </button>
            )}
          </div>
        </div>
      )}

      {raw !== null && (
        <div className="premium-card p-4">
          <h3 className="mb-2 text-sm font-bold text-slate-800">{t('quoteResponsesPage.rawPayload')}</h3>
          <JsonInspector data={raw} />
        </div>
      )}
    </div>
  );
};

export default QuoteResponses;
