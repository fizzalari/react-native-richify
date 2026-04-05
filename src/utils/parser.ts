import type { StyledSegment, FormatStyle } from '../types';
import { EMPTY_FORMAT_STYLE } from '../constants/defaultStyles';

/**
 * Creates a new segment with the given text and optional styles.
 */
export function createSegment(
  text: string,
  styles: FormatStyle = { ...EMPTY_FORMAT_STYLE },
): StyledSegment {
  return { text, styles: { ...styles } };
}

/**
 * Computes the total character length across all segments.
 */
export function getTotalLength(segments: StyledSegment[]): number {
  return segments.reduce((sum, seg) => sum + seg.text.length, 0);
}

/**
 * Converts an array of segments to plain text.
 */
export function segmentsToPlainText(segments: StyledSegment[]): string {
  return segments.map((s) => s.text).join('');
}

/**
 * Finds which segment and character offset a global position corresponds to.
 * Returns { segmentIndex, offsetInSegment }.
 */
export function findPositionInSegments(
  segments: StyledSegment[],
  globalPosition: number,
): { segmentIndex: number; offsetInSegment: number } {
  let remaining = globalPosition;

  for (let i = 0; i < segments.length; i++) {
    const segLen = segments[i].text.length;
    if (remaining <= segLen) {
      return { segmentIndex: i, offsetInSegment: remaining };
    }
    remaining -= segLen;
  }

  // Position is past the end — return end of last segment
  const lastIndex = Math.max(0, segments.length - 1);
  return {
    segmentIndex: lastIndex,
    offsetInSegment: segments.length > 0 ? segments[lastIndex].text.length : 0,
  };
}

/**
 * Splits a segment at the given offset, returning [before, after].
 * If offset is 0 or at end, one side will have empty text.
 */
export function splitSegment(
  segment: StyledSegment,
  offset: number,
): [StyledSegment, StyledSegment] {
  const before = createSegment(segment.text.slice(0, offset), segment.styles);
  const after = createSegment(segment.text.slice(offset), segment.styles);
  return [before, after];
}

/**
 * Checks if two FormatStyle objects are deeply equal.
 */
export function areStylesEqual(a: FormatStyle, b: FormatStyle): boolean {
  return (
    !!a.bold === !!b.bold &&
    !!a.italic === !!b.italic &&
    !!a.underline === !!b.underline &&
    !!a.strikethrough === !!b.strikethrough &&
    !!a.code === !!b.code &&
    (a.color ?? undefined) === (b.color ?? undefined) &&
    (a.backgroundColor ?? undefined) === (b.backgroundColor ?? undefined) &&
    (a.fontSize ?? undefined) === (b.fontSize ?? undefined) &&
    (a.heading ?? undefined) === (b.heading ?? undefined)
  );
}

/**
 * Merges adjacent segments that have identical styles.
 * Returns a new array (does not mutate input).
 */
export function mergeAdjacentSegments(
  segments: StyledSegment[],
): StyledSegment[] {
  if (segments.length === 0) {
    return [createSegment('')];
  }

  const result: StyledSegment[] = [];
  let last: StyledSegment | null = null;

  for (const seg of segments) {
    // Empty segment → acts as boundary
    if (seg.text.length === 0) {
      last = null; // break merge chain
      continue;
    }

    if (last && areStylesEqual(last.styles, seg.styles)) {
      last.text += seg.text;
    } else {
      const newSeg = createSegment(seg.text, seg.styles);
      result.push(newSeg);
      last = newSeg;
    }
  }

  // If everything was empty
  if (result.length === 0) {
    return [createSegment('')];
  }

  return result;
}

/**
 * Given the old segments and new plain text (from TextInput onChange),
 * reconcile the segments to preserve formatting while reflecting the text change.
 *
 * Strategy:
 * 1. Find the diff region between old plain text and new plain text
 * 2. Replace that region in the segment array
 * 3. New text inserted at the diff point inherits the `activeStyles`
 */
export function reconcileTextChange(
  oldSegments: StyledSegment[],
  newText: string,
  activeStyles: FormatStyle,
): StyledSegment[] {
  const oldText = segmentsToPlainText(oldSegments);

  if (newText === oldText) {
    return oldSegments;
  }

  // Find common prefix length
  let prefixLen = 0;
  const minLen = Math.min(oldText.length, newText.length);
  while (prefixLen < minLen && oldText[prefixLen] === newText[prefixLen]) {
    prefixLen++;
  }

  // Find common suffix length (from end, but not overlapping with prefix)
  let suffixLen = 0;
  while (
    suffixLen < minLen - prefixLen &&
    oldText[oldText.length - 1 - suffixLen] ===
    newText[newText.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  const deleteStart = prefixLen;
  const deleteEnd = oldText.length - suffixLen;
  const insertedText = newText.slice(prefixLen, newText.length - suffixLen);

  // Build new segments
  // 1. Keep segments before deleteStart
  // 2. Insert new text segment with activeStyles
  // 3. Keep segments after deleteEnd

  const result: StyledSegment[] = [];

  let pos = 0;
  let phase: 'before' | 'during' | 'after' = 'before';
  let insertedNewSegment = false;

  for (const seg of oldSegments) {
    const segStart = pos;
    const segEnd = pos + seg.text.length;

    if (phase === 'before') {
      if (segEnd <= deleteStart) {
        // Entire segment is before delete region
        result.push(createSegment(seg.text, seg.styles));
      } else if (segStart < deleteStart) {
        // Segment partially before delete region
        result.push(
          createSegment(seg.text.slice(0, deleteStart - segStart), seg.styles),
        );

        if (!insertedNewSegment && insertedText.length > 0) {
          result.push(createSegment(insertedText, activeStyles));
          insertedNewSegment = true;
        }

        if (segEnd > deleteEnd) {
          // Segment also extends past delete region
          result.push(
            createSegment(seg.text.slice(deleteEnd - segStart), seg.styles),
          );
          phase = 'after';
        } else {
          phase = 'during';
        }
      } else {
        // segStart >= deleteStart → we've reached the delete region
        if (!insertedNewSegment && insertedText.length > 0) {
          result.push(createSegment(insertedText, activeStyles));
          insertedNewSegment = true;
        }

        if (segEnd <= deleteEnd) {
          // Entire segment is within delete region — skip it
          phase = segEnd === deleteEnd ? 'after' : 'during';
        } else {
          // Segment extends past delete region
          result.push(
            createSegment(seg.text.slice(deleteEnd - segStart), seg.styles),
          );
          phase = 'after';
        }
      }
    } else if (phase === 'during') {
      if (!insertedNewSegment && insertedText.length > 0) {
        result.push(createSegment(insertedText, activeStyles));
        insertedNewSegment = true;
      }

      if (segEnd <= deleteEnd) {
        // Still in delete region — skip
        if (segEnd === deleteEnd) {
          phase = 'after';
        }
      } else {
        // Segment extends past delete region
        result.push(
          createSegment(seg.text.slice(deleteEnd - segStart), seg.styles),
        );
        phase = 'after';
      }
    } else {
      // phase === 'after'
      result.push(createSegment(seg.text, seg.styles));
    }

    pos = segEnd;
  }

  // If we never inserted the new text (e.g., appending at end)
  if (!insertedNewSegment && insertedText.length > 0) {
    result.push(createSegment(insertedText, activeStyles));
  }

  return mergeAdjacentSegments(result);
}
