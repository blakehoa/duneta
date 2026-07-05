
import { DunetaButton } from '../../../DunetaButton';

type DataTableToolbarPanelApplyFooterProps = {
  onApply: () => void;
};

export function DataTableToolbarPanelApplyFooter({
  onApply,
}: DataTableToolbarPanelApplyFooterProps) {
  return (
    <footer className="border-t border-border px-3 py-3">
      <DunetaButton
        className="w-full"
        size="sm"
        variant="primary"
        onPress={onApply}
      >
        Apply
      </DunetaButton>
    </footer>
  );
}
