import type { OutputFormat, StyledSegment } from '../types';
/**
 * Serialize styled segments as Markdown or HTML.
 */
export declare function serializeSegments(segments: StyledSegment[], format?: OutputFormat): string;
/**
 * Convenience wrapper for Markdown output.
 */
export declare function segmentsToMarkdown(segments: StyledSegment[]): string;
/**
 * Convenience wrapper for HTML output.
 */
export declare function segmentsToHTML(segments: StyledSegment[]): string;
