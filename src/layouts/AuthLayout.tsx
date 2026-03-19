import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useTranslation } from 'react-i18next';

/**
 * Authenticated layout shell: Sidebar + Header + Content + Footer.
 * Wraps all protected routes.
 */
const AuthLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-slate-50 font-inter">
      <Sidebar />
      <div className="flex-1 ms-64 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
        <footer className="p-8 border-t border-slate-100/50 flex flex-wrap items-center justify-between text-xs font-semibold text-slate-400 gap-4 mt-auto">
          <div>{t('footer.copyright')}</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-teal-600 transition-colors">{t('footer.privacyPolicy')}</a>
            <a href="#" className="hover:text-teal-600 transition-colors">{t('footer.termsOfService')}</a>
            <a href="#" className="hover:text-teal-600 transition-colors">{t('footer.helpCenter')}</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuthLayout;
