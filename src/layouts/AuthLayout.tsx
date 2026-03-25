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
        <footer className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-slate-100/50 p-8 text-xs font-semibold text-slate-400">
          <div>{t('footer.copyright')}</div>
          <p className="max-w-md text-end text-[11px] font-medium leading-relaxed text-slate-400">
            {t('footer.supportNote')}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AuthLayout;
