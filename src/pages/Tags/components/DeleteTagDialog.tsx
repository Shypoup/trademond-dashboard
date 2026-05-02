import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AdminTag } from '@services/tagService';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getTagUsageTotal } from '../utils/tagFormHelpers';

export interface DeleteTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: AdminTag | null;
  deleting: boolean;
  onConfirm: () => void;
}

/**
 * Confirms deletion of a tag that is not attached to products or services (usage guard).
 */
export function DeleteTagDialog({
  open,
  onOpenChange,
  tag,
  deleting,
  onConfirm,
}: DeleteTagDialogProps) {
  const { t } = useTranslation();
  const usage = tag ? getTagUsageTotal(tag) : 0;
  const blocked = usage > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('tagsPage.deleteTitle')}</DialogTitle>
        </DialogHeader>
        {tag ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{t('tagsPage.deleteMessage')}</p>
            {blocked ? (
              <p className="font-medium text-foreground">
                {t('tagsPage.deleteBlocked', { count: usage })}
              </p>
            ) : null}
          </div>
        ) : null}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={blocked || deleting || !tag}
            onClick={() => onConfirm()}
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              t('common.delete')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
