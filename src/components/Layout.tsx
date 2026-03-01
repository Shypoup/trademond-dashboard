import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-slate-50 font-inter">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
                <footer className="p-8 border-top border-slate-100/50 flex flex-wrap items-center justify-between text-xs font-semibold text-slate-400 gap-4 mt-auto">
                    <div>
                        &copy; 2026 Trademond Admin. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-teal-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-teal-600 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-teal-600 transition-colors">Help Center</a>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Layout;
