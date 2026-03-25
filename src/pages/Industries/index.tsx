import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { taxonomyService, type AdminIndustry } from '@services/taxonomyService';
import { displayBilingual, formatDate } from '@utils/ui';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@utils/core/cn';

/**
 * Admin industries CRUD (`/admin/industries`).
 */
const Industries = () => {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = React.useState<AdminIndustry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name_en: '',
    name_ar: '',
    slug: '',
    active: true,
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await taxonomyService.getIndustries({ per_page: 100 });
      setRows(res.data ?? []);
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
    setForm({ name_en: '', name_ar: '', slug: '', active: true });
    setSheetOpen(true);
  };

  const openEdit = (row: AdminIndustry) => {
    setEditingId(row.id);
    const n = row.name || {};
    setForm({
      name_en: typeof n === 'object' ? String(n.en ?? '') : '',
      name_ar: typeof n === 'object' ? String(n.ar ?? '') : '',
      slug: row.slug ?? '',
      active: row.active !== false,
    });
    setSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: { en: form.name_en.trim(), ar: form.name_ar.trim() },
        active: form.active,
      };
      if (form.slug.trim()) payload.slug = form.slug.trim();
      else payload.slug = null;

      if (editingId) {
        await taxonomyService.updateIndustry(editingId, payload);
        toast.success(t('industriesPage.updated'));
      } else {
        await taxonomyService.createIndustry(payload);
        toast.success(t('industriesPage.created'));
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
    if (!window.confirm(t('industriesPage.confirmDelete'))) return;
    try {
      await taxonomyService.deleteIndustry(id);
      toast.success(t('industriesPage.deleted'));
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground font-outfit">{t('sidebar.industries')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('industriesPage.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-teal-700 transition-colors"
        >
          <Plus size={18} />
          {t('industriesPage.add')}
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('industriesPage.colName')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('industriesPage.colSlug')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('common.status')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('industriesPage.colUpdated')}</th>
              <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 text-sm font-semibold text-foreground">{displayBilingual(row.name)}</td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{row.slug || '—'}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase',
                      row.active !== false
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500',
                    )}
                  >
                    {row.active !== false ? t('common.active') : t('common.inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground">{(row as { updated_at?: string }).updated_at ? formatDate((row as { updated_at?: string }).updated_at) : '—'}</td>
                <td className="px-6 py-4 text-end">
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="me-2 inline-flex rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-teal-600"
                    aria-label={t('common.edit')}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(row.id)}
                    className="inline-flex rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-rose-600"
                    aria-label={t('common.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !loading && (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">{t('common.noData')}</p>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full max-w-lg overflow-y-auto border-slate-200 sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingId ? t('industriesPage.editTitle') : t('industriesPage.createTitle')}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t('industriesPage.nameEn')}</label>
              <input
                required
                value={form.name_en}
                onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t('industriesPage.nameAr')}</label>
              <input
                required
                dir="rtl"
                value={form.name_ar}
                onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t('industriesPage.slugOptional')}</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm outline-none focus:border-slate-800"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="rounded border-slate-300"
              />
              {t('common.active')}
            </label>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setSheetOpen(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
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

export default Industries;
