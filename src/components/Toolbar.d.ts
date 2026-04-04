import React from 'react';
import type { ToolbarProps } from '@/types';
/**
 * Formatting toolbar for the rich text editor.
 *
 * Supports:
 * - Default toolbar items (bold, italic, underline, etc.)
 * - Custom toolbar items via the `items` prop
 * - Fully custom rendering via `renderToolbar`
 * - Horizontal scrolling for overflow
 */
export declare const Toolbar: React.FC<ToolbarProps>;
