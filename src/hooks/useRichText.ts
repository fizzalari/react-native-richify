import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  StyledSegment,
  FormatType,
  FormatStyle,
  HeadingLevel,
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
  const activeStylesRef = useRef(activeStyles);
  activeStylesRef.current = activeStyles;

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
      const currentActiveStyles = activeStylesRef.current;

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
      handleSelectionChange(newSelection);

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
  }, [updateSegments]);

  // ─── Build Return Value ──────────────────────────────────────────────────

  const state: RichTextState = {
    segments,
    selection,
    activeStyles,
  };

  const actions: RichTextActions = {
    toggleFormat: formatting.toggleFormat,
    setStyleProperty: formatting.setStyleProperty,
    setHeading: formatting.setHeading,
    setColor: formatting.setColor,
    setBackgroundColor: formatting.setBackgroundColor,
    setFontSize: formatting.setFontSize,
    handleTextChange,
    handleSelectionChange: onSelectionChange,
    getPlainText,
    exportJSON,
    importJSON,
    clear,
  };

  return { state, actions };
}
