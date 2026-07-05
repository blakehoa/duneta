import type { DataTableColumnResetHandlers } from '../../types/toolbar';

export type ColumnPanelResetHandlers = Pick<
  DataTableColumnResetHandlers,
  'resetAll' | 'resetWidths' | 'resetOrder' | 'resetVisibility'
>;

/** Runs a reset action, then closes the columns panel. */
export function wrapResetHandlersWithClose(
  handlers: DataTableColumnResetHandlers,
  onClose: () => void,
): ColumnPanelResetHandlers {
  return {
    resetAll: () => {
      handlers.resetAll();
      onClose();
    },
    resetWidths: () => {
      handlers.resetWidths();
      onClose();
    },
    resetOrder: () => {
      handlers.resetOrder();
      onClose();
    },
    resetVisibility: () => {
      handlers.resetVisibility();
      onClose();
    },
  };
}
