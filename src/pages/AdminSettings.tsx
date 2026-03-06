import React from 'react';
import { systemService } from '../services/systemService';
import { ToggleRight, CheckCircle2, ShieldAlert } from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [toggling, setToggling] = React.useState(false);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const data = await systemService.getSponsorshipsSettings();
            setSettings(data);
        } catch (error) {
            console.error('Settings inaccessible');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchConfig();
    }, []);

    const handleToggleSponsorships = async () => {
        setToggling(true);
        try {
            await systemService.toggleSponsorships();
            await fetchConfig();
        } catch (error) {
            alert('Settings persist fault.');
        } finally {
            setToggling(false);
        }
    };

    if (loading) return <div className="p-8">Syncing global parameters...</div>;

    const sponsorActive = settings?.sponsorships_enabled || false;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-outfit">Platform Meta Settings</h2>
                    <p className="text-slate-500 text-sm mt-1">Control Global Modules & Configurations</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="premium-card p-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-slate-800">Sponsorship Subsystem</h3>
                                {sponsorActive ? (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase"><CheckCircle2 size={12} /> Live</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase"><ShieldAlert size={12} /> Halted</span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 mt-2">Activate or halt the sponsorship and keyword advertising network across search APIs globally.</p>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sponsorActive ? 'Running Service' : 'Disabled'}</span>
                        <button
                            disabled={toggling}
                            onClick={handleToggleSponsorships}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${sponsorActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        >
                            <ToggleRight size={18} className={toggling ? 'animate-pulse' : ''} />
                            {sponsorActive ? 'Halt System' : 'Spin Up'}
                        </button>
                    </div>
                </div>

                <div className="premium-card p-8 opacity-50 grayscale select-none">
                    <h3 className="text-lg font-bold text-slate-800">Mail Distribution Daemon</h3>
                    <p className="text-sm text-slate-500 mt-2">Manage AWS SES endpoints.</p>
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end">
                        <span className="text-xs font-bold bg-slate-200 px-3 py-1 rounded text-slate-500 uppercase tracking-wider">Locked</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
