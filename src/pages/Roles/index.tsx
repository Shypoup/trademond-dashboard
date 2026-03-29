import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Pencil, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { rolesService } from '@services/rolesService';
import { showApiErrorToast } from '@pages/utils/showApiErrorToast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@utils/core/cn';
import { groupPermissionsFromApi, permissionsFromRolePayload } from './utils/groupPermissions';

interface RoleRow {
  id: number | string;
  name: string;
  guard_name?: string;
  users_count?: number;
}

/**
 * Extracts role rows from list API responses.
 */
function extractRoles(body: unknown): RoleRow[] {
  const data = body && typeof body === 'object' ? (body as { data?: unknown }).data : null;
  if (!Array.isArray(data)) return [];
  const out: RoleRow[] = [];
  for (const r of data) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    const id = o.id;
    const name = o.name;
    if ((typeof id !== 'number' && typeof id !== 'string') || typeof name !== 'string') continue;
    const users_count = typeof o.users_count === 'number' ? o.users_count : undefined;
    const guard_name = typeof o.guard_name === 'string' ? o.guard_name : undefined;
    out.push({ id, name, guard_name, users_count });
  }
  return out;
}

/**
 * Admin roles: list roles and sync Spatie permissions per role.
 */
const Roles = () => {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = React.useState<RoleRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editRole, setEditRole] = React.useState<RoleRow | null>(null);
  const [groups, setGroups] = React.useState<{ group: string; items: string[] }[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const loadList = React.useCallback(async () => {
    setLoading(true);
    try {
      const body = await rolesService.listRoles();
      setRows(extractRoles(body));
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setLoading(false);
    }
  }, [t, i18n.language]);

  React.useEffect(() => {
    void loadList();
  }, [loadList]);

  const openEdit = async (row: RoleRow) => {
    setEditRole(row);
    setSheetOpen(true);
    setSaving(true);
    try {
      const [permBody, roleBody] = await Promise.all([
        rolesService.listPermissions(),
        rolesService.getRole(row.id),
      ]);
      setGroups(groupPermissionsFromApi(permBody));
      setSelected(new Set(permissionsFromRolePayload(roleBody)));
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
      setGroups([]);
      setSelected(new Set());
    } finally {
      setSaving(false);
    }
  };

  const togglePerm = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const savePermissions = async () => {
    if (!editRole) return;
    setSaving(true);
    try {
      await rolesService.syncRolePermissions(editRole.id, Array.from(selected));
      toast.success(t('rolesPage.permissionsSaved'));
      setSheetOpen(false);
      await loadList();
    } catch (e) {
      showApiErrorToast(e, t, i18n.language);
    } finally {
      setSaving(false);
    }
  };

  if (loading && rows.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={20} />
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-outfit">{t('sidebar.roles')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('rolesPage.subtitle')}</p>
      </div>

      <div className="premium-card overflow-hidden">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('rolesPage.colRole')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('rolesPage.colGuard')}</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{t('rolesPage.colUsers')}</th>
              <th className="px-6 py-4 text-end text-[11px] font-bold uppercase text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={String(row.id)} className="hover:bg-muted/50">
                <td className="px-6 py-4 text-sm font-semibold text-foreground">{row.name}</td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{row.guard_name ?? '—'}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{row.users_count ?? '—'}</td>
                <td className="px-6 py-4 text-end">
                  <button
                    type="button"
                    onClick={() => void openEdit(row)}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-teal-700 hover:bg-teal-50"
                  >
                    <Pencil size={16} />
                    {t('rolesPage.editPermissions')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !loading && <p className="px-6 py-12 text-center text-sm text-muted-foreground">{t('common.noData')}</p>}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex w-full max-w-2xl flex-col overflow-hidden border-border sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Shield size={20} />
              {editRole ? t('rolesPage.sheetTitle', { name: editRole.name }) : t('rolesPage.sheetTitleGeneric')}
            </SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pe-1">
            {saving && groups.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="animate-spin" size={18} />
                {t('common.loading')}
              </div>
            )}
            {groups.map((g) => (
              <div key={g.group} className="rounded-xl border border-border bg-muted/40 p-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{g.group}</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {g.items.map((perm) => (
                    <label
                      key={perm}
                      className={cn(
                        'flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-xs',
                        selected.has(perm) ? 'border-primary/40 bg-card' : 'border-transparent bg-muted/50',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(perm)}
                        onChange={() => togglePerm(perm)}
                        className="mt-0.5 rounded border-border"
                      />
                      <span className="font-mono text-[11px] leading-snug text-foreground">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              disabled={saving || !editRole}
              onClick={() => void savePermissions()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {saving && <Loader2 className="animate-spin" size={16} />}
              {t('rolesPage.savePermissions')}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Roles;
