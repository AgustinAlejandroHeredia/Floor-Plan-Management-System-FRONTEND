import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { RiDeleteBin6Line } from "react-icons/ri";
import { AlertDialogMedia } from "@/components/ui/alert-dialog"; // si ya lo usás

// TRANSLATION
import { useTranslation } from "react-i18next";

type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description: string;

  onConfirm: () => void;

  confirmText?: string;
  cancelText?: string;
};

const ConfirmDeleteDialog = ({
  open,
  onOpenChange,
  title = "Delete item",
  description = "This action cannot be undone.",
  onConfirm,
  confirmText = "",
  cancelText = "",
}: ConfirmDeleteDialogProps) => {

  const { t } = useTranslation([
      "common"
  ])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <RiDeleteBin6Line />
          </AlertDialogMedia>

          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText || t('common:cancel')}</AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
          >
            {confirmText || t('common:delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteDialog;