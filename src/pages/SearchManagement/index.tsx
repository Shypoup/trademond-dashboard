import React from 'react';
import { Search, RotateCw, Trash2, Database, Loader2, Zap } from 'lucide-react';
import { systemService } from '@services/systemService';
import { SearchIndex } from '@data-types/api';

const SearchManagement = () => {
    const [statusData, setStatusData] = React.useState<any>(null);
    const [indexes, setIndexes] = React.useState<SearchIndex[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [reindexingAll, setReindexingAll] = React.useState(false);
    const [actionState, setActionState] = React.useState<Record<string, boolean>>({});

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const stats = await systemService.getSearchStatus();
            if (stats) setStatusData(stats);
            const inds = await systemService.getSearchIndexes();
            if (inds) setIndexes(inds.data || inds || []);
        } catch (error) {
            console.warn('Search metrics unavailable', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchStatus();
    }, []);

    const handleReindexAll = async () => {
        if (!window.confirm('Trigger global async re-indexing? This operation consumes high background CPU.')) return;
        setReindexingAll(true);
        try {
            await systemService.reindexAll();
            alert('Global re-indexing started mapped into background queues.');
            fetchStatus();
        } catch {
            alert('Re-indexing throttle - Try again later');
        } finally {
            setReindexingAll(false);
        }
    };

    const handleReindexSpecific = async (type: string) => {
        setActionState(prev => ({ ...prev, [`reindex_${type}`]: true }));
        try {
            await systemService.reindexByType(type);
            alert(`Re-indexing triggered for: ${type}`);
            fetchStatus();
        } catch {
            alert(`Throttle reached for ${type} re-index`);
        } finally {
            setActionState(prev => ({ ...prev, [`reindex_${type}`]: false }));
        }
    };

    const handleFlush = async (type: string) => {
        if (!window.confirm(`Warning: Completely flush documents mapping for type: ${type}?`)) return;
        setActionState(prev => ({ ...prev, [`flush_${type}`]: true }));
        try {
            await systemService.flushByType(type);
            alert(`Flushed index: ${type}`);
            fetchStatus();
        } catch {
            alert('Flush op restricted.');
        } finally {
            setActionState(prev => ({ ...prev, [`flush_${type}`]: false }));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">Search Matrix</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Meilisearch / Elastic routing stats</p>
                </div>
                <button
                    onClick={handleReindexAll}
                    disabled={reindexingAll}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                    {reindexingAll ? <Loader2 size={18} className="animate-spin" /> : <RotateCw size={18} />} Resync Registry
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Cluster Engine', value: statusData?.engine || 'Elastic/Scout', icon: Database, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10 dark:bg-indigo-950/40' },
                    { label: 'Cluster Health', value: statusData?.health || 'Operational', icon: Zap, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-950/40' },
                    { label: 'Total Indices', value: indexes.length || '0', icon: Search, color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/20' },
                ].map((stat, idx) => (
                    <div key={idx} className="premium-card p-6">
                        <div className="flex items-center justify-between">
                            <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}><stat.icon size={24} /></div>
                        </div>
                        <h3 className="mt-4 font-outfit text-2xl font-bold text-foreground">{stat.value}</h3>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="premium-card overflow-hidden">
                <div className="border-b border-border bg-muted/30 p-6">
                    <h3 className="text-lg font-bold text-foreground">Node Bindings</h3>
                </div>
                {loading && indexes.length === 0 ? (
                    <div className="p-8 font-medium text-muted-foreground">Inspecting partitions...</div>
                ) : (
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Namespace</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Indexed Docs</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Last Synchronization</th>
                                <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {indexes.map((idxStrOrObj, i) => {
                                // sometimes api returns array of strings. Fallback accordingly.
                                const idxName = typeof idxStrOrObj === 'string' ? idxStrOrObj : idxStrOrObj.name;
                                const docCount = typeof idxStrOrObj === 'object' ? idxStrOrObj.count : '-';
                                const lastTs = typeof idxStrOrObj === 'object' ? idxStrOrObj.last_indexed_at : '-';

                                return (
                                    <tr key={i} className="transition-colors hover:bg-muted/50">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3 text-sm font-bold capitalize text-foreground">
                                                <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                                                <span>{idxName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-mono text-sm font-bold text-muted-foreground">{docCount}</td>
                                        <td className="px-6 py-5 text-xs text-muted-foreground">{lastTs}</td>
                                        <td className="px-6 py-5 text-end">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    disabled={actionState[`reindex_${idxName}`]}
                                                    onClick={() => handleReindexSpecific(idxName)}
                                                    className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
                                                >
                                                    {actionState[`reindex_${idxName}`] ? <Loader2 size={12} className="animate-spin" /> : <RotateCw size={12} />} Re-map
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={actionState[`flush_${idxName}`]}
                                                    onClick={() => handleFlush(idxName)}
                                                    className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
                                                >
                                                    {actionState[`flush_${idxName}`] ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Drop
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {indexes.length === 0 && !loading && <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No active Search schemas registered.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SearchManagement;
