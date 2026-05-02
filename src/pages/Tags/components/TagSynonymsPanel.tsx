import * as React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  tagService,
  type AdminTagSynonym,
  type TagSynonymsListMeta,
} from '@services/tagService';
import { ApiRequestError } from '@api/axiosClient';
import { Button } from '@/components/ui/button';
import { cn } from '@utils/core/cn';

export interface TagSynonymsPanelProps {
  /** Canonical tag ULID */
  tagUlid: string;
  className?: string;
}

/**
 * Lists synonyms for a tag, supports create (POST) and delete; no update (API design).
 */
export function TagSynonymsPanel({ tagUlid, className }: TagSynonymsPanelProps) {
  const { t } = useTranslation();
  const [items, setItems] = React.useState<AdminTagSynonym[]>([]);
  const [meta, setMeta] = React.useState<TagSynonymsListMeta | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [value, setValue] = React.useState('');
  const [locale, setLocale] = React.useState<'any' | 'en' | 'ar'>('any');
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await tagService.listSynonyms(tagUlid);
      setItems(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('tagsPage.synonymsLoadFailed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [tagUlid, t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      await tagService.createSynonym(tagUlid, {
        value: trimmed,
        locale: locale === 'any' ? null : locale,
      });
      setValue('');
      toast.success(t('tagsPage.synonymAdded'));
      await load();
    } catch (err) {
      if (err instanceof ApiRequestError && err.body && typeof err.body === 'object') {
        toast.error(err.message);
      } else {
        toast.error(err instanceof Error ? err.message : t('tagsPage.synonymAddFailed'));
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (syn: AdminTagSynonym) => {
    try {
      await tagService.deleteSynonym(tagUlid, syn.id);
      toast.success(t('tagsPage.synonymDeleted'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('tagsPage.synonymDeleteFailed'));
    }
  };

  return (
    <div className={cn('space-y-4 border-t border-border pt-6', className)}>
      <div>
        <h3 className="text-sm font-bold text-foreground">{t('tagsPage.synonymsTitle')}</h3>
        {meta?.truncated ? (
          <p className="mt-1 text-xs text-muted-foreground">{t('tagsPage.synonymsTruncatedWarning')}</p>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('common.loading')}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('tagsPage.noSynonyms')}</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {items.map((syn) => (
            <li
              key={syn.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <span className="font-medium text-foreground">{syn.value}</span>
                <span className="ms-2 font-mono text-xs text-muted-foreground">
                  {syn.locale == null || syn.locale === ''
                    ? t('tagsPage.synonymLocaleAny')
                    : String(syn.locale)}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => void handleDelete(syn)}
                aria-label={t('common.delete')}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={(e) => void handleAdd(e)} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('tagsPage.synonymValue')}
            </label>
            <input
              value={value}
              onChange={(ev) => setValue(ev.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
              placeholder={t('tagsPage.synonymValuePlaceholder')}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('tagsPage.synonymLocale')}
            </label>
            <select
              value={locale}
              onChange={(ev) => setLocale(ev.target.value as 'any' | 'en' | 'ar')}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
            >
              <option value="any">{t('tagsPage.synonymLocaleAny')}</option>
              <option value="en">en</option>
              <option value="ar">ar</option>
            </select>
          </div>
        </div>
        <Button type="submit" disabled={adding || !value.trim()} size="sm">
          {adding ? <Loader2 className="size-4 animate-spin" /> : null}
          {t('tagsPage.addSynonym')}
        </Button>
      </form>
    </div>
  );
}
