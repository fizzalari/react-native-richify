import { useCallback } from 'react';
import type {
  StyledSegment,
  FormatType,
  FormatStyle,
  HeadingLevel,
  ListType,
  SelectionRange,
  TextAlign,
} from '../types';
import {
  toggleFormatOnSelection,
  setStyleOnSelection,
  setHeadingOnLine,
  setListTypeOnLine,
  setTextAlignOnLine,
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
      const currentHeading =
        selection.start === selection.end
          ? getSelectionStyle(segments, selection).heading ?? activeStyles.heading
          : getSelectionStyle(segments, selection).heading;
      const nextHeading: HeadingLevel =
        currentHeading === level ? 'none' : level;

      if (selection.start === selection.end) {
        onActiveStylesChange({
          ...activeStyles,
          heading: nextHeading === 'none' ? undefined : nextHeading,
          listType:
            nextHeading === 'none' ? activeStyles.listType : undefined,
        });
      }

      const newSegments = setHeadingOnLine(segments, selection, nextHeading);
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

  const setListType = useCallback(
    (listType: ListType) => {
      const currentListType =
        selection.start === selection.end
          ? getSelectionStyle(segments, selection).listType ??
            activeStyles.listType
          : getSelectionStyle(segments, selection).listType;
      const nextListType: ListType =
        currentListType === listType ? 'none' : listType;

      if (selection.start === selection.end) {
        onActiveStylesChange({
          ...activeStyles,
          listType: nextListType === 'none' ? undefined : nextListType,
          heading:
            nextListType === 'none' ? activeStyles.heading : undefined,
        });
      }

      const newSegments = setListTypeOnLine(
        segments,
        selection,
        nextListType,
      );
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

  const setTextAlign = useCallback(
    (textAlign: TextAlign) => {
      const currentTextAlign =
        selection.start === selection.end
          ? getSelectionStyle(segments, selection).textAlign ??
            activeStyles.textAlign
          : getSelectionStyle(segments, selection).textAlign;
      const nextTextAlign =
        currentTextAlign === textAlign ? undefined : textAlign;

      if (selection.start === selection.end) {
        onActiveStylesChange({
          ...activeStyles,
          textAlign: nextTextAlign,
        });
      }

      const newSegments = setTextAlignOnLine(
        segments,
        selection,
        nextTextAlign,
      );
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

  const setLink = useCallback(
    (url?: string) => {
      if (selection.start === selection.end) {
        onActiveStylesChange({
          ...activeStyles,
          link: url,
        });
      } else {
        const newSegments = setStyleOnSelection(segments, selection, 'link', url);
        onSegmentsChange(newSegments);
      }
    },
    [segments, selection, activeStyles, onSegmentsChange, onActiveStylesChange],
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
    setListType,
    setTextAlign,
    setLink,
    setColor,
    setBackgroundColor,
    setFontSize,
    isFormatActive,
    currentSelectionStyle,
  };
}
