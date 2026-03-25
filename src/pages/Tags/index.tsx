import React from 'react';
import {
    Plus,
    TagIcon,
    Edit3,
    Trash2,
    X,
    Loader2
} from 'lucide-react';
import { tagService } from '@services/tagService';
import { Tag } from '@data-types/api';
import { displayBilingual } from '@utils/ui';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
                    <p className="text-sm font-bold text-muted-foreground animate-pulse">Indexing Platform Taxonomy...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground font-outfit">Tags & Taxonomy</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{totalTags} total tags used across products and services</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
                >
                    <Plus size={18} />
                    <span>Create Tag</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className="premium-card p-4 flex items-center gap-4 relative group transition-all bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-xl shadow-teal-500/20">
                    <div className="rounded-xl bg-white/20 p-3">
                        <TagIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm uppercase tracking-tight">Active Tags</h4>
                        <p className="text-[10px] text-teal-100 font-bold uppercase tracking-wider">{totalTags} System Tags</p>
                    </div>
                </div>

                {tagList.map((tag) => (
                    <div key={tag.id} className="premium-card group flex items-center justify-between border-border p-4 transition-all hover:border-teal-500/40 hover:shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                            <div>
                                <h4 className="text-sm font-bold text-foreground">{displayBilingual(tag.name)}</h4>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ID: {tag.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(tag)} className="rounded-lg border border-transparent p-1.5 text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted hover:text-primary">
                                <Edit3 size={14} />
                            </button>
                            <button onClick={() => setDeleteTagId(tag.id)} className="rounded-lg border border-transparent p-1.5 text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {tagList.length === 0 && (
                <div className="premium-card flex flex-col items-center justify-center border border-dashed border-border p-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <TagIcon size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No Tags Found</h3>
                    <p className="mt-2 max-w-xs text-sm text-muted-foreground">The platform taxonomy is currently empty. Start by creating a new descriptive tag.</p>
                </div>
            )}

            <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
                <SheetContent
                    side="right"
                    showCloseButton={false}
                    className="p-0 !max-w-md w-full max-h-screen overflow-y-auto border-none shadow-2xl flex flex-col gap-0 sm:!max-w-md"
                >
                    <div className="shrink-0 border-b border-border bg-muted/50 p-6">
                        <div className="flex items-center justify-between">
                            <SheetHeader className="!p-0 !m-0">
                                <SheetTitle className="text-xl font-bold font-outfit text-foreground">
                                    {editingId ? 'Edit Tag' : 'Create Tag'}
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

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        <div className="p-6 space-y-6 flex-1 overflow-y-auto premium-scrollbar">
                            <div className="space-y-2">
                                <label className="ps-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">English Name</label>
                                <input required className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.name.en} onChange={e => updateBilingual('name', 'en', e.target.value)} placeholder="Summer Sale" />
                            </div>
                            <div className="space-y-2">
                                <label className="block pe-2 text-end text-[11px] font-black uppercase tracking-widest text-muted-foreground">الإسم بالعربية</label>
                                <input required dir="rtl" className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-right text-sm font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20" value={formData.name.ar} onChange={e => updateBilingual('name', 'ar', e.target.value)} placeholder="تخفيضات الصيف" />
                            </div>
                        </div>
                        <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-muted/50 p-6">
                            <button type="button" className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" disabled={formSaving} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50">
                                {formSaving && <Loader2 className="animate-spin" size={16} />} Save Tag
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Dialog open={deleteTagId !== null} onOpenChange={(open) => !open && setDeleteTagId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete tag?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground mt-2">
                        This action cannot be undone. The tag will be removed from the system taxonomy.
                    </p>
                    <DialogFooter className="mt-4">
                        <button
                            type="button"
                            className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-muted"
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
