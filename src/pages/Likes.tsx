import React from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { systemService } from '../services/systemService';
import { Like } from '../types/api';
import { formatDate } from '../utils/ui';

const Likes = () => {
    const [loading, setLoading] = React.useState(true);
    const [likes, setLikes] = React.useState<Like[]>([]);

    const fetchLikes = async () => {
        setLoading(true);
        try {
            const response = await systemService.getLikes();
            if (response.data) setLikes(response.data);
        } catch (error) {
            console.error('Error fetching Likes:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchLikes();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this like record?')) return;
        try {
            await systemService.deleteLike(id);
            fetchLikes();
        } catch (error) {
            console.error('Delete error', error);
        }
    };

    if (loading && likes.length === 0) return <div className="p-8">Loading engagement graph...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <h2 className="text-2xl font-bold text-slate-900 font-outfit">Interaction Signals (Likes)</h2>

            <div className="premium-card overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">User Initiator UI-ID</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Entity Class Target</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Asset Target ID</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Interaction Date</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Revocation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {likes.map((rel) => (
                            <tr key={rel.id} className="hover:bg-rose-50/30 transition-colors">
                                <td className="px-6 py-5 text-xs font-bold font-mono text-slate-700">{rel.user_id}</td>
                                <td className="px-6 py-5">
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">{rel.likeable_type}</span>
                                </td>
                                <td className="px-6 py-5 text-xs font-bold font-mono text-slate-500">{rel.likeable_id}</td>
                                <td className="px-6 py-5 text-xs text-slate-500">{formatDate(rel.created_at)}</td>
                                <td className="px-6 py-5 pr-4 text-right flex justify-end">
                                    <button onClick={() => handleDelete(rel.id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                        {likes.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No active signal markers.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Likes;
