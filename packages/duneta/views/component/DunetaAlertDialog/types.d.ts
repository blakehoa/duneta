import type { AlertDialogIconProps } from '@heroui/react';
import type { ReactNode } from 'react';

export type DunetaAlertDialogStatus = NonNullable<AlertDialogIconProps['status']>;
export type DunetaAlertDialogProps = {
  isOpen: boolean; onOpenChange: (isOpen: boolean) => void; title: ReactNode; description?: ReactNode; children?: ReactNode;
  status?: DunetaAlertDialogStatus; icon?: ReactNode; confirmLabel?: string; cancelLabel?: string;
  onConfirm?: () => void | Promise<void>; onCancel?: () => void | Promise<void>;
  isDismissable?: boolean; isKeyboardDismissDisabled?: boolean; size?: 'sm' | 'md' | 'lg';
  confirmVariant?: 'primary' | 'danger'; hideFooter?: boolean; className?: string;
};
export type DunetaAlertDialogController = { close: () => void };
export type DunetaAlertOptions = Omit<DunetaAlertDialogProps, 'isOpen' | 'onOpenChange' | 'status'>;
export type DunetaAlertSuccessOptions = DunetaAlertOptions & { status?: never; confirmVariant?: 'primary' };
export type DunetaAlertWarningOptions = DunetaAlertOptions & { status?: never; confirmVariant?: 'primary' | 'danger' };
export type DunetaAlertErrorOptions = DunetaAlertOptions & { status?: never; confirmVariant?: 'primary' | 'danger' };
export type DunetaConfirmOptions = DunetaAlertOptions & { onCancel?: () => void | Promise<void>; confirmVariant?: 'primary' | 'danger' };
export type DunetaConfirmResult = DunetaAlertDialogController & { isOk: boolean };
export type DunetaLoadingOptions = { title?: ReactNode; message?: ReactNode; size?: 'sm' | 'md' | 'lg' };
