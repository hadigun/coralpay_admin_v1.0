import { useState } from 'react';

export type ColumnKey = 'nameId' | 'role' | 'status' | 'date' | 'members';

export const useColumnVisibility = (
  initialState = {
    nameId: true,
    role: true,
    members: true,
    status: true,
    date: true
  }
) => {
  const [visibleColumns, setVisibleColumns] = useState(initialState);

  const toggleColumn = (column: ColumnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  return { visibleColumns, toggleColumn };
};
