import React from 'react';
import { Search, Star, Edit, Trash2, X, Loader2, MessageSquareOff } from 'lucide-react';
import { reviewService } from '@services/reviewService';
import { Review } from '@data-types/api';
import { getStatusStyles, formatDate } from '@utils/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const Reviews = () => {
    const [loading, setLoading] = React.useState(true);
    const [reviews, setReviews] = React.useState<Review[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        published: false,
        comment: '',
        owner_reply: ''
    });

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await reviewService.getReviews();
            if (response.data) setReviews(response.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchReviews();
    }, []);

    const handleOpenModal = (review: Review) => {
        setEditingId(review.id);
        setFormData({
            published: review.published !== false,
            comment: review.comment || '',
            owner_reply: review.owner_reply || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this user review?')) return;
        try {
            await reviewService.deleteReview(id);
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            if (editingId) {
                // Admin can modify review text (moderation) and visibility
                await reviewService.updateReview(editingId, formData);
            }
            await fetchReviews();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to update review moderation status');
        } finally {
            setFormSaving(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} className={s <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/25'} />
                ))}
            </div>
        );
    };

    if (loading && reviews.length === 0) {
        return <div className="p-8 font-bold text-muted-foreground">Loading reviews...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">Moderation: Reviews</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Monitor and moderate user feedback ({reviews.length} pending)</p>
                </div>
            </div>

            <div className="premium-card overflow-hidden">
                <div className="flex items-center border-b border-border bg-muted/40 p-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                        <input className="h-11 w-full rounded-xl border border-border bg-background ps-12 pe-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20" placeholder="Search review content..." />
                    </div>
                </div>

                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Review</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Target Entity</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Rating</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Date</th>
                            <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {reviews.map((r) => (
                            <tr key={r.id} className="group transition-colors hover:bg-muted/50">
                                <td className="px-6 py-5 max-w-xs">
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            <MessageSquareOff size={16} className="text-muted-foreground/60" />
                                        </div>
                                        <div>
                                            <p className="line-clamp-2 text-sm font-medium leading-relaxed text-foreground">{r.comment || 'No text content provided.'}</p>
                                            {r.owner_reply && <p className="mt-1.5 inline-block truncate rounded bg-primary/10 px-2 py-1 text-[10px] text-primary">Reply: {r.owner_reply}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-xs font-bold uppercase text-muted-foreground">{r.reviewable_type}</p>
                                    <p className="w-24 truncate font-mono text-[10px] text-muted-foreground" title={r.reviewable_id}>{r.reviewable_id}</p>
                                </td>
                                <td className="px-6 py-5">{renderStars(r.rating)}</td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(r.published ? 'published' : 'pending')}`}>
                                        {r.published ? 'Published' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-xs text-muted-foreground">{formatDate(r.created_at)}</td>
                                <td className="px-6 py-5 pe-4 text-end">
                                    <div className="flex items-center justify-end gap-1">
                                        <button type="button" onClick={() => handleOpenModal(r)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-primary">
                                            <Edit size={16} />
                                        </button>
                                        <button type="button" onClick={() => handleDelete(r.id)} className="rounded-lg border border-transparent p-2 text-muted-foreground transition-all hover:border-border hover:bg-destructive/10 hover:text-destructive">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {reviews.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No reviews requiring moderation.</td></tr>}
                    </tbody>
                </table>
            </div>

            <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                <SheetContent
                    side="right"
                    showCloseButton={false}
                    className="p-0 !max-w-xl w-full max-h-screen overflow-y-auto border-none shadow-2xl flex flex-col gap-0 sm:!max-w-xl"
                >
                    <div className="shrink-0 border-b border-border bg-muted/50 p-6">
                        <div className="flex items-center justify-between">
                            <SheetHeader className="!m-0 !p-0">
                                <SheetTitle className="font-outfit text-xl font-bold text-foreground">
                                    Moderate Content
                                </SheetTitle>
                            </SheetHeader>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="premium-scrollbar flex-1 space-y-6 overflow-y-auto p-8">
                                <div className="space-y-2">
                                    <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Review Content (Editable by Admin)</label>
                                    <textarea required className="min-h-[120px] w-full resize-none rounded-2xl border border-border bg-background p-4 text-sm font-medium leading-relaxed text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.comment} onChange={e => setFormData({ ...formData, comment: e.target.value })} />
                                </div>
                                <div className="pt-2">
                                    <label className="group flex cursor-pointer items-center gap-3">
                                        <div className="relative">
                                            <input type="checkbox" className="peer sr-only" checked={formData.published} onChange={e => setFormData({ ...formData, published: e.target.checked })} />
                                            <div className="peer h-6 w-12 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring/40" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground">Approve & Publish Review</span>
                                    </label>
                                    <p className="mt-1 block ps-14 text-xs text-muted-foreground">If unpublished, it remains hidden from public view until moderation is approved by staff.</p>
                                </div>
                        </div>
                        <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-muted/50 p-6">
                            <button type="button" className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" disabled={formSaving} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50">
                                {formSaving && <Loader2 className="animate-spin" size={16} />} Save Moderation Action
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Reviews;
