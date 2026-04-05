// ─── Components ──────────────────────────────────────────────────────────────
export { RichTextInput } from './components/RichTextInput';
export { OverlayText } from './components/OverlayText';
export { Toolbar } from './components/Toolbar';
export { ToolbarButton } from './components/ToolbarButton';

// ─── Hooks ───────────────────────────────────────────────────────────────────
export { useRichText } from './hooks/useRichText';
export type { UseRichTextOptions } from './hooks/useRichText';
export { useSelection } from './hooks/useSelection';
export { useFormatting } from './hooks/useFormatting';

// ─── Context ─────────────────────────────────────────────────────────────────
export {
  RichTextProvider,
  useRichTextContext,
} from './context/RichTextContext';
export type { RichTextProviderProps } from './context/RichTextContext';

// ─── Utilities ───────────────────────────────────────────────────────────────
export {
  createSegment,
  segmentsToPlainText,
  getTotalLength,
  mergeAdjacentSegments,
  reconcileTextChange,
} from './utils/parser';
export {
  toggleFormatOnSelection,
  setStyleOnSelection,
  setHeadingOnLine,
  isFormatActiveInSelection,
  getSelectionStyle,
} from './utils/formatter';
export {
  formatStyleToTextStyle,
  segmentToTextStyle,
  segmentsToTextStyles,
} from './utils/styleMapper';

// ─── Constants ───────────────────────────────────────────────────────────────
export {
  DEFAULT_COLORS,
  DEFAULT_THEME,
  DEFAULT_TOOLBAR_ITEMS,
  DEFAULT_BASE_TEXT_STYLE,
  HEADING_FONT_SIZES,
  EMPTY_FORMAT_STYLE,
} from './constants/defaultStyles';

// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  FormatType,
  HeadingLevel,
  ListType,
  FormatStyle,
  StyledSegment,
  SelectionRange,
  RichTextState,
  RichTextActions,
  UseRichTextReturn,
  RichTextTheme,
  ToolbarItem,
  ToolbarButtonRenderProps,
  ToolbarRenderProps,
  OverlayTextProps,
  ToolbarButtonProps,
  ToolbarProps,
  RichTextInputProps,
} from './types';
