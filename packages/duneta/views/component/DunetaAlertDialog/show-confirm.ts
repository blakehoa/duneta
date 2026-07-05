import { mountDunetaAlert } from './mount';
import type { DunetaConfirmOptions, DunetaConfirmResult } from './types';

export function showDunetaConfirm(options: DunetaConfirmOptions): Promise<DunetaConfirmResult> {
  return new Promise((resolve) => {
    let isOk = false;

    const controller = mountDunetaAlert({
      ...options,
      status: options.confirmVariant === 'danger' ? 'danger' : 'default',
      isOpen: true,
      onOpenChange: (isOpen) => {
        if (!isOpen) resolve({ isOk, close: controller.close });
      },
      onConfirm: async () => {
        await options.onConfirm?.();
        isOk = true;
      },
      onCancel: async () => {
        await options.onCancel?.();
      },
    });
  });
}
