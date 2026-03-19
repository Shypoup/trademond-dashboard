import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

/**
 * Props for the DeleteProductDialog component.
 */
export interface DeleteProductDialogProps {
    /** Whether the dialog is open */
    isOpen: boolean;
    /** Callback to close the dialog */
    onClose: () => void;
    /** Callback to confirm deletion */
    onConfirm: () => void;
}

/**
 * Confirmation dialog for product deletion with cancel and confirm actions.
 */
export const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete product?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-500 mt-2">
                    This action cannot be undone. The product will be removed from the catalog.
                </p>
                <DialogFooter className="mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        className="font-semibold"
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
