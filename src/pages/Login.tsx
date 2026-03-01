import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await authService.login({ email, password });
            if (data.status === 'success') {
                navigate('/');
            } else {
                setError((data as any).message || 'Authentication failed. Please check your credentials.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'A network error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-outfit">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-500/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <ShieldCheck size={36} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Trademond Admin</h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Enterprise Control Center Access</p>
                </div>

                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@trademond.com"
                                    className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-2xl text-white outline-none transition-all placeholder-slate-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-2xl text-white outline-none transition-all placeholder-slate-600"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                                <p className="text-xs font-bold text-rose-500">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Establish Connection</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 flex flex-col items-center gap-4">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] text-center max-w-[240px] leading-relaxed">
                            Authorized personnel only. All access attempts are monitored and recorded by Trademond Security.
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest">
                        Node v{import.meta.env.VITE_NODE_VERSION || '1.0.0'} &bull; Cluster: Global-TR-01
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
