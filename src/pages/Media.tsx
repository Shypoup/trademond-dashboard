import React from 'react';
import { Image as ImageIcon, Trash2, HardDrive, Link as LinkIcon, Download } from 'lucide-react';
import { systemService } from '../services/systemService';
import { Media } from '../types/api';
import { formatDate } from '../utils/ui';

const MediaManagement = () => {
    const [loading, setLoading] = React.useState(true);
    const [medias, setMedias] = React.useState<Media[]>([]);

    const fetchMedias = async () => {
        setLoading(true);
        try {
            const response = await systemService.getMedia();
            if (response.data) setMedias(response.data);
        } catch (error) {
            console.error('Error fetching Media:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchMedias();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this file object permanently from storage?')) return;
        try {
            await systemService.deleteMedia(id);
            fetchMedias();
        } catch (error) {
            console.error('Delete error', error);
            alert('Cannot erase file resource currently');
        }
    };

    const formatBytes = (bytes?: number) => {
        if (!bytes) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading && medias.length === 0) return <div className="p-8">Loading storage vault...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <h2 className="text-2xl font-bold text-slate-900 font-outfit">Media Explorer</h2>
            <p className="text-slate-500 text-sm mt-1">S3 and Local Blob Asset Viewer</p>

            <div className="premium-card overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Asset Name</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Mime Type</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Size</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Collection / Model</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {medias.map((media) => (
                            <tr key={media.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        {media.mime_type?.startsWith('image/') ? (
                                            <div className="w-10 h-10 rounded overflow-hidden bg-slate-100 flex items-center justify-center">
                                                {media.url ? <img src={media.url} alt="asset" className="object-cover w-full h-full" /> : <ImageIcon size={16} className="text-slate-400" />}
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-400"><HardDrive size={16} /></div>
                                        )}
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 break-all max-w-[200px]">{media.file_name || media.name || 'Unknown'}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 max-w-[200px] truncate">{media.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{media.mime_type}</span>
                                </td>
                                <td className="px-6 py-5 text-xs font-bold text-slate-500">{formatBytes(media.size)}</td>
                                <td className="px-6 py-5">
                                    <div className="text-[10px] font-bold text-slate-700 capitalize">Disk: {media.disk || 'Default'}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">{media.model_type} : {media.collection_name}</div>
                                </td>
                                <td className="px-6 py-5 pr-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {media.url && (
                                            <a href={media.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-500 p-2 hover:bg-slate-100 rounded-lg transition-all" title="View Source">
                                                <LinkIcon size={16} />
                                            </a>
                                        )}
                                        <button onClick={() => handleDelete(media.id)} className="text-slate-400 hover:text-rose-500 p-2 hover:bg-slate-100 rounded-lg transition-all" title="Erase Permanently">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {medias.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No media storage assets indexed.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MediaManagement;
