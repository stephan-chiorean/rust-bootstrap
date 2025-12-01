import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface SelectionContextType {
  selectedItems: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const isSelected = useCallback(
    (id: string): boolean => {
      return selectedItems.has(id);
    },
    [selectedItems]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectItem = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const deselectItem = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedItems(new Set(ids));
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        selectedItems,
        isSelected,
        toggleSelection,
        selectItem,
        deselectItem,
        selectMultiple,
        clearSelection,
        selectAll,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}

