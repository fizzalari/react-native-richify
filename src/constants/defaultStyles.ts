import React from 'react';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Strikethrough,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignStart,
  Underline,
} from 'lucide-react-native';
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
  outputBackground: '#F8FAFC',
  outputLabel: '#475569',
  link: '#2563EB',
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
  listType: undefined,
  textAlign: undefined,
  link: undefined,
  imageSrc: undefined,
  imageAlt: undefined,
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
    color: DEFAULT_COLORS.text,
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
  outputContainerStyle: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DEFAULT_COLORS.toolbarBorder,
    backgroundColor: DEFAULT_COLORS.outputBackground,
  },
  outputLabelStyle: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: DEFAULT_COLORS.outputLabel,
    textTransform: 'uppercase',
  },
  outputTextStyle: {
    fontSize: 14,
    lineHeight: 20,
    color: DEFAULT_COLORS.text,
    fontFamily: 'monospace',
  },
  renderedOutputStyle: {
    gap: 10,
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
    link: DEFAULT_COLORS.link,
    cursor: DEFAULT_COLORS.cursor,
  },
};

/**
 * Default toolbar items for the built-in toolbar.
 */
export const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[] = [
  { id: 'bold', label: createToolbarIcon(Bold), format: 'bold', accessibilityLabel: 'Bold' },
  { id: 'italic', label: createToolbarIcon(Italic), format: 'italic', accessibilityLabel: 'Italic' },
  { id: 'underline', label: createToolbarIcon(Underline), format: 'underline', accessibilityLabel: 'Underline' },
  { id: 'strikethrough', label: createToolbarIcon(Strikethrough), format: 'strikethrough', accessibilityLabel: 'Strikethrough' },
  { id: 'code', label: createToolbarIcon(Code), format: 'code', accessibilityLabel: 'Code' },
  { id: 'h1', label: createToolbarIcon(Heading1), heading: 'h1', accessibilityLabel: 'Heading 1' },
  { id: 'h2', label: createToolbarIcon(Heading2), heading: 'h2', accessibilityLabel: 'Heading 2' },
  { id: 'h3', label: createToolbarIcon(Heading3), heading: 'h3', accessibilityLabel: 'Heading 3' },
  { id: 'bullet', label: createToolbarIcon(List), listType: 'bullet', accessibilityLabel: 'Bullet list' },
  { id: 'ordered', label: createToolbarIcon(ListOrdered), listType: 'ordered', accessibilityLabel: 'Ordered list' },
  { id: 'link', label: createToolbarIcon(Link2), actionType: 'link', accessibilityLabel: 'Link' },
  { id: 'image', label: createToolbarIcon(ImagePlus), actionType: 'image', accessibilityLabel: 'Insert image' },
  { id: 'align-left', label: createToolbarIcon(TextAlignStart), textAlign: 'left', accessibilityLabel: 'Align left' },
  { id: 'align-center', label: createToolbarIcon(TextAlignCenter), textAlign: 'center', accessibilityLabel: 'Align center' },
  { id: 'align-right', label: createToolbarIcon(TextAlignEnd), textAlign: 'right', accessibilityLabel: 'Align right' },
  { id: 'format-markdown', label: 'MD', outputFormat: 'markdown', accessibilityLabel: 'Markdown output' },
  { id: 'format-html', label: 'HTML', outputFormat: 'html', accessibilityLabel: 'HTML output' },
  { id: 'preview-literal', label: 'Raw', outputPreviewMode: 'literal', accessibilityLabel: 'Raw output view' },
  { id: 'preview-rendered', label: 'View', outputPreviewMode: 'rendered', accessibilityLabel: 'Rendered preview' },
];

function createToolbarIcon(
  Icon: React.ComponentType<{
    color?: string;
    size?: number;
    strokeWidth?: number;
  }>,
) {
  return React.createElement(Icon);
}
