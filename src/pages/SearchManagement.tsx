import React from 'react';
import { Search, RotateCw, Trash2, Database, Loader2, Zap } from 'lucide-react';
import { systemService } from '../services/systemService';
import { SearchIndex } from '../types/api';

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
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Search Matrix</h2>
                    <p className="text-slate-500 text-sm mt-1">Meilisearch / Elastic routing stats</p>
                </div>
                <button
                    onClick={handleReindexAll}
                    disabled={reindexingAll}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 rounded-xl text-sm font-bold text-white shadow-lg disabled:opacity-50 transition-all hover:bg-black"
                >
                    {reindexingAll ? <Loader2 size={18} className="animate-spin" /> : <RotateCw size={18} />} Resync Registry
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Cluster Engine', value: statusData?.engine || 'Elastic/Scout', icon: Database, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Cluster Health', value: statusData?.health || 'Operational', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Total Indices', value: indexes.length || '0', icon: Search, color: 'text-teal-500', bg: 'bg-teal-50' },
                ].map((stat, idx) => (
                    <div key={idx} className="premium-card p-6">
                        <div className="flex items-center justify-between">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}><stat.icon size={24} /></div>
                        </div>
                        <h3 className="text-2xl font-bold font-outfit text-slate-800 mt-4">{stat.value}</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="premium-card overflow-hidden bg-white">
                <div className="p-6 border-b border-slate-50">
                    <h3 className="text-lg font-bold">Node Bindings</h3>
                </div>
                {loading && indexes.length === 0 ? (
                    <div className="p-8 text-slate-400">Inspecting partitions...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Namespace</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Indexed Docs</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Last Synchronization</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {indexes.map((idxStrOrObj, i) => {
                                // sometimes api returns array of strings. Fallback accordingly.
                                const idxName = typeof idxStrOrObj === 'string' ? idxStrOrObj : idxStrOrObj.name;
                                const docCount = typeof idxStrOrObj === 'object' ? idxStrOrObj.count : '-';
                                const lastTs = typeof idxStrOrObj === 'object' ? idxStrOrObj.last_indexed_at : '-';

                                return (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-5 text-sm font-bold text-slate-800 capitalize flex items-center gap-3">
                                            <div className="w-2 h-2 bg-teal-400 rounded-full" /> {idxName}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold font-mono text-slate-600">{docCount}</td>
                                        <td className="px-6 py-5 text-xs text-slate-500">{lastTs}</td>
                                        <td className="px-6 py-5 flex justify-end gap-2">
                                            <button
                                                disabled={actionState[`reindex_${idxName}`]}
                                                onClick={() => handleReindexSpecific(idxName)}
                                                className="px-3 py-1.5 flex items-center gap-2 bg-slate-100 disabled:opacity-50 text-slate-500 hover:text-slate-800 hover:bg-slate-200 text-xs font-bold rounded-lg transition-colors"
                                            >
                                                {actionState[`reindex_${idxName}`] ? <Loader2 size={12} className="animate-spin" /> : <RotateCw size={12} />} Re-map
                                            </button>
                                            <button
                                                disabled={actionState[`flush_${idxName}`]}
                                                onClick={() => handleFlush(idxName)}
                                                className="px-3 py-1.5 flex items-center gap-2 bg-rose-50 disabled:opacity-50 text-rose-500 hover:bg-rose-100 text-xs font-bold rounded-lg transition-colors"
                                            >
                                                {actionState[`flush_${idxName}`] ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Drop
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {indexes.length === 0 && !loading && <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No active Search schemas registered.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SearchManagement;
