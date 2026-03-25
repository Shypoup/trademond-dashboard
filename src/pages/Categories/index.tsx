import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { categoryService } from '@services/categoryService';
import { taxonomyService, type AdminIndustry } from '@services/taxonomyService';
import type { Category } from '@data-types/api';
import { displayBilingual, formatDate } from '@utils/ui';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@utils/core/cn';

/**
 * Admin categories CRUD (`/admin/categories`).
 */
const Categories = () => {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = React.useState<Category[]>([]);
  const [industries, setIndustries] = React.useState<AdminIndustry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name_en: '',
    name_ar: '',
    industry_id: '',
    slug: '',
    active: true,
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, indRes] = await Promise.all([
        categoryService.getCategories({ per_page: 100 }),
        taxonomyService.getIndustries({ per_page: 200 }),
      ]);
      setRows(catRes.data ?? []);
      setIndustries(indRes.data ?? []);
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
      industry_id: industries[0]?.id ?? '',
      slug: '',
      active: true,
    });
    setSheetOpen(true);
  };

  const openEdit = (row: Category & { industry_id?: string }) => {
    setEditingId(String(row.id));
    const n = row.name;
    setForm({
      name_en: typeof n === 'object' && n ? String((n as { en?: string }).en ?? '') : '',
      name_ar: typeof n === 'object' && n ? String((n as { ar?: string }).ar ?? '') : '',
      industry_id: row.industry_id ?? (row as { industry?: { id: string } }).industry?.id ?? '',
      slug: (row as { slug?: string }).slug ?? '',
      active: (row as { active?: boolean }).active !== false,
    });
    setSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.industry_id) {
      toast.error(t('categoriesPage.industryRequired'));
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: { en: form.name_en.trim(), ar: form.name_ar.trim() },
        industry_id: form.industry_id,
        active: form.active,
      };
      if (form.slug.trim()) payload.slug = form.slug.trim();
      else payload.slug = null;

      if (editingId) {
        await categoryService.updateCategory(editingId, payload);
        toast.success(t('categoriesPage.updated'));
      } else {
        await categoryService.createCategory(payload);
        toast.success(t('categoriesPage.created'));
      }
      setSheetOpen(false);
      await load();
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm(t('categoriesPage.confirmDelete'))) return;
    try {
      await categoryService.deleteCategory(String(id));
      toast.success(t('categoriesPage.deleted'));
      setRows((prev) => prev.filter((r) => String(r.id) !== String(id)));
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    }
  };

  const industryName = (id: string) => displayBilingual(industries.find((i) => i.id === id)?.name ?? {});

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
          <h1 className="text-2xl font-bold text-slate-900 font-outfit">{t('sidebar.categories')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('categoriesPage.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!industries.length}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
          {t('categoriesPage.add')}
        </button>
      </div>

      <div className="premium-card overflow-hidden bg-white">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">{t('categoriesPage.colName')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">{t('categoriesPage.colIndustry')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">{t('common.status')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">{t('industriesPage.colUpdated')}</th>
              <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-slate-400">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((row) => {
              const ext = row as Category & { industry_id?: string; industry?: { id: string }; slug?: string; active?: boolean; updated_at?: string };
              const iid = ext.industry_id ?? ext.industry?.id ?? '';
              return (
                <tr key={row.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{displayBilingual(row.name)}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">{iid ? industryName(iid) : '—'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase',
                        ext.active !== false
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-500',
                      )}
                    >
                      {ext.active !== false ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{ext.updated_at ? formatDate(ext.updated_at) : '—'}</td>
                  <td className="px-6 py-4 text-end">
                    <button type="button" onClick={() => openEdit(ext)} className="me-2 inline-flex rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-600">
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => void handleDelete(row.id)} className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && !loading && <p className="px-6 py-12 text-center text-sm text-slate-400">{t('common.noData')}</p>}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingId ? t('categoriesPage.editTitle') : t('categoriesPage.createTitle')}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t('categoriesPage.industry')}</label>
              <select
                required
                value={form.industry_id}
                onChange={(e) => setForm((f) => ({ ...f, industry_id: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-slate-800"
              >
                <option value="">{t('categoriesPage.selectIndustry')}</option>
                {industries.map((i) => (
                  <option key={i.id} value={i.id}>
                    {displayBilingual(i.name)}
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

export default Categories;
