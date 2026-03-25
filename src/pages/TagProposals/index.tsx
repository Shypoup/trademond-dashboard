import React from 'react';
import { Check, X, Merge, MoreHorizontal, FileCheck, Loader2 } from 'lucide-react';
import { tagProposalService } from '@services/tagProposalService';
import { TagProposal } from '@data-types/api';
import { displayBilingual, formatDate, getStatusStyles } from '@utils/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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

    if (loading && proposals.length === 0) {
        return <div className="p-8 font-bold text-muted-foreground">Loading tag proposals...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">Tag Proposals</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Review community suggested tags</p>
                </div>
            </div>

            <div className="premium-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Tag Name / Proposed By</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Canonical ID</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Date</th>
                            <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {proposals.map((t) => (
                            <tr key={t.id} className="group transition-colors hover:bg-muted/50">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/50 dark:text-indigo-300"><FileCheck size={18} /></div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{displayBilingual(t.name)}</p>
                                            <p className="mt-0.5 max-w-[200px] truncate font-mono text-[10px] text-muted-foreground" title={t.proposed_by}>By: {t.proposed_by || 'Anonymous'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(t.status)} capitalize`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs text-muted-foreground font-mono truncate max-w-[150px] inline-block">{t.canonical_tag_id || 'N/A'}</span>
                                </td>
                                <td className="px-6 py-5 text-xs text-muted-foreground">{formatDate(t.created_at)}</td>
                                <td className="px-6 py-5 pr-4 text-right">
                                    {t.status === 'pending' ? (
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleAccept(t.id)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-emerald-600" title="Accept">
                                                <Check size={16} />
                                            </button>
                                            <button onClick={() => handleOpenMerge(t)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-indigo-600" title="Merge">
                                                <Merge size={16} />
                                            </button>
                                            <button onClick={() => handleReject(t.id)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-rose-600" title="Reject">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-slate-300 italic">Resolved</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {proposals.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No tag proposals found.</td></tr>}
                    </tbody>
                </table>
            </div>

            <Sheet open={isMergeOpen && !!selectedProposal} onOpenChange={(open) => { if (!open) setIsMergeOpen(false); }}>
                <SheetContent
                    side="right"
                    showCloseButton={false}
                    className="p-0 !max-w-lg w-full max-h-screen overflow-y-auto border-none shadow-2xl flex flex-col gap-0 sm:!max-w-lg"
                >
                    <div className="shrink-0 border-b border-border bg-muted/50 p-6">
                        <div className="flex items-center justify-between gap-4">
                            <SheetHeader className="!m-0 !min-w-0 !flex-1 !p-0">
                                <SheetTitle className="font-outfit text-xl font-bold text-foreground">
                                    Merge Proposal
                                </SheetTitle>
                                {selectedProposal && (
                                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                                        Map this proposal `{displayBilingual(selectedProposal.name)}` to an existing Tag ID.
                                    </p>
                                )}
                            </SheetHeader>
                            <button
                                type="button"
                                onClick={() => setIsMergeOpen(false)}
                                className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={submitMerge} className="flex flex-col flex-1 min-h-0">
                        <div className="p-8 space-y-6 flex-1 overflow-y-auto premium-scrollbar">
                                <div className="space-y-2">
                                    <label className="pl-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Canonical Tag ID</label>
                                    <input required className="h-12 w-full rounded-xl border border-border bg-background px-4 font-mono text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={canonicalTagId} onChange={e => setCanonicalTagId(e.target.value)} placeholder="01H..." />
                                </div>
                                {suggestions.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="pl-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Suggested Tags</label>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.map((s: any) => (
                                                <button type="button" key={s.id} onClick={() => setCanonicalTagId(s.id)} className="rounded-lg border border-transparent bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary">
                                                    {displayBilingual(s.name)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                        <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-muted/50 p-6">
                            <button type="button" className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsMergeOpen(false)}>Cancel</button>
                            <button type="submit" disabled={!canonicalTagId} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none">
                                Merge Content
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default TagProposals;
