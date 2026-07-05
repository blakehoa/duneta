
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  ColumnDragStateProvider,
  type ColumnDragState,
} from './column-drag-context';

type DataTableColumnDnDProps = {
  enabled: boolean;
  columnIds: string[];
  lockedColumnIds?: readonly string[];
  columnOrder: string[];
  columnLabels: Record<string, string>;
  onColumnOrderChange: (order: string[]) => void;
  children: ReactNode;
};

export function DataTableColumnDnD({
  enabled,
  columnIds,
  lockedColumnIds = [],
  columnOrder,
  columnLabels,
  onColumnOrderChange,
  children,
}: DataTableColumnDnDProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const dragState = useMemo<ColumnDragState>(
    () => ({ activeId, overId, columnIds }),
    [activeId, overId, columnIds],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const resetDragState = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  const locked = useMemo(() => new Set(lockedColumnIds), [lockedColumnIds]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id);
      if (locked.has(id)) return;
      setActiveId(id);
    },
    [locked],
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over ? String(event.over.id) : null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      resetDragState();

      if (!over || active.id === over.id) return;

      const activeColumnId = String(active.id);
      const overColumnId = String(over.id);
      if (locked.has(activeColumnId) || locked.has(overColumnId)) return;

      const currentOrder = columnIds.length > 0 ? columnIds : columnOrder;
      const oldIndex = currentOrder.indexOf(activeColumnId);
      const newIndex = currentOrder.indexOf(overColumnId);
      if (oldIndex < 0 || newIndex < 0) return;

      onColumnOrderChange(arrayMove(currentOrder, oldIndex, newIndex));
    },
    [columnIds, columnOrder, locked, onColumnOrderChange, resetDragState],
  );

  if (!enabled) {
    return <>{children}</>;
  }

  const activeLabel = activeId ? columnLabels[activeId] : undefined;

  return (
    <ColumnDragStateProvider value={dragState}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={resetDragState}
      >
        <SortableContext
          items={columnIds}
          strategy={horizontalListSortingStrategy}
        >
          {children}
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {activeLabel ? (
            <div className="cursor-grabbing rounded-md border border-primary/60 bg-surface px-3 py-2 text-sm font-medium text-foreground shadow-lg ring-2 ring-primary/30">
              {activeLabel}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </ColumnDragStateProvider>
  );
}
