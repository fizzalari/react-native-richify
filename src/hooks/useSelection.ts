import { useState, useCallback, useRef } from 'react';
import type { SelectionRange } from '../types';

/**
 * Hook for tracking TextInput selection state.
 *
 * Returns the current selection and a handler to update it.
 */
export function useSelection(initialSelection?: SelectionRange) {
  const [selection, setSelection] = useState<SelectionRange>(
    initialSelection ?? { start: 0, end: 0 },
  );

  // Use a ref to avoid stale closures in callbacks
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  const handleSelectionChange = useCallback(
    (newSelection: SelectionRange) => {
      setSelection(newSelection);
    },
    [],
  );

  const getSelection = useCallback((): SelectionRange => {
    return selectionRef.current;
  }, []);

  const hasSelection = useCallback((): boolean => {
    return selectionRef.current.start !== selectionRef.current.end;
  }, []);

  return {
    selection,
    setSelection,
    handleSelectionChange,
    getSelection,
    hasSelection,
  };
}
