import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Bell,
  Settings,
  Loader2,
  LogOut,
  User,
  Palette,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
} from 'lucide-react';
import { authService } from '@services/authService';
import { useTheme, type ThemePreference } from '@contexts/ThemeContext';
import { useAuthProfile, AUTH_PROFILE_QUERY_KEY } from '@hooks/useAuthProfile';
import { cn } from '@utils/core/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Top bar: global search, environment badge, notifications, theme, settings, and user menu.
 */
const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { preference, setPreference } = useTheme();
  const { data: profile, isLoading: profileLoading, isError: profileError } = useAuthProfile();

  const displayName = profile?.name?.trim() || t('header.userFallbackName');
  const displayRole = profile?.role?.trim() || t('header.userFallbackRole');
  const avatarSrc =
    profile?.avatar && typeof profile.avatar === 'string' && profile.avatar.length > 0
      ? profile.avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=008080&color=fff`;

  const handleLogout = async () => {
    await authService.logout();
    queryClient.removeQueries({ queryKey: AUTH_PROFILE_QUERY_KEY });
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-20 items-center justify-between border-b px-6 backdrop-blur-md md:px-8',
        'border-border bg-background/80 supports-[backdrop-filter]:bg-background/70',
      )}
    >
      <div className="max-w-2xl flex-1 px-2 md:px-4">
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 start-4 flex items-center">
            <Search className="text-muted-foreground transition-colors group-focus-within:text-primary" size={20} />
          </div>
          <input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            className={cn(
              'h-11 w-full rounded-xl border border-transparent bg-muted/50 ps-12 pe-16 text-sm outline-none transition-all duration-300',
              'focus:border-border focus:bg-card focus:ring-4 focus:ring-ring/20',
            )}
            readOnly
            aria-label={t('header.searchPlaceholder')}
          />
          <div className="pointer-events-none absolute inset-y-0 end-4 flex items-center">
            <span className="rounded border border-border/80 bg-muted/80 px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              CMD+K
            </span>
          </div>
        </div>
      </div>

      <div className="ms-auto flex items-center gap-3 md:gap-5">
        <div className="hidden items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 sm:flex">
          <div className="size-1.5 animate-pulse rounded-full bg-primary" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-primary">{t('header.productionEnv')}</span>
        </div>

        <button
          type="button"
          className="relative flex size-11 items-center justify-center rounded-full transition-colors hover:bg-accent"
          aria-label={t('header.notifications')}
        >
          <Bell className="text-muted-foreground" size={20} />
          <span className="absolute top-2.5 end-2.5 size-2 rounded-full border-2 border-background bg-destructive" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex size-11 items-center justify-center rounded-full transition-colors outline-none',
              'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
            )}
            aria-label={t('header.themeMenu')}
          >
            <Palette className="text-muted-foreground" size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t('header.appearance')}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={preference}
                onValueChange={(v) => setPreference(v as ThemePreference)}
              >
                <DropdownMenuRadioItem value="light" className="gap-2">
                  <Sun size={16} />
                  {t('header.themeLight')}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark" className="gap-2">
                  <Moon size={16} />
                  {t('header.themeDark')}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system" className="gap-2">
                  <Monitor size={16} />
                  {t('header.themeSystem')}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          to="/settings"
          className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-accent"
          aria-label={t('sidebar.settings')}
        >
          <Settings className="text-muted-foreground" size={20} />
        </Link>

        <div className="hidden h-8 w-px bg-border md:block" aria-hidden />

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex max-w-[220px] items-center gap-2 rounded-full border border-border bg-muted/50 py-1.5 ps-1.5 pe-3 transition-colors',
              'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring md:gap-3 md:pe-4',
            )}
          >
            <div className="size-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted shadow-sm">
              {profileLoading ? (
                <div className="flex size-full items-center justify-center bg-muted">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <img src={avatarSrc} alt="" className="size-full object-cover" />
              )}
            </div>
            <div className="min-w-0 text-start">
              <p className="truncate text-[13px] font-bold leading-tight text-foreground">{displayName}</p>
              <p className="truncate text-[11px] font-medium text-muted-foreground">
                {profileError ? t('header.profileUnavailable') : displayRole}
              </p>
            </div>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  {profile?.email ? (
                    <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                  ) : null}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2">
                <User size={16} />
                {t('sidebar.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => void handleLogout()} className="gap-2">
                <LogOut size={16} />
                {t('auth.logout')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
