
import { createContext, useContext } from 'react';

export type ColumnDragState = {
  activeId: string | null;
  overId: string | null;
  columnIds: string[];
};

const ColumnDragStateContext = createContext<ColumnDragState>({
  activeId: null,
  overId: null,
  columnIds: [],
});

export function ColumnDragStateProvider({
  value,
  children,
}: {
  value: ColumnDragState;
  children: React.ReactNode;
}) {
  return (
    <ColumnDragStateContext.Provider value={value}>
      {children}
    </ColumnDragStateContext.Provider>
  );
}

export function useColumnDragState(): ColumnDragState {
  return useContext(ColumnDragStateContext);
}
