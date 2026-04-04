import type { StyledSegment, FormatStyle } from '@/types';
/**
 * Creates a new segment with the given text and optional styles.
 */
export declare function createSegment(text: string, styles?: FormatStyle): StyledSegment;
/**
 * Computes the total character length across all segments.
 */
export declare function getTotalLength(segments: StyledSegment[]): number;
/**
 * Converts an array of segments to plain text.
 */
export declare function segmentsToPlainText(segments: StyledSegment[]): string;
/**
 * Finds which segment and character offset a global position corresponds to.
 * Returns { segmentIndex, offsetInSegment }.
 */
export declare function findPositionInSegments(segments: StyledSegment[], globalPosition: number): {
    segmentIndex: number;
    offsetInSegment: number;
};
/**
 * Splits a segment at the given offset, returning [before, after].
 * If offset is 0 or at end, one side will have empty text.
 */
export declare function splitSegment(segment: StyledSegment, offset: number): [StyledSegment, StyledSegment];
/**
 * Checks if two FormatStyle objects are deeply equal.
 */
export declare function areStylesEqual(a: FormatStyle, b: FormatStyle): boolean;
/**
 * Merges adjacent segments that have identical styles.
 * Returns a new array (does not mutate input).
 */
export declare function mergeAdjacentSegments(segments: StyledSegment[]): StyledSegment[];
/**
 * Given the old segments and new plain text (from TextInput onChange),
 * reconcile the segments to preserve formatting while reflecting the text change.
 *
 * Strategy:
 * 1. Find the diff region between old plain text and new plain text
 * 2. Replace that region in the segment array
 * 3. New text inserted at the diff point inherits the `activeStyles`
 */
export declare function reconcileTextChange(oldSegments: StyledSegment[], newText: string, activeStyles: FormatStyle): StyledSegment[];
