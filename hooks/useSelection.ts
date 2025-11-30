import { useState } from 'react';

export const useSelection = (ids: string[]) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === ids.length ? [] : ids);
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = selectedIds.length === ids.length;

  return {
    selectedIds,
    toggleSelectAll,
    toggleSelectOne,
    isAllSelected
  };
};
