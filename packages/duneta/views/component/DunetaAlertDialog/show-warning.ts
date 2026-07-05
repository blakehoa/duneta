import { mountDunetaAlert } from './mount';
import type { DunetaAlertDialogController, DunetaAlertWarningOptions } from './types';
export function showDunetaAlertWarning(options: DunetaAlertWarningOptions): DunetaAlertDialogController { return mountDunetaAlert({ ...options, status: 'warning', isOpen: true, onOpenChange: () => undefined }); }
