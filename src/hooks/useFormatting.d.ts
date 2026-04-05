import type { StyledSegment, FormatType, FormatStyle, HeadingLevel, SelectionRange } from '../types';
interface UseFormattingOptions {
    segments: StyledSegment[];
    selection: SelectionRange;
    activeStyles: FormatStyle;
    onSegmentsChange: (segments: StyledSegment[]) => void;
    onActiveStylesChange: (styles: FormatStyle) => void;
}
/**
 * Hook that provides formatting commands for the rich text editor.
 *
 * Handles both selection-based formatting (when text is selected)
 * and active-style updates (when no text is selected — affects next typed text).
 */
export declare function useFormatting({ segments, selection, activeStyles, onSegmentsChange, onActiveStylesChange, }: UseFormattingOptions): {
    toggleFormat: (format: FormatType) => void;
    setStyleProperty: <K extends keyof FormatStyle>(key: K, value: FormatStyle[K]) => void;
    setHeading: (level: HeadingLevel) => void;
    setColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    setFontSize: (size: number) => void;
    isFormatActive: (format: FormatType) => boolean;
    currentSelectionStyle: () => FormatStyle;
};
export { };
