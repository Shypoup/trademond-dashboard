import * as React from 'react';
import { ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  tagService,
  type AdminTag,
  type AdminTagsListParams,
} from '@services/tagService';
import { ApiRequestError } from '@api/axiosClient';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';
import { Button } from '@/components/ui/button';
import {
  TagsFilters,
  type TagsNeedsReviewFilterValue,
  type TagsSortKey,
  type TagsStatusFilterValue,
} from './components/TagsFilters';
import { TagsTable } from './components/TagsTable';
import { TagFormSheet } from './components/TagFormSheet';
import { DeleteTagDialog } from './components/DeleteTagDialog';
import { useDebouncedValue } from './utils/useDebouncedValue';

/**
 * Admin tags index: filters, pagination, CRUD sheet, synonyms (edit), and guarded delete.
 */
const Tags = () => {
  const { t, i18n } = useTranslation();

  const [rows, setRows] = React.useState<AdminTag[]>([]);
  const [meta, setMeta] = React.useState<{
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(15);
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [statusFilter, setStatusFilter] = React.useState<TagsStatusFilterValue>('');
  const [needsReviewFilter, setNeedsReviewFilter] =
    React.useState<TagsNeedsReviewFilterValue>('');
  const [sortKey, setSortKey] = React.useState<TagsSortKey>('name');
  const [sortDesc, setSortDesc] = React.useState(false);

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [sheetUlid, setSheetUlid] = React.useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = React.useState<AdminTag | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, needsReviewFilter, perPage]);

  const listParams = React.useMemo((): AdminTagsListParams => {
    const sort = `${sortDesc ? '-' : ''}${sortKey}`;
    const p: AdminTagsListParams = {
      page,
      per_page: perPage,
      sort,
    };
    const q = debouncedSearch.trim();
    if (q) p['filter[search]'] = q;
    if (statusFilter) p['filter[status]'] = statusFilter;
    if (needsReviewFilter === 'yes') p['filter[needs_review]'] = true;
    if (needsReviewFilter === 'no') p['filter[needs_review]'] = false;
    return p;
  }, [page, perPage, sortKey, sortDesc, debouncedSearch, statusFilter, needsReviewFilter]);

  const loadTags = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await tagService.getTags(listParams);
      setRows(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setLoading(false);
    }
  }, [listParams, t, i18n.language]);

  React.useEffect(() => {
    void loadTags();
  }, [loadTags]);

  const openCreate = () => {
    setSheetUlid(null);
    setSheetOpen(true);
  };

  const openEdit = (tag: AdminTag) => {
    setSheetUlid(tag.id);
    setSheetOpen(true);
  };

  const handleConflictNavigate = (ulid: string) => {
    setSheetUlid(ulid);
    setSheetOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    try {
      await tagService.deleteTag(pendingDelete.id);
      toast.success(t('tagsPage.tagDeleted'));
      setPendingDelete(null);
      await loadTags();
    } catch (e) {
      if (e instanceof ApiRequestError) {
        toast.error(e.message);
      } else {
        toast.error(e instanceof Error ? e.message : t('tagsPage.deleteFailed'));
      }
    } finally {
      setDeleteBusy(false);
    }
  };

  const lastPage = Math.max(1, meta?.last_page ?? 1);
  const currentPage = meta?.current_page ?? page;
  const total = meta?.total ?? rows.length;

  if (loading && rows.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in space-y-6 pb-12 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-foreground">{t('sidebar.tags')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('tagsPage.subtitle', { count: total })}
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="gap-2">
          <Plus className="size-4" aria-hidden />
          {t('tagsPage.addTag')}
        </Button>
      </div>

      <TagsFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        needsReviewFilter={needsReviewFilter}
        onNeedsReviewFilterChange={setNeedsReviewFilter}
        sortKey={sortKey}
        sortDesc={sortDesc}
        onSortKeyChange={setSortKey}
        onSortDescChange={setSortDesc}
        perPage={perPage}
        onPerPageChange={setPerPage}
      />

      <TagsTable
        rows={rows}
        loading={loading}
        onEdit={openEdit}
        onDelete={setPendingDelete}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t('tagsPage.pageOf', { page: currentPage, totalPages: lastPage })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label={t('common.back')}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= lastPage || loading}
            onClick={() => setPage((p) => p + 1)}
            aria-label={t('common.next')}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <TagFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        tagUlid={sheetUlid}
        onSaved={() => void loadTags()}
        onNavigateConflictTag={handleConflictNavigate}
      />

      <DeleteTagDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        tag={pendingDelete}
        deleting={deleteBusy}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
};

export default Tags;
