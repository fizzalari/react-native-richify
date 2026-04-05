import { useCallback } from 'react';
import type {
  StyledSegment,
  FormatType,
  FormatStyle,
  HeadingLevel,
  SelectionRange,
} from '../types';
import {
  toggleFormatOnSelection,
  setStyleOnSelection,
  setHeadingOnLine,
  isFormatActiveInSelection,
  getSelectionStyle,
} from '../utils/formatter';

interface UseFormattingOptions {
  segments: StyledSegment[];
  selection: SelectionRange;
  activeStyles: FormatStyle;
  onSegmentsChange: (segments: StyledSegment[]) => void;
  onActiveStylesChange: (styles: FormatStyle) => void;
}

/**
 * Hook that provides formatting commands for the rich text editor.
 *
 * Handles both selection-based formatting (when text is selected)
 * and active-style updates (when no text is selected — affects next typed text).
 */
export function useFormatting({
  segments,
  selection,
  activeStyles,
  onSegmentsChange,
  onActiveStylesChange,
}: UseFormattingOptions) {
  const toggleFormat = useCallback(
    (format: FormatType) => {
      if (selection.start === selection.end) {
        // No selection — toggle active style for next typed text
        onActiveStylesChange({
          ...activeStyles,
          [format]: !activeStyles[format],
        });
      } else {
        // Has selection — toggle format on selected text
        const newSegments = toggleFormatOnSelection(
          segments,
          selection,
          format,
        );
        onSegmentsChange(newSegments);
      }
    },
    [segments, selection, activeStyles, onSegmentsChange, onActiveStylesChange],
  );

  const setStyleProperty = useCallback(
    <K extends keyof FormatStyle>(key: K, value: FormatStyle[K]) => {
      if (selection.start === selection.end) {
        onActiveStylesChange({
          ...activeStyles,
          [key]: value,
        });
      } else {
        const newSegments = setStyleOnSelection(
          segments,
          selection,
          key,
          value,
        );
        onSegmentsChange(newSegments);
      }
    },
    [segments, selection, activeStyles, onSegmentsChange, onActiveStylesChange],
  );

  const setHeading = useCallback(
    (level: HeadingLevel) => {
      if (selection.start === selection.end) {
        onActiveStylesChange({
          ...activeStyles,
          heading: level === 'none' ? undefined : level,
        });
      }

      const newSegments = setHeadingOnLine(segments, selection, level);
      onSegmentsChange(newSegments);
    },
    [
      activeStyles,
      onActiveStylesChange,
      onSegmentsChange,
      segments,
      selection,
    ],
  );

  const setColor = useCallback(
    (color: string) => {
      setStyleProperty('color', color);
    },
    [setStyleProperty],
  );

  const setBackgroundColor = useCallback(
    (color: string) => {
      setStyleProperty('backgroundColor', color);
    },
    [setStyleProperty],
  );

  const setFontSize = useCallback(
    (size: number) => {
      setStyleProperty('fontSize', size);
    },
    [setStyleProperty],
  );

  const isFormatActive = useCallback(
    (format: FormatType): boolean => {
      if (selection.start === selection.end) {
        return !!activeStyles[format];
      }
      return isFormatActiveInSelection(segments, selection, format);
    },
    [segments, selection, activeStyles],
  );

  const currentSelectionStyle = useCallback((): FormatStyle => {
    if (selection.start === selection.end) {
      return activeStyles;
    }
    return getSelectionStyle(segments, selection);
  }, [segments, selection, activeStyles]);

  return {
    toggleFormat,
    setStyleProperty,
    setHeading,
    setColor,
    setBackgroundColor,
    setFontSize,
    isFormatActive,
    currentSelectionStyle,
  };
}
