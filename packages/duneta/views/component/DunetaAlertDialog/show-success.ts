import { mountDunetaAlert } from './mount';
import type { DunetaAlertDialogController, DunetaAlertSuccessOptions } from './types';
export function showDunetaAlertSuccess(options: DunetaAlertSuccessOptions): DunetaAlertDialogController { return mountDunetaAlert({ ...options, status: 'success', isOpen: true, onOpenChange: () => undefined }); }
