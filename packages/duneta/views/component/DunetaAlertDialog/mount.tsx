import { createRoot } from 'react-dom/client';
import { DunetaAlertDialog } from './DunetaAlertDialog';
import type { DunetaAlertDialogController, DunetaAlertDialogProps } from './types';

export function mountDunetaAlert(props: DunetaAlertDialogProps): DunetaAlertDialogController {
  if (typeof document === 'undefined') throw new Error('Duneta alert dialogs can only run in a browser.');
  const node = document.createElement('div'); document.body.appendChild(node);
  const root = createRoot(node); let closed = false;
  const controller = { close: () => { if (closed) return; closed = true; root.unmount(); node.remove(); } };
  root.render(<DunetaAlertDialog {...props} onOpenChange={(isOpen) => { props.onOpenChange(isOpen); if (!isOpen) controller.close(); }} />);
  return controller;
}
