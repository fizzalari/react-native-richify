import type { SelectionRange } from '../types';
/**
 * Hook for tracking TextInput selection state.
 *
 * Returns the current selection and a handler to update it.
 */
export declare function useSelection(initialSelection?: SelectionRange): {
    selection: SelectionRange;
    setSelection: import("react").Dispatch<import("react").SetStateAction<SelectionRange>>;
    handleSelectionChange: (newSelection: SelectionRange) => void;
    getSelection: () => SelectionRange;
    hasSelection: () => boolean;
};
