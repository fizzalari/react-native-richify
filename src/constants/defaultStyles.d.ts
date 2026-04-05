import type { RichTextTheme, FormatStyle, ToolbarItem } from '../types';
/**
 * Default color palette used throughout the editor.
 */
export declare const DEFAULT_COLORS: {
    readonly primary: "#6366F1";
    readonly background: "#FFFFFF";
    readonly text: "#1F2937";
    readonly placeholder: "#9CA3AF";
    readonly toolbarBackground: "#F9FAFB";
    readonly toolbarBorder: "#E5E7EB";
    readonly cursor: "#6366F1";
    readonly activeButtonBg: "#EEF2FF";
    readonly codeBackground: "#F3F4F6";
};
/**
 * Font size presets for heading levels.
 */
export declare const HEADING_FONT_SIZES: {
    readonly h1: 32;
    readonly h2: 24;
    readonly h3: 20;
    readonly none: 16;
};
/**
 * Default base text style applied to all segments.
 */
export declare const DEFAULT_BASE_TEXT_STYLE: {
    readonly fontSize: 16;
    readonly lineHeight: 24;
    readonly color: "#1F2937";
    readonly fontFamily: undefined;
};
/**
 * Empty format style — no formatting applied.
 */
export declare const EMPTY_FORMAT_STYLE: FormatStyle;
/**
 * Default theme configuration.
 */
export declare const DEFAULT_THEME: RichTextTheme;
/**
 * Default toolbar items for the built-in toolbar.
 */
export declare const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[];
