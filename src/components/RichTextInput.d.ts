import React from 'react';
import type { RichTextInputProps } from '@/types';
/**
 * RichTextInput — The main rich text editor component.
 *
 * Uses the Overlay Technique:
 * - A transparent `TextInput` on top captures user input and selection
 * - A styled `<Text>` layer behind it renders the formatted content
 * - Both share identical font metrics for pixel-perfect alignment
 *
 * @example
 * ```tsx
 * <RichTextInput
 *   placeholder="Start typing..."
 *   showToolbar
 *   onChangeSegments={(segments) => console.log(segments)}
 * />
 * ```
 */
export declare const RichTextInput: React.FC<RichTextInputProps>;
