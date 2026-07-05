import { mountDunetaAlert } from './mount';
import type { DunetaAlertDialogController, DunetaAlertErrorOptions } from './types';
export function showDunetaAlertError(options: DunetaAlertErrorOptions): DunetaAlertDialogController { return mountDunetaAlert({ ...options, status: 'danger', isOpen: true, onOpenChange: () => undefined }); }
