import * as React from 'react';
import { Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  tagService,
  type AdminTag,
  type AdminTagWritePayload,
} from '@services/tagService';
import { ApiRequestError } from '@api/axiosClient';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { TagSynonymsPanel } from './TagSynonymsPanel';
import { getTagNameLocales, hasAtLeastOneLocaleName } from '../utils/tagFormHelpers';

export interface TagFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` creates a new tag; ULID loads edit mode. */
  tagUlid: string | null;
  /** Called after a successful create or update (parent should refetch the list). */
  onSaved: () => void;
  /** Opens another tag when the API reports a duplicate conflict (`conflict.ulid`). */
  onNavigateConflictTag?: (ulid: string) => void;
}

interface FormState {
  name_en: string;
  name_ar: string;
  slug: string;
  status: 'active' | 'hidden';
  needs_review: boolean;
}

const emptyForm = (): FormState => ({
  name_en: '',
  name_ar: '',
  slug: '',
  status: 'active',
  needs_review: false,
});

function formFromTag(tag: AdminTag): FormState {
  const n = getTagNameLocales(tag);
  return {
    name_en: n.en,
    name_ar: n.ar,
    slug: tag.slug ?? '',
    status: tag.status === 'hidden' ? 'hidden' : 'active',
    needs_review: tag.needsReview === true,
  };
}

function buildWritePayload(form: FormState): AdminTagWritePayload {
  const name: { en?: string; ar?: string } = {};
  if (form.name_en.trim()) name.en = form.name_en.trim();
  if (form.name_ar.trim()) name.ar = form.name_ar.trim();
  return {
    name,
    slug: form.slug.trim() ? form.slug.trim() : null,
    status: form.status,
    needs_review: form.needs_review,
  };
}

/**
 * Create/edit sheet for admin tags: bilingual name, optional slug, status, review flag.
 * Synonyms editor is shown only when editing an existing tag (per API).
 */
export function TagFormSheet({
  open,
  onOpenChange,
  tagUlid,
  onSaved,
  onNavigateConflictTag,
}: TagFormSheetProps) {
  const { t } = useTranslation();
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [loadingTag, setLoadingTag] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    if (!tagUlid) {
      setForm(emptyForm());
      return;
    }

    let cancelled = false;
    setLoadingTag(true);
    void tagService
      .getTag(tagUlid)
      .then((tag) => {
        if (!cancelled) setForm(formFromTag(tag));
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : t('tagsPage.loadTagFailed'));
        if (!cancelled) onOpenChange(false);
      })
      .finally(() => {
        if (!cancelled) setLoadingTag(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, tagUlid, onOpenChange, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameCheck = { en: form.name_en, ar: form.name_ar };
    if (!hasAtLeastOneLocaleName(nameCheck)) {
      toast.error(t('tagsPage.validationOneLocale'));
      return;
    }

    setSaving(true);
    try {
      const payload = buildWritePayload(form);
      if (tagUlid) {
        await tagService.updateTag(tagUlid, payload);
        toast.success(t('tagsPage.tagUpdated'));
      } else {
        await tagService.createTag(payload);
        toast.success(t('tagsPage.tagCreated'));
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const body = err.body as { conflict?: { ulid?: string } } | undefined;
        const conflictUlid = body?.conflict?.ulid;
        if (conflictUlid && onNavigateConflictTag) {
          toast.error(err.message, {
            action: {
              label: t('tagsPage.conflictGoToTag'),
              onClick: () => onNavigateConflictTag(conflictUlid),
            },
          });
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error(err instanceof Error ? err.message : t('tagsPage.saveFailed'));
      }
    } finally {
      setSaving(false);
    }
  };

  const title = tagUlid ? t('tagsPage.editTitle') : t('tagsPage.createTitle');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full max-w-lg flex-col gap-0 overflow-hidden border-border p-0 sm:max-w-lg">
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
          <SheetHeader className="space-y-0 p-0">
            <SheetTitle className="font-outfit text-xl font-bold">{title}</SheetTitle>
          </SheetHeader>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label={t('common.cancel')}
          >
            <X className="size-5" />
          </button>
        </div>

        {loadingTag && tagUlid ? (
          <div className="flex flex-1 items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" aria-hidden />
            <span>{t('common.loading')}</span>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="premium-scrollbar flex-1 space-y-5 overflow-y-auto px-6 py-6">
              <form
                id="admin-tag-form"
                onSubmit={(e) => void handleSubmit(e)}
                className="space-y-5"
              >
                <p className="text-xs text-muted-foreground">{t('tagsPage.slugChangeHint')}</p>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {t('tagsPage.nameEn')}
                  </label>
                  <input
                    value={form.name_en}
                    onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-end text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {t('tagsPage.nameAr')}
                  </label>
                  <input
                    dir="rtl"
                    value={form.name_ar}
                    onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-end text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {t('tagsPage.slugOptional')}
                  </label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    className="font-mono w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
                    placeholder={t('tagsPage.slugPlaceholder')}
                    autoComplete="off"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      {t('common.status')}
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          status: e.target.value as 'active' | 'hidden',
                        }))
                      }
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
                    >
                      <option value="active">{t('tagsPage.statusActive')}</option>
                      <option value="hidden">{t('tagsPage.statusHidden')}</option>
                    </select>
                  </div>
                  <label className="flex cursor-pointer items-center gap-3 pt-8 sm:pt-6">
                    <input
                      type="checkbox"
                      checked={form.needs_review}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, needs_review: e.target.checked }))
                      }
                      className="size-4 rounded border-border"
                    />
                    <span className="text-sm font-medium">{t('tagsPage.needsReview')}</span>
                  </label>
                </div>
              </form>

              {tagUlid ? <TagSynonymsPanel tagUlid={tagUlid} /> : null}
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-muted/40 px-6 py-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" form="admin-tag-form" disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                {t('tagsPage.saveTag')}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
