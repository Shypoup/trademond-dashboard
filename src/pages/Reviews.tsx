import React from 'react';
import { Search, MoreHorizontal, Star, Edit, Trash2, X, Loader2, MessageSquareOff } from 'lucide-react';
import { reviewService } from '../services/reviewService';
import { Review } from '../types/api';
import { getStatusStyles, formatDate } from '../utils/ui';

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
                    <Star key={s} size={12} className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                ))}
            </div>
        );
    };

    if (loading && reviews.length === 0) return <div className="p-8 font-bold text-slate-400">Loading reviews...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Moderation: Reviews</h2>
                    <p className="text-slate-500 text-sm mt-1">Monitor and moderate user feedback ({reviews.length} pending)</p>
                </div>
            </div>

            <div className="premium-card overflow-hidden bg-white">
                <div className="p-4 border-b border-slate-50 flex items-center bg-slate-50/30">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute inset-y-0 left-4 mt-3 flex items-center text-slate-400" size={18} />
                        <input className="w-full h-11 pl-12 pr-4 bg-white border border-slate-200 focus:border-amber-400 hover:border-amber-400/50 rounded-xl text-sm outline-none transition-all" placeholder="Search review content..." />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Review</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Target Entity</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Rating</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Date</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {reviews.map((r) => (
                            <tr key={r.id} className="hover:bg-amber-50/30 transition-colors group">
                                <td className="px-6 py-5 max-w-xs">
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            <MessageSquareOff size={16} className="text-amber-500/50" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-relaxed">{r.comment || 'No text content provided.'}</p>
                                            {r.owner_reply && <p className="text-[10px] text-teal-600 mt-1.5 truncate bg-teal-50 px-2 py-1 rounded inline-block">Reply: {r.owner_reply}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-xs font-bold text-slate-600 uppercase">{r.reviewable_type}</p>
                                    <p className="text-[10px] text-slate-400 font-mono truncate w-24" title={r.reviewable_id}>{r.reviewable_id}</p>
                                </td>
                                <td className="px-6 py-5">{renderStars(r.rating)}</td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(r.published ? 'published' : 'pending')}`}>
                                        {r.published ? 'Published' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-xs text-slate-500">{formatDate(r.created_at)}</td>
                                <td className="px-6 py-5 pr-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => handleOpenModal(r)} className="text-slate-400 hover:text-amber-600 p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-all">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {reviews.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No reviews requiring moderation.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Moderation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between bg-amber-50/50">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-amber-900">Moderate Content</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-700/50">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="p-8 space-y-6 flex-1">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Review Content (Editable by Admin)</label>
                                    <textarea required className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-amber-400 transition-all outline-none resize-none leading-relaxed" value={formData.comment} onChange={e => setFormData({ ...formData, comment: e.target.value })} />
                                </div>
                                <div className="pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only peer" checked={formData.published} onChange={e => setFormData({ ...formData, published: e.target.checked })} />
                                            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">Approve & Publish Review</span>
                                    </label>
                                    <p className="text-xs text-slate-400 ml-15 mt-1">If unpublished, it remains hidden from public view until moderation is approved by staff.</p>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-8 py-2.5 bg-amber-500 rounded-xl text-sm font-black text-white hover:bg-amber-600 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20">
                                    {formSaving && <Loader2 className="animate-spin" size={16} />} Save Moderation Action
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;
