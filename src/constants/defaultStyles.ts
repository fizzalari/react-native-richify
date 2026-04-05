import type { RichTextTheme, FormatStyle, ToolbarItem } from '../types';

/**
 * Default color palette used throughout the editor.
 */
export const DEFAULT_COLORS = {
  primary: '#6366F1',
  background: '#FFFFFF',
  text: '#1F2937',
  placeholder: '#9CA3AF',
  toolbarBackground: '#F9FAFB',
  toolbarBorder: '#E5E7EB',
  cursor: '#6366F1',
  activeButtonBg: '#EEF2FF',
  codeBackground: '#F3F4F6',
} as const;

/**
 * Font size presets for heading levels.
 */
export const HEADING_FONT_SIZES = {
  h1: 32,
  h2: 24,
  h3: 20,
  none: 16,
} as const;

/**
 * Default base text style applied to all segments.
 */
export const DEFAULT_BASE_TEXT_STYLE = {
  fontSize: 16,
  lineHeight: 24,
  color: DEFAULT_COLORS.text,
  fontFamily: undefined, // Uses system default
} as const;

/**
 * Empty format style — no formatting applied.
 */
export const EMPTY_FORMAT_STYLE: FormatStyle = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  code: false,
  color: undefined,
  backgroundColor: undefined,
  fontSize: undefined,
  heading: undefined,
};

/**
 * Default theme configuration.
 */
export const DEFAULT_THEME: RichTextTheme = {
  containerStyle: {
    borderWidth: 1,
    borderColor: DEFAULT_COLORS.toolbarBorder,
    borderRadius: 12,
    backgroundColor: DEFAULT_COLORS.background,
    overflow: 'hidden',
  },
  inputStyle: {
    fontSize: DEFAULT_BASE_TEXT_STYLE.fontSize,
    lineHeight: DEFAULT_BASE_TEXT_STYLE.lineHeight,
    color: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  overlayContainerStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  baseTextStyle: {
    fontSize: DEFAULT_BASE_TEXT_STYLE.fontSize,
    lineHeight: DEFAULT_BASE_TEXT_STYLE.lineHeight,
    color: DEFAULT_COLORS.text,
  },
  toolbarStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: DEFAULT_COLORS.toolbarBackground,
    borderColor: DEFAULT_COLORS.toolbarBorder,
    gap: 2,
  },
  toolbarButtonStyle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarButtonActiveStyle: {
    backgroundColor: DEFAULT_COLORS.activeButtonBg,
  },
  toolbarButtonTextStyle: {
    fontSize: 15,
    fontWeight: '600',
    color: DEFAULT_COLORS.text,
  },
  toolbarButtonActiveTextStyle: {
    color: DEFAULT_COLORS.primary,
  },
  codeStyle: {
    fontFamily: 'monospace',
    backgroundColor: DEFAULT_COLORS.codeBackground,
    paddingHorizontal: 4,
    borderRadius: 4,
    fontSize: 14,
  },
  colors: {
    primary: DEFAULT_COLORS.primary,
    background: DEFAULT_COLORS.background,
    text: DEFAULT_COLORS.text,
    placeholder: DEFAULT_COLORS.placeholder,
    toolbarBackground: DEFAULT_COLORS.toolbarBackground,
    toolbarBorder: DEFAULT_COLORS.toolbarBorder,
    cursor: DEFAULT_COLORS.cursor,
  },
};

/**
 * Default toolbar items for the built-in toolbar.
 */
export const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[] = [
  { id: 'bold', label: 'B', format: 'bold' },
  { id: 'italic', label: 'I', format: 'italic' },
  { id: 'underline', label: 'U', format: 'underline' },
  { id: 'strikethrough', label: 'S', format: 'strikethrough' },
  { id: 'code', label: '<>', format: 'code' },
  { id: 'h1', label: 'H1', heading: 'h1' },
  { id: 'h2', label: 'H2', heading: 'h2' },
  { id: 'h3', label: 'H3', heading: 'h3' },
];
