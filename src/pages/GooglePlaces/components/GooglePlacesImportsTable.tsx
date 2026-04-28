import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  importHistoryCreatedRaw,
  importHistoryDisplayName,
  importHistoryImportedByLabel,
  importHistoryPlaceId,
  importHistoryRowKey,
  importHistoryStatus,
  normalizeImportHistoryRow,
} from '@pages/GooglePlaces/utils/importHistoryRowHelpers';

export interface GooglePlacesImportsTableProps {
  /** Raw rows from the imports list API. */
  rows: unknown[];
}

/**
 * Renders Google Places import history as a table (supports multiple API row shapes).
 */
export function GooglePlacesImportsTable({ rows }: GooglePlacesImportsTableProps) {
  const { t, i18n } = useTranslation();

  /**
   * Formats ISO timestamps for the imported-at column.
   */
  const formatCreated = React.useCallback(
    (raw: string | null) => {
      if (!raw) return t('googlePlacesPage.cellEmpty');
      try {
        return new Date(raw).toLocaleString(i18n.language);
      } catch {
        return raw;
      }
    },
    [i18n.language, t],
  );

  /**
   * Resolves a display id for the first column.
   */
  const recordId = (row: Record<string, unknown>): string => {
    const v = row.id ?? row.ulid ?? row.import_ulid ?? row.importUlid;
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    return t('googlePlacesPage.cellEmpty');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[56rem] border-collapse text-start">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('googlePlacesPage.importHistoryColRecord')}
            </th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('googlePlacesPage.importHistoryColGooglePlace')}
            </th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('googlePlacesPage.importHistoryColCompany')}
            </th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('googlePlacesPage.importHistoryColImportedBy')}
            </th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('googlePlacesPage.importHistoryColStatus')}
            </th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {t('googlePlacesPage.importHistoryColImportedAt')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((raw, idx) => {
            const row = normalizeImportHistoryRow(raw);
            if (!row) return null;
            const keyBase = importHistoryRowKey(row);
            const key = `${keyBase || 'row'}-${idx}`;
            const pid = importHistoryPlaceId(row);
            const name = importHistoryDisplayName(row);
            const importedBy = importHistoryImportedByLabel(row);
            const status = importHistoryStatus(row);
            const createdRaw = importHistoryCreatedRaw(row);
            return (
              <tr key={key} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{recordId(row)}</td>
                <td className="max-w-[12rem] break-all px-4 py-3 font-mono text-xs text-muted-foreground">
                  {pid || t('googlePlacesPage.cellEmpty')}
                </td>
                <td className="max-w-[16rem] px-4 py-3 text-sm font-medium text-foreground">
                  {name || t('googlePlacesPage.cellEmpty')}
                </td>
                <td className="max-w-[14rem] px-4 py-3 text-sm text-muted-foreground">
                  {importedBy || t('googlePlacesPage.cellEmpty')}
                </td>
                <td className="px-4 py-3">
                  {status ? (
                    <Badge variant="secondary" className="rounded-md text-[10px] font-bold uppercase">
                      {status}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="rounded-md border border-dashed border-border bg-transparent text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
                    >
                      {t('googlePlacesPage.statusNotSet')}
                    </Badge>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                  {formatCreated(createdRaw)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
