import React from 'react';
import {
    Search,
    Plus,
    Filter,
    ChevronDown,
    MoreHorizontal,
    TagIcon,
    Edit3,
    Trash2,
    CheckCircle2
} from 'lucide-react';
import { tagService } from '../services/tagService';
import { Tag } from '../types/api';

const Tags = () => {
    const [loading, setLoading] = React.useState(true);
    const [tagList, setTagList] = React.useState<Tag[]>([]);
    const [totalTags, setTotalTags] = React.useState(0);

    const displayBilingual = (val: any) => {
        if (!val) return 'N/A';
        if (typeof val === 'string') return val;
        return val.en || val.ar || 'N/A';
    };

    React.useEffect(() => {
        const fetchTags = async () => {
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
        fetchTags();
    }, []);

    if (loading) {
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
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Tags & Taxonomy</h2>
                    <p className="text-slate-500 text-sm mt-1">{totalTags} total tags used across products and services</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] rounded-xl text-sm font-bold text-white hover:bg-[#005f5f] transition-all shadow-lg">
                    <Plus size={18} />
                    <span>Create Tag</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className="premium-card p-4 flex items-center gap-4 relative group hover:border-teal-500/30 transition-all cursor-pointer bg-white">
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                        <TagIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Search Optimizer</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Quick search for all tags</p>
                    </div>
                </div>

                {tagList.map((tag) => (
                    <div key={tag.id} className="premium-card p-4 flex items-center justify-between hover:border-slate-200 transition-all bg-white group">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">{displayBilingual(tag.name)}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: {tag.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                                <Edit3 size={14} />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {tagList.length === 0 && (
                <div className="premium-card p-12 flex flex-col items-center justify-center text-center bg-white">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <TagIcon size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No Tags Found</h3>
                    <p className="text-slate-400 text-sm max-w-xs mt-2">The platform taxonomy is currently empty. Start by creating a new descriptive tag.</p>
                </div>
            )}
        </div>
    );
};

export default Tags;
