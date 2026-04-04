import type { StyledSegment, FormatType, FormatStyle, HeadingLevel, SelectionRange } from '@/types';
/**
 * Toggle an inline format (bold, italic, etc.) on the selected range.
 *
 * If the entire selection already has the format, it is removed.
 * Otherwise, it is applied to the entire selection.
 *
 * Returns the new segments array.
 */
export declare function toggleFormatOnSelection(segments: StyledSegment[], selection: SelectionRange, format: FormatType): StyledSegment[];
/**
 * Set a specific style property on the selected range.
 */
export declare function setStyleOnSelection<K extends keyof FormatStyle>(segments: StyledSegment[], selection: SelectionRange, key: K, value: FormatStyle[K]): StyledSegment[];
/**
 * Apply a heading level to the line containing the cursor/selection.
 */
export declare function setHeadingOnLine(segments: StyledSegment[], selection: SelectionRange, level: HeadingLevel): StyledSegment[];
/**
 * Checks whether the given format is active across the entire selection.
 */
export declare function isFormatActiveInSelection(segments: StyledSegment[], selection: SelectionRange, format: FormatType): boolean;
/**
 * Gets the format style that is common across the entire selection.
 * For properties where segments disagree, the value is undefined.
 */
export declare function getSelectionStyle(segments: StyledSegment[], selection: SelectionRange): FormatStyle;
export { createSegment } from '@/utils/parser';
