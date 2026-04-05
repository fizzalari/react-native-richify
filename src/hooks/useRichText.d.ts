import type { StyledSegment, UseRichTextReturn } from '../types';
export interface UseRichTextOptions {
    /** Initial segments to populate the editor with. */
    initialSegments?: StyledSegment[];
    /** Callback when segments change. */
    onChangeSegments?: (segments: StyledSegment[]) => void;
    /** Callback when plain text changes. */
    onChangeText?: (text: string) => void;
}
/**
 * Main hook for the rich text editor.
 *
 * Manages the complete editor state (segments, selection, active styles)
 * and exposes all actions needed to build a rich text UI.
 */
export declare function useRichText(options?: UseRichTextOptions): UseRichTextReturn;
