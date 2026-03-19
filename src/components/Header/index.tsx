import React from 'react';
import { Search, Bell, Settings, Globe, Command } from 'lucide-react';

const Header = () => {
    return (
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex-1 max-w-2xl px-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for products, companies, or users... (CMD+K)"
                        className="w-full h-11 pl-12 pr-4 bg-slate-100/50 border border-transparent focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-100 rounded-xl text-sm transition-all duration-300 outline-none"
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded border border-slate-300/50">CMD+K</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 ml-auto">
                <div className="flex items-center gap-1 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
                    <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wide">Production Env</span>
                </div>

                <button className="relative w-11 h-11 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <Bell className="text-slate-600" size={20} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                <button className="w-11 h-11 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <Settings className="text-slate-600" size={20} />
                </button>

                <div className="h-8 w-[1px] bg-slate-200"></div>

                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 pl-1.5 pr-4 py-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-full border border-white shadow-sm overflow-hidden bg-slate-400">
                        <img src="https://ui-avatars.com/api/?name=Alex+Rivera&background=008080&color=fff" alt="User" />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-slate-800 leading-none">Alex Rivera</p>
                        <p className="text-[11px] text-slate-500 font-medium">Super Admin</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
