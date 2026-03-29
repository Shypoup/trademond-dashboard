import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { socialPlatformService } from '@services/socialPlatformService';
import type { SocialPlatform } from '@data-types/api';
import { displayBilingual, formatDate } from '@utils/ui';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@utils/core/cn';

/**
 * Admin social platforms: list, create (multipart), edit, icon upload, delete.
 */
const SocialPlatforms = () => {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = React.useState<SocialPlatform[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SocialPlatform | null>(null);
  const [form, setForm] = React.useState({
    name_en: '',
    name_ar: '',
    input_type: 'url' as SocialPlatform['input_type'],
    base_url: '',
    placeholder_en: '',
    placeholder_ar: '',
    active: true,
  });
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await socialPlatformService.getSocialPlatforms({ per_page: 100 });
      setRows((res.data ?? []) as SocialPlatform[]);
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
    setEditing(null);
    setForm({
      name_en: '',
      name_ar: '',
      input_type: 'url',
      base_url: 'https://',
      placeholder_en: '',
      placeholder_ar: '',
      active: true,
    });
    setSheetOpen(true);
  };

  const openEdit = (row: SocialPlatform) => {
    setEditing(row);
    const n = row.name;
    setForm({
      name_en: typeof n === 'object' ? String(n.en ?? '') : '',
      name_ar: typeof n === 'object' ? String(n.ar ?? '') : '',
      input_type: row.input_type,
      base_url: row.base_url ?? '',
      placeholder_en: row.placeholder && typeof row.placeholder === 'object' ? String(row.placeholder.en ?? '') : '',
      placeholder_ar: row.placeholder && typeof row.placeholder === 'object' ? String(row.placeholder.ar ?? '') : '',
      active: row.active,
    });
    setSheetOpen(true);
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name[en]', form.name_en.trim());
      fd.append('name[ar]', form.name_ar.trim());
      fd.append('input_type', form.input_type);
      fd.append('base_url', form.base_url.trim());
      fd.append('active', form.active ? '1' : '0');
      if (form.placeholder_en.trim() || form.placeholder_ar.trim()) {
        fd.append('placeholder[en]', form.placeholder_en.trim());
        fd.append('placeholder[ar]', form.placeholder_ar.trim());
      }
      await socialPlatformService.createSocialPlatform(fd);
      toast.success(t('socialPlatformsPage.created'));
      setSheetOpen(false);
      await load();
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setSaving(false);
    }
  };

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await socialPlatformService.updateSocialPlatform(editing.id, {
        name: { en: form.name_en.trim(), ar: form.name_ar.trim() },
        input_type: form.input_type,
        base_url: form.base_url.trim() || undefined,
        placeholder:
          form.placeholder_en.trim() || form.placeholder_ar.trim()
            ? { en: form.placeholder_en.trim(), ar: form.placeholder_ar.trim() }
            : undefined,
        active: form.active,
      });
      toast.success(t('socialPlatformsPage.updated'));
      setSheetOpen(false);
      await load();
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setSaving(false);
    }
  };

  const uploadIcon = async (id: string, files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('icon', file);
      await socialPlatformService.uploadIcon(id, fd);
      toast.success(t('socialPlatformsPage.iconUpdated'));
      await load();
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('socialPlatformsPage.confirmDelete'))) return;
    try {
      await socialPlatformService.deleteSocialPlatform(id);
      toast.success(t('socialPlatformsPage.deleted'));
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
          <h1 className="text-2xl font-bold text-foreground font-outfit">{t('sidebar.socialPlatforms')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('socialPlatformsPage.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-teal-700"
        >
          <Plus size={18} />
          {t('socialPlatformsPage.add')}
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('socialPlatformsPage.colName')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('socialPlatformsPage.colInput')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('socialPlatformsPage.colBaseUrl')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('common.status')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('socialPlatformsPage.colUpdated')}</th>
              <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 text-sm font-semibold text-foreground">{displayBilingual(row.name)}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-600">{row.input_type}</td>
                <td className="max-w-[200px] truncate px-6 py-4 font-mono text-xs text-muted-foreground">{row.base_url ?? '—'}</td>
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
                <td className="px-6 py-4 text-xs text-muted-foreground">{row.updated_at ? formatDate(row.updated_at) : '—'}</td>
                <td className="px-6 py-4 text-end">
                  <button
                    type="button"
                    title={t('socialPlatformsPage.uploadIcon')}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = () => void uploadIcon(row.id, input.files);
                      input.click();
                    }}
                    className="me-1 inline-flex rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-teal-600"
                  >
                    <ImageIcon size={16} />
                  </button>
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
        <SheetContent className="w-full max-w-lg overflow-y-auto border-border sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editing ? t('socialPlatformsPage.editTitle') : t('socialPlatformsPage.createTitle')}</SheetTitle>
          </SheetHeader>
          {editing ? (
            <form onSubmit={(e) => void submitUpdate(e)} className="space-y-4">
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('industriesPage.nameEn')}</span>
                <input
                  required
                  value={form.name_en}
                  onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('industriesPage.nameAr')}</span>
                <input
                  required
                  dir="rtl"
                  value={form.name_ar}
                  onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('socialPlatformsPage.inputType')}</span>
                <select
                  value={form.input_type}
                  onChange={(e) => setForm((f) => ({ ...f, input_type: e.target.value as SocialPlatform['input_type'] }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                >
                  <option value="username">username</option>
                  <option value="url">url</option>
                  <option value="phone">phone</option>
                  <option value="email">email</option>
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('socialPlatformsPage.baseUrl')}</span>
                <input
                  value={form.base_url}
                  onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('socialPlatformsPage.placeholderEn')}</span>
                <input
                  value={form.placeholder_en}
                  onChange={(e) => setForm((f) => ({ ...f, placeholder_en: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('socialPlatformsPage.placeholderAr')}</span>
                <input
                  dir="rtl"
                  value={form.placeholder_ar}
                  onChange={(e) => setForm((f) => ({ ...f, placeholder_ar: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="rounded border-border" />
                {t('common.active')}
              </label>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setSheetOpen(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {t('common.save')}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={(e) => void submitCreate(e)} className="space-y-4">
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('industriesPage.nameEn')}</span>
                <input
                  required
                  value={form.name_en}
                  onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('industriesPage.nameAr')}</span>
                <input
                  required
                  dir="rtl"
                  value={form.name_ar}
                  onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('socialPlatformsPage.inputType')}</span>
                <select
                  value={form.input_type}
                  onChange={(e) => setForm((f) => ({ ...f, input_type: e.target.value as SocialPlatform['input_type'] }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                >
                  <option value="username">username</option>
                  <option value="url">url</option>
                  <option value="phone">phone</option>
                  <option value="email">email</option>
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">{t('socialPlatformsPage.baseUrl')}</span>
                <input
                  value={form.base_url}
                  onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="rounded border-border" />
                {t('common.active')}
              </label>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setSheetOpen(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {t('common.save')}
                </button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SocialPlatforms;
