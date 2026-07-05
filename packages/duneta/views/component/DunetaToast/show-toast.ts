import { toast } from '@heroui/react';

export type DunetaToastOptions = {
  description?: string;
  timeout?: number;
};

function showToast(
  message: string,
  variant: 'default' | 'success' | 'warning' | 'danger',
  options: DunetaToastOptions = {},
) {
  return toast(message, {
    description: options.description,
    timeout: options.timeout,
    variant,
  });
}

export const showDunetaToast = {
  default: (message: string, options?: DunetaToastOptions) => showToast(message, 'default', options),
  success: (message: string, options?: DunetaToastOptions) => showToast(message, 'success', options),
  warning: (message: string, options?: DunetaToastOptions) => showToast(message, 'warning', options),
  error: (message: string, options?: DunetaToastOptions) => showToast(message, 'danger', options),
};
