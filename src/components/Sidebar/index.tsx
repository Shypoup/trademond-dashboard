import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Settings, ShieldCheck } from 'lucide-react';

import { cn } from '@utils/core/cn';
import { BRAND_PRIMARY_HEX_PARAM, COLORS } from '@utils/core/colors';
import { authService } from '@services/authService';
import { SIDEBAR_NAV_SECTIONS } from '@/components/Sidebar/utils/navSections';

/**
 * Primary navigation for the authenticated admin shell. Items and section titles
 * come from {@link SIDEBAR_NAV_SECTIONS} and `sidebar.*` / `sidebar.section.*` i18n keys.
 * Uses `sidebar` CSS variables so light/dark theme matches the rest of the shell.
 */
const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState<{
    name: string;
    email: string;
    avatar: string | null;
  } | null>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authService.getProfile();
        setUser({
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
        });
      } catch {
        setUser(null);
      }
    };
    void fetchProfile();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const avatarUrl =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=${BRAND_PRIMARY_HEX_PARAM}&color=fff`;

  return (
    <aside
      className={cn(
        'fixed top-0 z-50 flex h-screen w-64 flex-col border-e',
        'border-sidebar-border bg-sidebar text-sidebar-foreground',
      )}
      dir={i18n.dir()}
    >
      <div className="flex shrink-0 items-center gap-3 p-6">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: COLORS.brandCyan }}
        >
          <ShieldCheck className="text-white" size={22} aria-hidden />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-bold leading-tight tracking-tight text-sidebar-foreground">Trademond</h1>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t('sidebar.brandSubtitle')}
          </span>
        </div>
      </div>

      <nav
        className={cn(
          'min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-2 [scrollbar-width:thin]',
          '[scrollbar-color:var(--color-sidebar-border)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.12)_transparent]',
        )}
        aria-label={t('sidebar.dashboard')}
      >
        {SIDEBAR_NAV_SECTIONS.map((section) => (
          <div key={section.sectionKey} className="pb-2">
            <div className="mb-2 px-2 pt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground first:pt-0">
              {t(`sidebar.section.${section.sectionKey}`)}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                          isActive
                            ? 'border border-transparent bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                            : 'border border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )
                      }
                    >
                      <Icon size={18} className="shrink-0 opacity-90" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{t(`sidebar.${item.labelKey}`)}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )
          }
        >
          <Settings size={18} aria-hidden />
          <span>{t('sidebar.settings')}</span>
        </NavLink>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={18} aria-hidden />
          <span>{t('sidebar.logout')}</span>
        </button>
      </div>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          cn(
            'mx-3 mb-4 mt-1 flex items-center gap-3 rounded-2xl border p-3 transition-colors',
            isActive
              ? 'border-primary/30 bg-primary/15'
              : 'border-sidebar-border bg-muted/40 hover:bg-sidebar-accent',
          )
        }
      >
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-sidebar-border dark:border-white/10">
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-sidebar-foreground">{user?.name ?? '—'}</p>
          <p className="truncate text-[10px] text-muted-foreground">{user?.email ?? ''}</p>
        </div>
      </NavLink>
    </aside>
  );
};

export default Sidebar;
