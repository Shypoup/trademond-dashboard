import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Image as ImageIcon,
    Trash2,
    HardDrive,
    Link as LinkIcon,
    AlertTriangle,
    Loader2,
    Search,
    ChevronLeft,
    ChevronRight,
    Database,
    FileImage,
    FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { systemService } from '@services/systemService';
import { Media } from '@data-types/api';
import { formatDate } from '@utils/ui';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

/** Rows-per-page options for media pagination. */
const ROWS_OPTIONS = [10, 25, 50] as const;

/**
 * Returns the best available file name from a media object,
 * accounting for both camelCase and snake_case API shapes.
 */
const getFileName = (m: Media): string =>
    m.fileName || m.file_name || m.name || 'Unknown';

/**
 * Returns the best available mime type from a media object.
 */
const getMimeType = (m: Media): string =>
    m.mimeType || m.mime_type || '';

/**
 * Returns the best available collection name from a media object.
 */
const getCollectionName = (m: Media): string =>
    m.collectionName || m.collection_name || '';

/**
 * Returns the best available creation date from a media object.
 */
const getCreatedAt = (m: Media): string =>
    m.createdAt || m.created_at || '';

/**
 * Formats byte count into a human-readable string.
 */
const formatBytes = (bytes?: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Picks the right icon for a given mime type.
 */
const MimeIcon: React.FC<{ mime: string }> = ({ mime }) => {
    if (mime.startsWith('image/')) return <FileImage size={14} className="text-violet-500" />;
    return <FileText size={14} className="text-muted-foreground" />;
};

/**
 * Media Explorer page – lists all platform media assets
 * with search, pagination, preview thumbnails, and owner info.
 */
const MediaManagement = () => {
    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(true);
    const [medias, setMedias] = React.useState<Media[]>([]);
    const [totalMedias, setTotalMedias] = React.useState(0);

    const [search, setSearch] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(ROWS_OPTIONS[0]);

    const [deleteTarget, setDeleteTarget] = React.useState<Media | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const fetchMedias = async () => {
        setLoading(true);
        try {
            const response = await systemService.getMedia();
            if (response.data) {
                setMedias(response.data);
                setTotalMedias(response.meta?.total || response.data.length);
            }
        } catch {
            toast.error(t('media.fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchMedias();
    }, []);

    const filtered = React.useMemo(() => {
        if (!search.trim()) return medias;
        const q = search.toLowerCase();
        return medias.filter((m) => {
            const name = getFileName(m).toLowerCase();
            const collection = getCollectionName(m).toLowerCase();
            const ownerName = (m.owner?.meta?.name ?? '').toLowerCase();
            const mime = getMimeType(m).toLowerCase();
            return name.includes(q) || collection.includes(q) || ownerName.includes(q) || mime.includes(q);
        });
    }, [medias, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const paginated = React.useMemo(
        () => filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage),
        [filtered, page, rowsPerPage],
    );

    React.useEffect(() => {
        setPage(1);
    }, [search, rowsPerPage]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await systemService.deleteMedia(deleteTarget.id);
            setMedias((prev) => prev.filter((m) => m.id !== deleteTarget.id));
            setTotalMedias((prev) => prev - 1);
            toast.success(t('media.deleteSuccess'));
        } catch {
            toast.error(t('media.deleteFailed'));
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    const stats = React.useMemo(() => {
        const totalSize = medias.reduce((sum, m) => sum + (m.size ?? 0), 0);
        const imageCount = medias.filter((m) => getMimeType(m).startsWith('image/')).length;
        return { totalSize, imageCount };
    }, [medias]);

    if (loading && medias.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground animate-pulse">
                        {t('media.loading')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">
                        {t('media.title')}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('media.subtitle', { count: totalMedias })}
                    </p>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard
                    icon={<Database size={16} className="text-primary" />}
                    label={t('media.totalAssets')}
                    value={String(totalMedias)}
                    bg="bg-primary/10 dark:bg-primary/20"
                />
                <StatCard
                    icon={<FileImage size={16} className="text-violet-600 dark:text-violet-400" />}
                    label={t('media.images')}
                    value={String(stats.imageCount)}
                    bg="bg-violet-500/10 dark:bg-violet-950/40"
                />
                <StatCard
                    icon={<HardDrive size={16} className="text-sky-600 dark:text-sky-400" />}
                    label={t('media.totalSize')}
                    value={formatBytes(stats.totalSize)}
                    bg="bg-sky-500/10 dark:bg-sky-950/40"
                />
            </div>

            {/* Table card */}
            <div className="premium-card overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-4 border-b border-border bg-muted/40 p-4">
                    <div className="relative min-w-[280px] flex-1">
                        <Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('media.searchPlaceholder')}
                            className="h-10 w-full rounded-xl border border-border bg-background ps-11 pe-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Database size={14} />
                        <span>{t('media.filteredCount', { count: filtered.length })}</span>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {t('media.colAssetName')}
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {t('media.colMimeType')}
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {t('media.colSize')}
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {t('media.colOwner')}
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {t('media.colCollection')}
                                </th>
                                <th className="px-6 py-4 text-end text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {t('common.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginated.map((media) => {
                                const mime = getMimeType(media);
                                const isImage = mime.startsWith('image/');
                                const ownerName = media.owner?.meta?.name;
                                const ownerType = media.owner?.data?.type;

                                return (
                                    <tr key={media.id} className="group transition-colors hover:bg-muted/50">
                                        {/* Asset name + thumbnail */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {isImage ? (
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                                                        {media.url ? (
                                                            <img
                                                                src={media.url}
                                                                alt="asset"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageIcon size={16} className="text-muted-foreground" />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                                                        <HardDrive size={16} />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="line-clamp-1 max-w-[220px] break-all text-xs font-bold text-foreground">
                                                        {getFileName(media)}
                                                    </p>
                                                    <p className="mt-0.5 max-w-[220px] truncate font-mono text-[10px] text-muted-foreground">
                                                        {media.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Mime type */}
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                                <MimeIcon mime={mime} />
                                                {mime}
                                            </span>
                                        </td>

                                        {/* Size */}
                                        <td className="px-6 py-4 text-xs font-bold text-muted-foreground">
                                            {formatBytes(media.size)}
                                        </td>

                                        {/* Owner */}
                                        <td className="px-6 py-4">
                                            {ownerName ? (
                                                <div>
                                                    <p className="line-clamp-1 max-w-[180px] text-xs font-bold text-foreground">
                                                        {ownerName}
                                                    </p>
                                                    {ownerType && (
                                                        <span className="text-[10px] font-medium capitalize text-muted-foreground">
                                                            {ownerType}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </td>

                                        {/* Collection & disk */}
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold capitalize text-foreground">
                                                {getCollectionName(media)}
                                            </div>
                                            <div className="mt-0.5 text-[10px] text-muted-foreground">
                                                {t('media.disk')}: {media.disk || 'local'}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 pe-4 text-end">
                                            <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                {media.url && (
                                                    <a
                                                        href={media.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-primary"
                                                        title={t('media.viewSource')}
                                                    >
                                                        <LinkIcon size={16} />
                                                    </a>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(media)}
                                                    className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-destructive/10 hover:text-destructive"
                                                    title={t('common.delete')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        {t('media.noAssets')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-3.5">
                    <div className="flex items-center gap-3">
                        <p className="text-xs font-medium text-muted-foreground">
                            {t('media.rowsPerPage')}
                        </p>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            className="h-7 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring/30"
                        >
                            {ROWS_OPTIONS.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            {t('media.pageOf', { page, totalPages })}
                        </span>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete confirmation dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="sm:!max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <DialogTitle className="text-base font-bold text-foreground">
                                {t('media.deleteTitle')}
                            </DialogTitle>
                        </div>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {t('media.deleteMessage', { name: deleteTarget ? getFileName(deleteTarget) : '' })}
                    </p>
                    <DialogFooter className="mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                            disabled={isDeleting}
                            className="font-semibold"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="font-semibold"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('common.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

/** Props for the small stat card at the top of the page. */
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    bg: string;
}

/** Compact stat card for media metrics. */
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, bg }) => (
    <div className={`flex items-center gap-3 rounded-xl border border-border px-4 py-3.5 ${bg}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card shadow-sm">
            {icon}
        </div>
        <div>
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        </div>
    </div>
);

export default MediaManagement;
