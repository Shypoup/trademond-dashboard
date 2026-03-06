import React from 'react';
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { systemService } from '../services/systemService';

const Imports = () => {
    const [loadingInd, setLoadingInd] = React.useState(false);
    const [loadingISIC, setLoadingISIC] = React.useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'industries' | 'isic') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        if (type === 'industries') setLoadingInd(true);
        else setLoadingISIC(true);

        try {
            if (type === 'industries') await systemService.importIndustries(formData);
            if (type === 'isic') await systemService.importISIC(formData);
            alert(`File parsed and dispatched to job queue for [${type}].`);
        } catch (error) {
            alert('Upload sequence failed.');
        } finally {
            if (type === 'industries') setLoadingInd(false);
            else setLoadingISIC(false);
            e.target.value = ''; // reset input
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Mass Import Gateways</h2>
                    <p className="text-slate-500 text-sm mt-1">Accepts standard .xlsx mapping templates</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Industries */}
                <div className="premium-card flex flex-col items-center justify-center p-12 text-center group border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors relative">
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        disabled={loadingInd}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-wait"
                        onChange={(e) => handleUpload(e, 'industries')}
                    />
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all ${loadingInd ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:scale-110'}`}>
                        {loadingInd ? <Loader2 size={32} className="animate-spin" /> : <FileSpreadsheet size={32} />}
                    </div>
                    <h3 className="text-xl font-bold font-outfit text-slate-800">Industries Classification</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-xs">Drop your .xlsx sheet containing standard TRD-IND hierarchical data mapping.</p>
                    <div className="mt-8 flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">
                        <UploadCloud size={16} /> Choose File
                    </div>
                </div>

                {/* ISIC */}
                <div className="premium-card flex flex-col items-center justify-center p-12 text-center group border-2 border-dashed border-slate-200 hover:border-teal-400 transition-colors relative">
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        disabled={loadingISIC}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-wait"
                        onChange={(e) => handleUpload(e, 'isic')}
                    />
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all ${loadingISIC ? 'bg-teal-100 text-teal-600 animate-pulse' : 'bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500 group-hover:scale-110'}`}>
                        {loadingISIC ? <Loader2 size={32} className="animate-spin" /> : <FileSpreadsheet size={32} />}
                    </div>
                    <h3 className="text-xl font-bold font-outfit text-slate-800">ISIC Global Database</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-xs">Drop your .xlsx sheet mapping Rev.4 ISIC coding standards directly into sectors.</p>
                    <div className="mt-8 flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 px-4 py-2 rounded-xl">
                        <UploadCloud size={16} /> Choose File
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Imports;
