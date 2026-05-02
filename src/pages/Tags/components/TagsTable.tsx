import * as React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AdminTag } from '@services/tagService';
import { displayBilingual, formatDate } from '@utils/ui';
import { cn } from '@utils/core/cn';
import { getTagNameLocales, getTagUsageTotal, isTagNeedsReview } from '../utils/tagFormHelpers';

export interface TagsTableProps {
  rows: AdminTag[];
  loading: boolean;
  onEdit: (tag: AdminTag) => void;
  onDelete: (tag: AdminTag) => void;
}

/**
 * Paginated admin tags table with usage counts and actions.
 */
export function TagsTable({ rows, loading, onEdit, onDelete }: TagsTableProps) {
  const { t } = useTranslation();

  const displayName = (tag: AdminTag) => {
    const loc = getTagNameLocales(tag);
    if (loc.en || loc.ar) {
      return displayBilingual({ en: loc.en, ar: loc.ar });
    }
    return tag.name || '—';
  };

  return (
    <div className="premium-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-start">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">
                {t('tagsPage.colName')}
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">
                {t('tagsPage.colSlug')}
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">
                {t('common.status')}
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">
                {t('tagsPage.colNeedsReview')}
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">
                {t('tagsPage.colUsage')}
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">
                {t('tagsPage.colSynonyms')}
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">
                {t('tagsPage.colUpdated')}
              </th>
              <th className="px-4 py-3 text-end text-[11px] font-bold uppercase text-muted-foreground">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((tag) => {
              const usage = getTagUsageTotal(tag);
              return (
                <tr key={tag.id} className={cn('hover:bg-muted/40', loading && 'opacity-60')}>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">{displayName(tag)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tag.slug || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase',
                        tag.status === 'active'
                          ? 'border-primary/30 bg-primary/10 text-primary'
                          : 'border-muted-foreground/30 bg-muted text-muted-foreground',
                      )}
                    >
                      {tag.status === 'active' ? t('tagsPage.statusActive') : t('tagsPage.statusHidden')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {isTagNeedsReview(tag) ? t('common.yes') : t('common.no')}
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">{usage}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">
                    {tag.synonymsCount ?? 0}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {tag.updatedAt ? formatDate(tag.updatedAt) : '—'}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => onEdit(tag)}
                      className="me-1 inline-flex rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-primary"
                      aria-label={t('common.edit')}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(tag)}
                      disabled={usage > 0}
                      title={usage > 0 ? t('tagsPage.deleteBlockedHint') : undefined}
                      className="inline-flex rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={t('common.delete')}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && !loading && (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">{t('common.noData')}</p>
      )}
    </div>
  );
}
