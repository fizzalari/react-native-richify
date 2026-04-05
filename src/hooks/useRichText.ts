import { useState, useCallback, useRef } from 'react';
import type {
  StyledSegment,
  FormatStyle,
  OutputFormat,
  SelectionRange,
  RichTextState,
  RichTextActions,
  UseRichTextReturn,
} from '../types';
import { EMPTY_FORMAT_STYLE } from '../constants/defaultStyles';
import {
  createSegment,
  segmentsToPlainText,
  reconcileTextChange,
  findPositionInSegments,
} from '../utils/parser';
import { getSelectionStyle } from '../utils/formatter';
import { serializeSegments } from '../utils/serializer';
import { useSelection } from '../hooks/useSelection';
import { useFormatting } from '../hooks/useFormatting';

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
export function useRichText(
  options: UseRichTextOptions = {},
): UseRichTextReturn {
  const { initialSegments, onChangeSegments, onChangeText } = options;

  // ─── State ───────────────────────────────────────────────────────────────

  const [segments, setSegments] = useState<StyledSegment[]>(() => {
    if (initialSegments && initialSegments.length > 0) {
      return initialSegments;
    }
    return [createSegment('')];
  });

  const [activeStyles, setActiveStyles] = useState<FormatStyle>({
    ...EMPTY_FORMAT_STYLE,
  });

  const { selection, handleSelectionChange } = useSelection();

  // Refs for stable access in callbacks
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const activeStylesRef = useRef(activeStyles);
  activeStylesRef.current = activeStyles;
  const preserveActiveStylesRef = useRef(false);

  // ─── Segment Change Handler ──────────────────────────────────────────────

  const updateSegments = useCallback(
    (newSegments: StyledSegment[]) => {
      setSegments(newSegments);
      onChangeSegments?.(newSegments);
      onChangeText?.(segmentsToPlainText(newSegments));
    },
    [onChangeSegments, onChangeText],
  );

  // ─── Formatting ──────────────────────────────────────────────────────────

  const formatting = useFormatting({
    segments,
    selection,
    activeStyles,
    onSegmentsChange: updateSegments,
    onActiveStylesChange: setActiveStyles,
  });

  // ─── Text Change Handler ─────────────────────────────────────────────────

  const handleTextChange = useCallback(
    (newText: string) => {
      const currentSegments = segmentsRef.current;
      const currentSelection = selectionRef.current;
      const currentActiveStyles =
        currentSelection.start === currentSelection.end
          ? activeStylesRef.current
          : getSelectionStyle(currentSegments, currentSelection);

      const newSegments = reconcileTextChange(
        currentSegments,
        newText,
        currentActiveStyles,
      );

      updateSegments(newSegments);
    },
    [updateSegments],
  );

  // ─── Selection Change Handler ────────────────────────────────────────────

  const onSelectionChange = useCallback(
    (newSelection: SelectionRange) => {
      const previousSelection = selectionRef.current;
      handleSelectionChange(newSelection);

      const shouldPreserveActiveStyles =
        preserveActiveStylesRef.current &&
        previousSelection.start === previousSelection.end &&
        newSelection.start === newSelection.end &&
        newSelection.start >= previousSelection.start &&
        newSelection.start - previousSelection.start <= 1;

      if (shouldPreserveActiveStyles) {
        return;
      }

      preserveActiveStylesRef.current = false;

      // Update active styles based on cursor position
      if (newSelection.start === newSelection.end) {
        const pos = findPositionInSegments(
          segmentsRef.current,
          newSelection.start,
        );
        if (segmentsRef.current.length > 0) {
          const seg = segmentsRef.current[pos.segmentIndex];
          setActiveStyles({ ...seg.styles });
        }
      }
    },
    [handleSelectionChange],
  );

  // ─── Export / Import ─────────────────────────────────────────────────────

  const getPlainText = useCallback((): string => {
    return segmentsToPlainText(segmentsRef.current);
  }, []);

  const getOutput = useCallback(
    (format: OutputFormat = 'markdown'): string => {
      return serializeSegments(segmentsRef.current, format);
    },
    [],
  );

  const exportJSON = useCallback((): StyledSegment[] => {
    return JSON.parse(JSON.stringify(segmentsRef.current));
  }, []);

  const importJSON = useCallback(
    (newSegments: StyledSegment[]) => {
      const safeSegments =
        newSegments.length > 0 ? newSegments : [createSegment('')];
      updateSegments(safeSegments);
    },
    [updateSegments],
  );

  const clear = useCallback(() => {
    updateSegments([createSegment('')]);
    setActiveStyles({ ...EMPTY_FORMAT_STYLE });
    preserveActiveStylesRef.current = false;
  }, [updateSegments]);

  const toggleFormat = useCallback<RichTextActions['toggleFormat']>(
    (format) => {
      if (selectionRef.current.start === selectionRef.current.end) {
        preserveActiveStylesRef.current = true;
      }
      formatting.toggleFormat(format);
    },
    [formatting],
  );

  const setStyleProperty = useCallback<RichTextActions['setStyleProperty']>(
    (key, value) => {
      if (selectionRef.current.start === selectionRef.current.end) {
        preserveActiveStylesRef.current = true;
      }
      formatting.setStyleProperty(key, value);
    },
    [formatting],
  );

  const setHeading = useCallback<RichTextActions['setHeading']>(
    (level) => {
      if (selectionRef.current.start === selectionRef.current.end) {
        preserveActiveStylesRef.current = true;
      }
      formatting.setHeading(level);
    },
    [formatting],
  );

  const setColor = useCallback<RichTextActions['setColor']>(
    (color) => {
      if (selectionRef.current.start === selectionRef.current.end) {
        preserveActiveStylesRef.current = true;
      }
      formatting.setColor(color);
    },
    [formatting],
  );

  const setBackgroundColor = useCallback<RichTextActions['setBackgroundColor']>(
    (color) => {
      if (selectionRef.current.start === selectionRef.current.end) {
        preserveActiveStylesRef.current = true;
      }
      formatting.setBackgroundColor(color);
    },
    [formatting],
  );

  const setFontSize = useCallback<RichTextActions['setFontSize']>(
    (size) => {
      if (selectionRef.current.start === selectionRef.current.end) {
        preserveActiveStylesRef.current = true;
      }
      formatting.setFontSize(size);
    },
    [formatting],
  );

  // ─── Build Return Value ──────────────────────────────────────────────────

  const state: RichTextState = {
    segments,
    selection,
    activeStyles,
  };

  const actions: RichTextActions = {
    toggleFormat,
    setStyleProperty,
    setHeading,
    setColor,
    setBackgroundColor,
    setFontSize,
    handleTextChange,
    handleSelectionChange: onSelectionChange,
    isFormatActive: formatting.isFormatActive,
    getSelectionStyle: formatting.currentSelectionStyle,
    getOutput,
    getPlainText,
    exportJSON,
    importJSON,
    clear,
  };

  return { state, actions };
}
