import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

/** Props for the {@link DeleteCompanyDialog} component. */
export interface DeleteCompanyDialogProps {
    /** Whether the dialog is visible. */
    isOpen: boolean;
    /** Callback to close the dialog. */
    onClose: () => void;
    /** Callback to confirm deletion. */
    onConfirm: () => void;
    /** Whether a delete request is currently in flight. */
    isDeleting?: boolean;
    /** Optional company name to show in the message. */
    companyName?: string;
}

/**
 * Confirmation dialog shown before permanently deleting a company.
 * Displays a warning icon, translated copy, and cancel / delete actions.
 */
export const DeleteCompanyDialog: React.FC<DeleteCompanyDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isDeleting = false,
    companyName,
}) => {
    const { t } = useTranslation();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:!max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-foreground">
                                {t('companies.deleteTitle')}
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {companyName
                        ? t('companies.deleteMessageNamed', { name: companyName })
                        : t('companies.deleteMessage')}
                </p>

                <DialogFooter className="mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="font-semibold"
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="font-semibold"
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.delete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
