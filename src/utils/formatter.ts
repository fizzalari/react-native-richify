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
  createSegment,
  findPositionInSegments,
  mergeAdjacentSegments,
  segmentsToPlainText,
} from '../utils/parser';

/**
 * Toggle an inline format (bold, italic, etc.) on the selected range.
 *
 * If the entire selection already has the format, it is removed.
 * Otherwise, it is applied to the entire selection.
 *
 * Returns the new segments array.
 */
export function toggleFormatOnSelection(
  segments: StyledSegment[],
  selection: SelectionRange,
  format: FormatType,
): StyledSegment[] {
  if (selection.start === selection.end) {
    // No selection — return unchanged (active styles handle this case)
    return segments;
  }

  const { start, end } = normalizeSelection(selection);

  // Extract the selected segments to check current state
  const selectedSegments = extractSegmentsInRange(segments, start, end);
  const allHaveFormat = selectedSegments.every((s) => !!s.styles[format]);

  // Apply or remove the format
  return applyStyleToRange(segments, start, end, {
    [format]: !allHaveFormat,
  });
}

/**
 * Set a specific style property on the selected range.
 */
export function setStyleOnSelection<K extends keyof FormatStyle>(
  segments: StyledSegment[],
  selection: SelectionRange,
  key: K,
  value: FormatStyle[K],
): StyledSegment[] {
  if (selection.start === selection.end) {
    return segments;
  }

  const { start, end } = normalizeSelection(selection);
  return applyStyleToRange(segments, start, end, { [key]: value });
}

/**
 * Apply a heading level to the line containing the cursor/selection.
 */
export function setHeadingOnLine(
  segments: StyledSegment[],
  selection: SelectionRange,
  level: HeadingLevel,
): StyledSegment[] {
  return setLineStyleOnSelection(segments, selection, {
    heading: level === 'none' ? undefined : level,
    listType: level === 'none' ? undefined : undefined,
  });
}

/**
 * Apply a list type to the lines containing the cursor/selection.
 */
export function setListTypeOnLine(
  segments: StyledSegment[],
  selection: SelectionRange,
  listType: ListType,
): StyledSegment[] {
  return setLineStyleOnSelection(segments, selection, {
    listType: listType === 'none' ? undefined : listType,
    heading: listType === 'none' ? undefined : undefined,
  });
}

/**
 * Apply text alignment to the lines containing the cursor/selection.
 */
export function setTextAlignOnLine(
  segments: StyledSegment[],
  selection: SelectionRange,
  textAlign?: TextAlign,
): StyledSegment[] {
  return setLineStyleOnSelection(segments, selection, {
    textAlign,
  });
}

/**
 * Checks whether the given format is active across the entire selection.
 */
export function isFormatActiveInSelection(
  segments: StyledSegment[],
  selection: SelectionRange,
  format: FormatType,
): boolean {
  if (selection.start === selection.end) {
    return false;
  }

  const { start, end } = normalizeSelection(selection);
  const selected = extractSegmentsInRange(segments, start, end);
  return selected.length > 0 && selected.every((s) => !!s.styles[format]);
}

/**
 * Gets the format style that is common across the entire selection.
 * For properties where segments disagree, the value is undefined.
 */
export function getSelectionStyle(
  segments: StyledSegment[],
  selection: SelectionRange,
): FormatStyle {
  if (selection.start === selection.end) {
    // Return style at cursor position
    const pos = findPositionInSegments(segments, selection.start);
    if (segments.length > 0) {
      return { ...segments[pos.segmentIndex].styles };
    }
    return {};
  }

  const { start, end } = normalizeSelection(selection);
  const selected = extractSegmentsInRange(segments, start, end);

  if (selected.length === 0) return {};

  const result: FormatStyle = { ...selected[0].styles };

  for (let i = 1; i < selected.length; i++) {
    const s = selected[i].styles;
    if (result.bold !== undefined && result.bold !== !!s.bold)
      result.bold = undefined;
    if (result.italic !== undefined && result.italic !== !!s.italic)
      result.italic = undefined;
    if (result.underline !== undefined && result.underline !== !!s.underline)
      result.underline = undefined;
    if (
      result.strikethrough !== undefined &&
      result.strikethrough !== !!s.strikethrough
    )
      result.strikethrough = undefined;
    if (result.code !== undefined && result.code !== !!s.code)
      result.code = undefined;
    if (result.color !== s.color) result.color = undefined;
    if (result.backgroundColor !== s.backgroundColor)
      result.backgroundColor = undefined;
    if (result.fontSize !== s.fontSize) result.fontSize = undefined;
    if (result.heading !== s.heading) result.heading = undefined;
    if (result.listType !== s.listType) result.listType = undefined;
    if (result.textAlign !== s.textAlign) result.textAlign = undefined;
    if (result.link !== s.link) result.link = undefined;
    if (result.imageSrc !== s.imageSrc) result.imageSrc = undefined;
    if (result.imageAlt !== s.imageAlt) result.imageAlt = undefined;
  }

  return result;
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

/**
 * Normalize selection so start <= end.
 */
function normalizeSelection(selection: SelectionRange): SelectionRange {
  return {
    start: Math.min(selection.start, selection.end),
    end: Math.max(selection.start, selection.end),
  };
}

/**
 * Extract the text segments that fall within [start, end) of the global text.
 */
function extractSegmentsInRange(
  segments: StyledSegment[],
  start: number,
  end: number,
): StyledSegment[] {
  const result: StyledSegment[] = [];
  let pos = 0;

  for (const seg of segments) {
    const segStart = pos;
    const segEnd = pos + seg.text.length;

    if (segEnd <= start) {
      pos = segEnd;
      continue;
    }
    if (segStart >= end) {
      break;
    }

    // This segment overlaps with [start, end)
    const overlapStart = Math.max(segStart, start);
    const overlapEnd = Math.min(segEnd, end);
    result.push(
      createSegment(
        seg.text.slice(overlapStart - segStart, overlapEnd - segStart),
        seg.styles,
      ),
    );

    pos = segEnd;
  }

  return result;
}

/**
 * Apply a partial style to a character range within the segments array.
 * Splits segments at boundaries and applies the style delta to all segments in range.
 */
function applyStyleToRange(
  segments: StyledSegment[],
  start: number,
  end: number,
  styleDelta: Partial<FormatStyle>,
): StyledSegment[] {
  const result: StyledSegment[] = [];
  let pos = 0;

  for (const seg of segments) {
    const segStart = pos;
    const segEnd = pos + seg.text.length;

    if (segEnd <= start || segStart >= end) {
      // Outside the range — keep as-is
      result.push(createSegment(seg.text, seg.styles));
    } else {
      // Overlaps with range — may need to split
      if (segStart < start) {
        // Portion before the range
        result.push(
          createSegment(seg.text.slice(0, start - segStart), seg.styles),
        );
      }

      // The overlapping portion — apply style delta
      const overlapStart = Math.max(segStart, start);
      const overlapEnd = Math.min(segEnd, end);
      const newStyles = { ...seg.styles, ...styleDelta };
      result.push(
        createSegment(
          seg.text.slice(overlapStart - segStart, overlapEnd - segStart),
          newStyles,
        ),
      );

      if (segEnd > end) {
        // Portion after the range
        result.push(
          createSegment(seg.text.slice(end - segStart), seg.styles),
        );
      }
    }

    pos = segEnd;
  }

  return mergeAdjacentSegments(result);
}

function setLineStyleOnSelection(
  segments: StyledSegment[],
  selection: SelectionRange,
  styleDelta: Partial<FormatStyle>,
): StyledSegment[] {
  const plainText = segmentsToPlainText(segments);
  const { lineStart, lineEnd } = getSelectionLineRange(plainText, selection);

  return applyStyleToRange(segments, lineStart, lineEnd, styleDelta);
}

/**
 * Get the line start and end positions for the line containing the given position.
 */
function getLineRange(
  text: string,
  position: number,
): { lineStart: number; lineEnd: number } {
  let lineStart = position;
  while (lineStart > 0 && text[lineStart - 1] !== '\n') {
    lineStart--;
  }

  let lineEnd = position;
  while (lineEnd < text.length && text[lineEnd] !== '\n') {
    lineEnd++;
  }

  return { lineStart, lineEnd };
}

function getSelectionLineRange(
  text: string,
  selection: SelectionRange,
): { lineStart: number; lineEnd: number } {
  const normalized = normalizeSelection(selection);
  const lineStart = getLineRange(text, normalized.start).lineStart;
  const effectiveEnd =
    normalized.end > normalized.start ? normalized.end - 1 : normalized.end;
  const lineEnd = getLineRange(text, effectiveEnd).lineEnd;

  return { lineStart, lineEnd };
}

// Re-export for convenience
export { createSegment } from '../utils/parser';
