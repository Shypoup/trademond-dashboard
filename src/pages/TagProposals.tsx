import React from 'react';
import { Check, X, Merge, MoreHorizontal, FileCheck, Loader2 } from 'lucide-react';
import { tagProposalService } from '../services/tagProposalService';
import { TagProposal } from '../types/api';
import { displayBilingual, formatDate, getStatusStyles } from '../utils/ui';

const TagProposals = () => {
    const [loading, setLoading] = React.useState(true);
    const [proposals, setProposals] = React.useState<TagProposal[]>([]);

    // Modal state for Merge
    const [isMergeOpen, setIsMergeOpen] = React.useState(false);
    const [selectedProposal, setSelectedProposal] = React.useState<TagProposal | null>(null);
    const [canonicalTagId, setCanonicalTagId] = React.useState('');
    const [suggestions, setSuggestions] = React.useState<any[]>([]);

    const fetchProposals = async () => {
        setLoading(true);
        try {
            const response = await tagProposalService.getProposals();
            if (response.data) setProposals(response.data);
        } catch (error) {
            console.error('Error fetching tag proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchProposals();
    }, []);

    const handleAccept = async (id: string) => {
        try {
            await tagProposalService.accept(id);
            fetchProposals();
        } catch (error) {
            console.error('Accept error', error);
            alert('Failed to accept tag proposal');
        }
    };

    const handleReject = async (id: string) => {
        if (!window.confirm('Reject this tag proposal permanently?')) return;
        try {
            await tagProposalService.reject(id);
            fetchProposals();
        } catch (error) {
            console.error('Reject error', error);
            alert('Failed to reject tag proposal');
        }
    };

    const handleOpenMerge = async (proposal: TagProposal) => {
        setSelectedProposal(proposal);
        setCanonicalTagId('');
        setIsMergeOpen(true);

        try {
            const sugs = await tagProposalService.getSuggestions(proposal.id);
            setSuggestions(sugs.data || []);
        } catch (err) {
            setSuggestions([]);
        }
    };

    const submitMerge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProposal || !canonicalTagId) return;
        try {
            await tagProposalService.merge(selectedProposal.id, canonicalTagId);
            setIsMergeOpen(false);
            fetchProposals();
        } catch (error) {
            console.error('Merge error', error);
            alert('Failed to merge tag proposal');
        }
    };

    if (loading && proposals.length === 0) return <div className="p-8">Loading tag proposals...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Tag Proposals</h2>
                    <p className="text-slate-500 text-sm mt-1">Review community suggested tags</p>
                </div>
            </div>

            <div className="premium-card overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Tag Name / Proposed By</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Canonical ID</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Date</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {proposals.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors"><FileCheck size={18} /></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{displayBilingual(t.name)}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 max-w-[200px] truncate" title={t.proposed_by}>By: {t.proposed_by || 'Anonymous'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(t.status)} capitalize`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs text-slate-500 font-mono truncate max-w-[150px] inline-block">{t.canonical_tag_id || 'N/A'}</span>
                                </td>
                                <td className="px-6 py-5 text-xs text-slate-500">{formatDate(t.created_at)}</td>
                                <td className="px-6 py-5 pr-4 text-right">
                                    {t.status === 'pending' ? (
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleAccept(t.id)} className="text-slate-400 hover:text-emerald-500 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Accept">
                                                <Check size={16} />
                                            </button>
                                            <button onClick={() => handleOpenMerge(t)} className="text-slate-400 hover:text-indigo-500 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Merge">
                                                <Merge size={16} />
                                            </button>
                                            <button onClick={() => handleReject(t.id)} className="text-slate-400 hover:text-rose-500 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Reject">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-slate-300 italic">Resolved</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {proposals.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No tag proposals found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Merge Modal */}
            {isMergeOpen && selectedProposal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMergeOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between bg-indigo-50/50">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-indigo-900">Merge Proposal</h3>
                                <p className="text-xs text-indigo-600 font-medium">Map this proposal `{displayBilingual(selectedProposal.name)}` to an existing Tag ID.</p>
                            </div>
                            <button onClick={() => setIsMergeOpen(false)} className="p-2 hover:bg-indigo-100 rounded-full transition-colors text-indigo-900/50">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={submitMerge} className="flex flex-col">
                            <div className="p-8 space-y-6 flex-1 max-h-[70vh] overflow-y-auto premium-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Canonical Tag ID</label>
                                    <input required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono focus:bg-white focus:border-indigo-400 transition-all outline-none" value={canonicalTagId} onChange={e => setCanonicalTagId(e.target.value)} placeholder="01H..." />
                                </div>
                                {suggestions.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Suggested Tags</label>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.map((s: any) => (
                                                <button type="button" key={s.id} onClick={() => setCanonicalTagId(s.id)} className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 text-xs font-medium rounded-lg transition-colors border border-transparent hover:border-indigo-200">
                                                    {displayBilingual(s.name)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all" onClick={() => setIsMergeOpen(false)}>Cancel</button>
                                <button type="submit" disabled={!canonicalTagId} className="px-8 py-2.5 bg-indigo-600 disabled:bg-slate-300 disabled:text-white/50 rounded-xl text-sm font-black text-white hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:shadow-none">
                                    Merge Content
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagProposals;
