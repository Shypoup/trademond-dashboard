import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { categoryService } from '@services/categoryService';
import { taxonomyService, type AdminExpertise } from '@services/taxonomyService';
import type { Category } from '@data-types/api';
import { displayBilingual } from '@utils/ui';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@utils/core/cn';

/**
 * Admin expertises CRUD (`/admin/expertises`).
 */
const Expertises = () => {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = React.useState<AdminExpertise[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name_en: '',
    name_ar: '',
    category_id: '',
    isic_code: '',
    slug: '',
    active: true,
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [exRes, catRes] = await Promise.all([
        taxonomyService.getExpertises({ per_page: 200 }),
        categoryService.getCategories({ per_page: 500 }),
      ]);
      setRows(exRes.data ?? []);
      setCategories(catRes.data ?? []);
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
      name_en: '',
      name_ar: '',
      category_id: categories[0]?.id ? String(categories[0].id) : '',
      isic_code: '',
      slug: '',
      active: true,
    });
    setSheetOpen(true);
  };

  const openEdit = (row: AdminExpertise) => {
    setEditingId(row.id);
    const n = row.name || {};
    setForm({
      name_en: typeof n === 'object' ? String(n.en ?? '') : '',
      name_ar: typeof n === 'object' ? String(n.ar ?? '') : '',
      category_id: row.category_id,
      isic_code: row.isic_code ?? '',
      slug: row.slug ?? '',
      active: row.active !== false,
    });
    setSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id) {
      toast.error(t('expertisesPage.categoryRequired'));
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: { en: form.name_en.trim(), ar: form.name_ar.trim() },
        category_id: form.category_id,
        active: form.active,
      };
      if (form.isic_code.trim()) payload.isic_code = form.isic_code.trim();
      else payload.isic_code = null;
      if (form.slug.trim()) payload.slug = form.slug.trim();
      else payload.slug = null;

      if (editingId) {
        await taxonomyService.updateExpertise(editingId, payload);
        toast.success(t('expertisesPage.updated'));
      } else {
        await taxonomyService.createExpertise(payload);
        toast.success(t('expertisesPage.created'));
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
    if (!window.confirm(t('expertisesPage.confirmDelete'))) return;
    try {
      await taxonomyService.deleteExpertise(id);
      toast.success(t('expertisesPage.deleted'));
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    }
  };

  const categoryLabel = (id: string) => {
    const c = categories.find((x) => String(x.id) === String(id));
    return c ? displayBilingual(c.name) : id;
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
          <h1 className="text-2xl font-bold text-foreground font-outfit">{t('sidebar.expertises')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('expertisesPage.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!categories.length}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
          {t('expertisesPage.add')}
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('expertisesPage.colName')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('expertisesPage.colCategory')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('expertisesPage.colIsic')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('common.status')}</th>
              <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 text-sm font-semibold text-foreground">{displayBilingual(row.name)}</td>
                <td className="px-6 py-4 text-xs text-slate-600">{categoryLabel(row.category_id)}</td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{row.isic_code || '—'}</td>
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
                <td className="px-6 py-4 text-end">
                  <button type="button" onClick={() => openEdit(row)} className="me-2 inline-flex rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-teal-600">
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => void handleDelete(row.id)} className="inline-flex rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-rose-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !loading && <p className="px-6 py-12 text-center text-sm text-muted-foreground">{t('common.noData')}</p>}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingId ? t('expertisesPage.editTitle') : t('expertisesPage.createTitle')}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t('expertisesPage.category')}</label>
              <select
                required
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-slate-800"
              >
                <option value="">{t('expertisesPage.selectCategory')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {displayBilingual(c.name)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t('industriesPage.nameEn')}</label>
              <input
                required
                value={form.name_en}
                onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t('industriesPage.nameAr')}</label>
              <input
                required
                dir="rtl"
                value={form.name_ar}
                onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t('expertisesPage.isicOptional')}</label>
              <input
                value={form.isic_code}
                onChange={(e) => setForm((f) => ({ ...f, isic_code: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm outline-none focus:border-slate-800"
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
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="rounded border-slate-300" />
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

export default Expertises;
