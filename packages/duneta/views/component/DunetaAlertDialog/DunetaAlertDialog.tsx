import { AlertDialog } from '@heroui/react';
import { useState } from 'react';
import { DunetaButton } from '../DunetaButton';
import type { DunetaAlertDialogProps } from './types';

export function DunetaAlertDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  status = 'default',
  icon,
  confirmLabel = 'Confirm',
  cancelLabel,
  onConfirm,
  onCancel,
  isDismissable = false,
  isKeyboardDismissDisabled = true,
  size = 'sm',
  confirmVariant = 'primary',
  hideFooter = false,
  className = '',
}: DunetaAlertDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasCancel = Boolean(cancelLabel || onCancel);
  const execute = async (action?: () => void | Promise<void>) => {
    setIsSubmitting(true);
    try {
      await action?.();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AlertDialog>
      <AlertDialog.Backdrop
        isOpen={isOpen}
        variant="opaque"
        isDismissable={isDismissable}
        isKeyboardDismissDisabled={isKeyboardDismissDisabled}
        onOpenChange={onOpenChange}
      >
        <AlertDialog.Container placement="center" size={size}>
          <AlertDialog.Dialog
            aria-label={typeof title === 'string' ? title : 'Alert dialog'}
            className={`overflow-hidden rounded-2xl ${className}`}
          >
            <AlertDialog.Header className="flex items-start gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <AlertDialog.Icon status={status}>{icon}</AlertDialog.Icon>
              <div className="min-w-0 flex-1 space-y-1">
                <AlertDialog.Heading className="text-base font-semibold">
                  {title}
                </AlertDialog.Heading>
                {description ? (
                  <p className="text-sm leading-relaxed text-slate-500">
                    {description}
                  </p>
                ) : null}
              </div>
            </AlertDialog.Header>
            {children ? (
              <AlertDialog.Body className="px-5 py-4 text-sm leading-relaxed">
                {children}
              </AlertDialog.Body>
            ) : null}
            {!hideFooter ? (
              <AlertDialog.Footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                {hasCancel ? (
                  <DunetaButton
                    variant="ghost"
                    isDisabled={isSubmitting}
                    onPress={() => void execute(onCancel)}
                  >
                    {cancelLabel ?? 'Cancel'}
                  </DunetaButton>
                ) : null}
                <DunetaButton
                  variant={confirmVariant}
                  isDisabled={isSubmitting}
                  onPress={() => void execute(onConfirm)}
                >
                  {isSubmitting ? 'Processing…' : confirmLabel}
                </DunetaButton>
              </AlertDialog.Footer>
            ) : null}
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
