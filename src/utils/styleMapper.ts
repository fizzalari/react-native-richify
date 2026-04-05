import type { TextStyle } from 'react-native';
import type { FormatStyle, RichTextTheme, StyledSegment } from '../types';
import { DEFAULT_THEME, HEADING_FONT_SIZES } from '../constants/defaultStyles';

/**
 * Maps a FormatStyle to a React Native TextStyle.
 * Applies formatting properties based on the segment's style.
 */
export function formatStyleToTextStyle(
  formatStyle: FormatStyle,
  theme?: RichTextTheme,
): TextStyle {
  const resolvedTheme = theme ?? DEFAULT_THEME;
  const style: TextStyle = {};

  // Bold
  if (formatStyle.bold) {
    style.fontWeight = 'bold';
  }

  // Italic
  if (formatStyle.italic) {
    style.fontStyle = 'italic';
  }

  // Underline and strikethrough
  if (formatStyle.underline && formatStyle.strikethrough) {
    style.textDecorationLine = 'underline line-through';
  } else if (formatStyle.underline) {
    style.textDecorationLine = 'underline';
  } else if (formatStyle.strikethrough) {
    style.textDecorationLine = 'line-through';
  }

  // Code — apply monospace font and background
  if (formatStyle.code) {
    const codeStyle = resolvedTheme.codeStyle ?? DEFAULT_THEME.codeStyle;
    if (codeStyle) {
      Object.assign(style, codeStyle);
    }
  }

  // Text color
  if (formatStyle.color) {
    style.color = formatStyle.color;
  }

  // Background color
  if (formatStyle.backgroundColor) {
    style.backgroundColor = formatStyle.backgroundColor;
  }

  // Font size
  if (formatStyle.fontSize) {
    style.fontSize = formatStyle.fontSize;
  }

  // Heading — overrides font size and weight
  if (formatStyle.heading && formatStyle.heading !== 'none') {
    style.fontSize = HEADING_FONT_SIZES[formatStyle.heading];
    style.fontWeight = 'bold';
    style.lineHeight = HEADING_FONT_SIZES[formatStyle.heading] * 1.3;
  }

  return style;
}

/**
 * Maps an entire segment to its computed TextStyle (base + format).
 */
export function segmentToTextStyle(
  segment: StyledSegment,
  theme?: RichTextTheme,
): TextStyle {
  const baseStyle = theme?.baseTextStyle ?? DEFAULT_THEME.baseTextStyle ?? {};
  const formatStyle = formatStyleToTextStyle(segment.styles, theme);

  return {
    ...baseStyle,
    ...formatStyle,
  };
}

/**
 * Batch-maps an array of segments to an array of TextStyles.
 */
export function segmentsToTextStyles(
  segments: StyledSegment[],
  theme?: RichTextTheme,
): TextStyle[] {
  return segments.map((seg) => segmentToTextStyle(seg, theme));
}
