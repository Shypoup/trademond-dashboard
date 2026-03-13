import React from 'react';
import {
    Plus,
    TagIcon,
    Edit3,
    Trash2,
    X,
    Loader2
} from 'lucide-react';
import { tagService } from '../services/tagService';
import { Tag } from '../types/api';
import { displayBilingual } from '../utils/ui';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Tags = () => {
    const [loading, setLoading] = React.useState(true);
    const [tagList, setTagList] = React.useState<Tag[]>([]);
    const [totalTags, setTotalTags] = React.useState(0);

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | number | null>(null);
    const [formSaving, setFormSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: { en: '', ar: '' }
    });
    const [deleteTagId, setDeleteTagId] = React.useState<string | number | null>(null);

    const fetchTags = async () => {
        setLoading(true);
        try {
            const response = await tagService.getTags();
            if (response.data) {
                setTagList(response.data);
                setTotalTags(response.meta?.total || response.data.length);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchTags();
    }, []);

    const handleOpenModal = (tag?: Tag) => {
        if (tag) {
            setEditingId(tag.id);
            setFormData({
                name: typeof tag.name === 'string' ? { en: tag.name, ar: '' } : (tag.name || { en: '', ar: '' })
            });
        } else {
            setEditingId(null);
            setFormData({
                name: { en: '', ar: '' }
            });
        }
        setIsModalOpen(true);
    };

    /**
     * Confirms tag deletion from the server and updates local state.
     */
    const handleConfirmDeleteTag = async () => {
        if (!deleteTagId) return;
        const id = deleteTagId;
        try {
            await tagService.deleteTag(String(id));
            setTagList(prev => prev.filter(t => t.id !== id));
            setTotalTags(prev => Math.max(0, prev - 1));
            toast.success('Tag deleted');
        } catch (error) {
            console.error('Delete failed', error);
            toast.error('Failed to delete tag');
        } finally {
            setDeleteTagId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            if (editingId) {
                await tagService.updateTag(String(editingId), formData);
            } else {
                await tagService.createTag(formData);
            }
            await fetchTags();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save failed', error);
            toast.error('Failed to save tag', {
                description: 'Please review the tag fields and try again.',
            });
        } finally {
            setFormSaving(false);
        }
    };

    const updateBilingual = (field: string, lang: 'en' | 'ar', val: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: { ...(prev[field] || {}), [lang]: val }
        }));
    };

    if (loading && tagList.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold animate-pulse text-sm">Indexing Platform Taxonomy...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Tags & Taxonomy</h2>
                    <p className="text-slate-500 text-sm mt-1">{totalTags} total tags used across products and services</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-lg"
                >
                    <Plus size={18} />
                    <span>Create Tag</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className="premium-card p-4 flex items-center gap-4 relative group transition-all bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-xl shadow-teal-500/20">
                    <div className="p-3 bg-white/20 rounded-xl">
                        <TagIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm uppercase tracking-tight">Active Tags</h4>
                        <p className="text-[10px] text-teal-100 font-bold uppercase tracking-wider">{totalTags} System Tags</p>
                    </div>
                </div>

                {tagList.map((tag) => (
                    <div key={tag.id} className="premium-card p-4 flex items-center justify-between hover:border-teal-200 hover:shadow-lg transition-all bg-white group border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">{displayBilingual(tag.name)}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: {tag.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(tag)} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100">
                                <Edit3 size={14} />
                            </button>
                            <button onClick={() => setDeleteTagId(tag.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {tagList.length === 0 && (
                <div className="premium-card p-12 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <TagIcon size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No Tags Found</h3>
                    <p className="text-slate-400 text-sm max-w-xs mt-2">The platform taxonomy is currently empty. Start by creating a new descriptive tag.</p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold font-outfit text-slate-900">{editingId ? 'Edit Tag' : 'Create Tag'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="p-6 space-y-6 flex-1">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">English Name</label>
                                    <input required className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none" value={formData.name.en} onChange={e => updateBilingual('name', 'en', e.target.value)} placeholder="Summer Sale" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right block pr-2">الإسم بالعربية</label>
                                    <input required dir="rtl" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold focus:bg-white focus:border-teal-500 transition-all outline-none text-right" value={formData.name.ar} onChange={e => updateBilingual('name', 'ar', e.target.value)} placeholder="تخفيضات الصيف" />
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" disabled={formSaving} className="px-8 py-2.5 bg-teal-600 rounded-xl text-sm font-black text-white hover:bg-teal-700 transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20">
                                    {formSaving && <Loader2 className="animate-spin" size={16} />} Save Tag
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Dialog open={deleteTagId !== null} onOpenChange={(open) => !open && setDeleteTagId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete tag?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-500 mt-2">
                        This action cannot be undone. The tag will be removed from the system taxonomy.
                    </p>
                    <DialogFooter className="mt-4">
                        <button
                            type="button"
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all"
                            onClick={() => setDeleteTagId(null)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-8 py-2.5 bg-rose-600 rounded-xl text-sm font-black text-white hover:bg-rose-700 transition-all"
                            onClick={handleConfirmDeleteTag}
                        >
                            Delete
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Tags;
