import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { globalNotificationService, type GlobalNotification } from '@services/globalNotificationService';
import { displayBilingual, formatDate } from '@utils/ui';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@utils/core/cn';

/**
 * Admin global notifications (banners / maintenance messages).
 */
const GlobalNotifications = () => {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = React.useState<GlobalNotification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    title_en: '',
    title_ar: '',
    body_en: '',
    body_ar: '',
    type: 'info',
    link_url: '',
    link_label_en: '',
    link_label_ar: '',
    active: true,
    starts_at: '',
    ends_at: '',
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await globalNotificationService.list({ per_page: 100 });
      setRows((res.data ?? []) as GlobalNotification[]);
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setLoading(false);
    }
  }, [t, i18n.language]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title_en: '',
      title_ar: '',
      body_en: '',
      body_ar: '',
      type: 'info',
      link_url: '',
      link_label_en: '',
      link_label_ar: '',
      active: true,
      starts_at: '',
      ends_at: '',
    });
    setSheetOpen(true);
  };

  const openEdit = (row: GlobalNotification) => {
    setEditingId(row.id);
    const title = row.title;
    const body = row.body;
    const ll = row.link_label;
    setForm({
      title_en: typeof title === 'object' ? String(title.en ?? '') : '',
      title_ar: typeof title === 'object' ? String(title.ar ?? '') : '',
      body_en: typeof body === 'object' ? String(body.en ?? '') : '',
      body_ar: typeof body === 'object' ? String(body.ar ?? '') : '',
      type: row.type,
      link_url: row.link_url ?? '',
      link_label_en: ll && typeof ll === 'object' ? String(ll.en ?? '') : '',
      link_label_ar: ll && typeof ll === 'object' ? String(ll.ar ?? '') : '',
      active: row.active,
      starts_at: row.starts_at ? row.starts_at.slice(0, 16) : '',
      ends_at: row.ends_at ? row.ends_at.slice(0, 16) : '',
    });
    setSheetOpen(true);
  };

  const buildPayload = (): Record<string, unknown> => {
    const payload: Record<string, unknown> = {
      title: { en: form.title_en.trim(), ar: form.title_ar.trim() },
      body: { en: form.body_en.trim(), ar: form.body_ar.trim() },
      type: form.type.trim(),
      active: form.active,
    };
    if (form.link_url.trim()) payload.link_url = form.link_url.trim();
    else payload.link_url = null;
    if (form.link_label_en.trim() || form.link_label_ar.trim()) {
      payload.link_label = { en: form.link_label_en.trim(), ar: form.link_label_ar.trim() };
    } else payload.link_label = null;
    if (form.starts_at) payload.starts_at = new Date(form.starts_at).toISOString();
    else payload.starts_at = null;
    if (form.ends_at) payload.ends_at = new Date(form.ends_at).toISOString();
    else payload.ends_at = null;
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingId) {
        await globalNotificationService.update(editingId, payload);
        toast.success(t('globalNotificationsPage.updated'));
      } else {
        await globalNotificationService.create(payload);
        toast.success(t('globalNotificationsPage.created'));
      }
      setSheetOpen(false);
      await load();
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('globalNotificationsPage.confirmDelete'))) return;
    try {
      await globalNotificationService.delete(id);
      toast.success(t('globalNotificationsPage.deleted'));
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    }
  };

  if (loading && rows.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-slate-500">
        <Loader2 className="animate-spin" size={20} />
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-outfit">{t('sidebar.globalNotifications')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('globalNotificationsPage.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-teal-700"
        >
          <Plus size={18} />
          {t('globalNotificationsPage.add')}
        </button>
      </div>

      <div className="premium-card overflow-hidden bg-white">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">{t('globalNotificationsPage.colTitle')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">{t('globalNotificationsPage.colType')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">{t('common.status')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">{t('globalNotificationsPage.colWindow')}</th>
              <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-slate-400">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60">
                <td className="max-w-xs px-6 py-4 text-sm font-semibold text-slate-800">{displayBilingual(row.title)}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-600">{row.type}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase',
                      row.active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500',
                    )}
                  >
                    {row.active ? t('common.active') : t('common.inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {row.starts_at || row.ends_at ? (
                    <span>
                      {row.starts_at ? formatDate(row.starts_at) : '—'} → {row.ends_at ? formatDate(row.ends_at) : '—'}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-6 py-4 text-end">
                  <button type="button" onClick={() => openEdit(row)} className="me-2 inline-flex rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-600">
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => void handleDelete(row.id)} className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !loading && <p className="px-6 py-12 text-center text-sm text-slate-400">{t('common.noData')}</p>}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingId ? t('globalNotificationsPage.editTitle') : t('globalNotificationsPage.createTitle')}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('globalNotificationsPage.type')}</span>
              <input
                required
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('industriesPage.nameEn')}</span>
              <input
                required
                value={form.title_en}
                onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('industriesPage.nameAr')}</span>
              <input
                required
                dir="rtl"
                value={form.title_ar}
                onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('globalNotificationsPage.bodyEn')}</span>
              <textarea
                required
                rows={3}
                value={form.body_en}
                onChange={(e) => setForm((f) => ({ ...f, body_en: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('globalNotificationsPage.bodyAr')}</span>
              <textarea
                required
                rows={3}
                dir="rtl"
                value={form.body_ar}
                onChange={(e) => setForm((f) => ({ ...f, body_ar: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('globalNotificationsPage.linkUrl')}</span>
              <input
                value={form.link_url}
                onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('globalNotificationsPage.linkLabelEn')}</span>
              <input
                value={form.link_label_en}
                onChange={(e) => setForm((f) => ({ ...f, link_label_en: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('globalNotificationsPage.linkLabelAr')}</span>
              <input
                dir="rtl"
                value={form.link_label_ar}
                onChange={(e) => setForm((f) => ({ ...f, link_label_ar: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-slate-400">{t('globalNotificationsPage.startsAt')}</span>
                <input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-slate-400">{t('globalNotificationsPage.endsAt')}</span>
                <input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              {t('common.active')}
            </label>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setSheetOpen(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">
                {t('common.cancel')}
              </button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                {saving && <Loader2 className="animate-spin" size={16} />}
                {t('common.save')}
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default GlobalNotifications;
