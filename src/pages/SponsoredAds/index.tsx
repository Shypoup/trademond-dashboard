import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Loader2, Power } from 'lucide-react';
import { toast } from 'sonner';
import { sponsoredAdService } from '@services/sponsoredAdService';
import type { SponsoredAd } from '@data-types/api';
import { displayBilingual, formatDate } from '@utils/ui';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@utils/core/cn';

/**
 * Admin sponsored placements (headlines, CTAs, scheduling).
 */
const SponsoredAds = () => {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = React.useState<SponsoredAd[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    placement: '',
    headline_en: '',
    headline_ar: '',
    description_en: '',
    description_ar: '',
    cta_label_en: '',
    cta_label_ar: '',
    cta_url: '',
    company_id: '',
    external_brand: '',
    priority: 0,
    is_active: true,
    starts_at: '',
    ends_at: '',
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await sponsoredAdService.getSponsoredAds({ per_page: 100 });
      setRows((res.data ?? []) as SponsoredAd[]);
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
      placement: 'home_hero',
      headline_en: '',
      headline_ar: '',
      description_en: '',
      description_ar: '',
      cta_label_en: '',
      cta_label_ar: '',
      cta_url: '',
      company_id: '',
      external_brand: '',
      priority: 0,
      is_active: true,
      starts_at: '',
      ends_at: '',
    });
    setSheetOpen(true);
  };

  const openEdit = (row: SponsoredAd) => {
    setEditingId(row.id);
    const h = row.headline;
    const d = row.description;
    const c = row.cta_label;
    setForm({
      placement: row.placement,
      headline_en: h && typeof h === 'object' ? String(h.en ?? '') : '',
      headline_ar: h && typeof h === 'object' ? String(h.ar ?? '') : '',
      description_en: d && typeof d === 'object' ? String(d.en ?? '') : '',
      description_ar: d && typeof d === 'object' ? String(d.ar ?? '') : '',
      cta_label_en: c && typeof c === 'object' ? String(c.en ?? '') : '',
      cta_label_ar: c && typeof c === 'object' ? String(c.ar ?? '') : '',
      cta_url: row.cta_url ?? '',
      company_id: row.company_id ?? '',
      external_brand: row.external_brand ?? '',
      priority: row.priority ?? 0,
      is_active: row.is_active,
      starts_at: row.starts_at ? row.starts_at.slice(0, 16) : '',
      ends_at: row.ends_at ? row.ends_at.slice(0, 16) : '',
    });
    setSheetOpen(true);
  };

  const buildPayload = (partial: boolean): Record<string, unknown> => {
    const payload: Record<string, unknown> = {
      placement: form.placement.trim(),
      headline: { en: form.headline_en.trim(), ar: form.headline_ar.trim() },
      is_active: form.is_active,
      priority: Number.isFinite(form.priority) ? form.priority : 0,
    };
    if (form.description_en.trim() || form.description_ar.trim()) {
      payload.description = { en: form.description_en.trim(), ar: form.description_ar.trim() };
    }
    if (form.cta_label_en.trim() || form.cta_label_ar.trim()) {
      payload.cta_label = { en: form.cta_label_en.trim(), ar: form.cta_label_ar.trim() };
    }
    if (form.cta_url.trim()) payload.cta_url = form.cta_url.trim();
    else if (!partial) payload.cta_url = null;
    if (form.company_id.trim()) payload.company_id = form.company_id.trim();
    else if (!partial) payload.company_id = null;
    if (form.external_brand.trim()) payload.external_brand = form.external_brand.trim();
    else if (!partial) payload.external_brand = null;
    if (form.starts_at) payload.starts_at = new Date(form.starts_at).toISOString();
    else if (!partial) payload.starts_at = null;
    if (form.ends_at) payload.ends_at = new Date(form.ends_at).toISOString();
    else if (!partial) payload.ends_at = null;
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await sponsoredAdService.updateSponsoredAd(editingId, buildPayload(true));
        toast.success(t('sponsoredAdsPage.updated'));
      } else {
        await sponsoredAdService.createSponsoredAd(
          buildPayload(false) as unknown as Parameters<typeof sponsoredAdService.createSponsoredAd>[0],
        );
        toast.success(t('sponsoredAdsPage.created'));
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
    if (!window.confirm(t('sponsoredAdsPage.confirmDelete'))) return;
    try {
      await sponsoredAdService.deleteSponsoredAd(id);
      toast.success(t('sponsoredAdsPage.deleted'));
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      await sponsoredAdService.toggleActive(id);
      toast.success(t('sponsoredAdsPage.toggled'));
      await load();
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
          <h1 className="text-2xl font-bold text-slate-900 font-outfit">{t('sidebar.sponsoredAds')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('sponsoredAdsPage.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-teal-700"
        >
          <Plus size={18} />
          {t('sponsoredAdsPage.add')}
        </button>
      </div>

      <div className="premium-card overflow-hidden bg-white">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">{t('sponsoredAdsPage.colPlacement')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">{t('sponsoredAdsPage.colHeadline')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">{t('sponsoredAdsPage.colPriority')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">{t('common.status')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">{t('sponsoredAdsPage.colSchedule')}</th>
              <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-slate-400">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60">
                <td className="px-6 py-4 font-mono text-xs text-slate-700">{row.placement}</td>
                <td className="max-w-xs px-6 py-4 text-sm font-semibold text-slate-800">
                  {row.headline ? displayBilingual(row.headline) : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{row.priority ?? 0}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase',
                      row.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500',
                    )}
                  >
                    {row.is_active ? t('common.active') : t('common.inactive')}
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
                  <button
                    type="button"
                    title={t('sponsoredAdsPage.toggleActive')}
                    onClick={() => void toggleActive(row.id)}
                    className="me-1 inline-flex rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-600"
                  >
                    <Power size={16} />
                  </button>
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
            <SheetTitle>{editingId ? t('sponsoredAdsPage.editTitle') : t('sponsoredAdsPage.createTitle')}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('sponsoredAdsPage.placement')}</span>
              <input
                required
                value={form.placement}
                onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('industriesPage.nameEn')}</span>
              <input
                required
                value={form.headline_en}
                onChange={(e) => setForm((f) => ({ ...f, headline_en: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('industriesPage.nameAr')}</span>
              <input
                required
                dir="rtl"
                value={form.headline_ar}
                onChange={(e) => setForm((f) => ({ ...f, headline_ar: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('sponsoredAdsPage.descriptionEn')}</span>
              <textarea
                rows={2}
                value={form.description_en}
                onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('sponsoredAdsPage.descriptionAr')}</span>
              <textarea
                rows={2}
                dir="rtl"
                value={form.description_ar}
                onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('sponsoredAdsPage.ctaLabelEn')}</span>
              <input
                value={form.cta_label_en}
                onChange={(e) => setForm((f) => ({ ...f, cta_label_en: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('sponsoredAdsPage.ctaLabelAr')}</span>
              <input
                dir="rtl"
                value={form.cta_label_ar}
                onChange={(e) => setForm((f) => ({ ...f, cta_label_ar: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('sponsoredAdsPage.ctaUrl')}</span>
              <input
                value={form.cta_url}
                onChange={(e) => setForm((f) => ({ ...f, cta_url: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('sponsoredAdsPage.companyId')}</span>
              <input
                value={form.company_id}
                onChange={(e) => setForm((f) => ({ ...f, company_id: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('sponsoredAdsPage.externalBrand')}</span>
              <input
                value={form.external_brand}
                onChange={(e) => setForm((f) => ({ ...f, external_brand: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400">{t('sponsoredAdsPage.priority')}</span>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
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
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
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

export default SponsoredAds;
