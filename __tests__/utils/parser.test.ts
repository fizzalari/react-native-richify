import {
  createSegment,
  getTotalLength,
  segmentsToPlainText,
  findPositionInSegments,
  splitSegment,
  areStylesEqual,
  mergeAdjacentSegments,
  reconcileTextChange,
} from '@/utils/parser';
import type { StyledSegment, FormatStyle } from '@/types';
import { EMPTY_FORMAT_STYLE } from '@/constants/defaultStyles';

describe('parser', () => {
  // ─── createSegment ───────────────────────────────────────────────────────

  describe('createSegment', () => {
    it('creates a segment with default empty styles', () => {
      const seg = createSegment('hello');
      expect(seg.text).toBe('hello');
      expect(seg.styles.bold).toBeFalsy();
      expect(seg.styles.italic).toBeFalsy();
    });

    it('creates a segment with custom styles', () => {
      const seg = createSegment('world', { bold: true, italic: true });
      expect(seg.text).toBe('world');
      expect(seg.styles.bold).toBe(true);
      expect(seg.styles.italic).toBe(true);
    });

    it('creates a deep copy of styles', () => {
      const styles: FormatStyle = { bold: true };
      const seg = createSegment('test', styles);
      styles.bold = false;
      expect(seg.styles.bold).toBe(true); // Should not be affected
    });
  });

  // ─── getTotalLength ──────────────────────────────────────────────────────

  describe('getTotalLength', () => {
    it('returns 0 for empty array', () => {
      expect(getTotalLength([])).toBe(0);
    });

    it('returns correct length for single segment', () => {
      expect(getTotalLength([createSegment('hello')])).toBe(5);
    });

    it('returns correct length for multiple segments', () => {
      const segments = [
        createSegment('hello'),
        createSegment(' '),
        createSegment('world'),
      ];
      expect(getTotalLength(segments)).toBe(11);
    });
  });

  // ─── segmentsToPlainText ─────────────────────────────────────────────────

  describe('segmentsToPlainText', () => {
    it('returns empty string for empty segments', () => {
      expect(segmentsToPlainText([])).toBe('');
    });

    it('joins segment text correctly', () => {
      const segments = [
        createSegment('Hello'),
        createSegment(' '),
        createSegment('World'),
      ];
      expect(segmentsToPlainText(segments)).toBe('Hello World');
    });

    it('handles single segment', () => {
      expect(segmentsToPlainText([createSegment('test')])).toBe('test');
    });
  });

  // ─── findPositionInSegments ──────────────────────────────────────────────

  describe('findPositionInSegments', () => {
    const segments = [
      createSegment('Hello'), // 0-4
      createSegment(' '),     // 5
      createSegment('World'), // 6-10
    ];

    it('finds position at start', () => {
      const result = findPositionInSegments(segments, 0);
      expect(result).toEqual({ segmentIndex: 0, offsetInSegment: 0 });
    });

    it('finds position within first segment', () => {
      const result = findPositionInSegments(segments, 3);
      expect(result).toEqual({ segmentIndex: 0, offsetInSegment: 3 });
    });

    it('finds position at segment boundary', () => {
      const result = findPositionInSegments(segments, 5);
      expect(result).toEqual({ segmentIndex: 0, offsetInSegment: 5 });
    });

    it('finds position in last segment', () => {
      const result = findPositionInSegments(segments, 8);
      expect(result).toEqual({ segmentIndex: 2, offsetInSegment: 2 });
    });

    it('finds position at end', () => {
      const result = findPositionInSegments(segments, 11);
      expect(result).toEqual({ segmentIndex: 2, offsetInSegment: 5 });
    });

    it('handles position past end', () => {
      const result = findPositionInSegments(segments, 100);
      expect(result).toEqual({ segmentIndex: 2, offsetInSegment: 5 });
    });

    it('handles empty segments', () => {
      const result = findPositionInSegments([], 0);
      expect(result).toEqual({ segmentIndex: 0, offsetInSegment: 0 });
    });
  });

  // ─── splitSegment ────────────────────────────────────────────────────────

  describe('splitSegment', () => {
    it('splits at beginning', () => {
      const seg = createSegment('hello', { bold: true });
      const [before, after] = splitSegment(seg, 0);
      expect(before.text).toBe('');
      expect(after.text).toBe('hello');
      expect(after.styles.bold).toBe(true);
    });

    it('splits in middle', () => {
      const seg = createSegment('hello', { italic: true });
      const [before, after] = splitSegment(seg, 3);
      expect(before.text).toBe('hel');
      expect(after.text).toBe('lo');
      expect(before.styles.italic).toBe(true);
      expect(after.styles.italic).toBe(true);
    });

    it('splits at end', () => {
      const seg = createSegment('hello');
      const [before, after] = splitSegment(seg, 5);
      expect(before.text).toBe('hello');
      expect(after.text).toBe('');
    });
  });

  // ─── areStylesEqual ─────────────────────────────────────────────────────

  describe('areStylesEqual', () => {
    it('returns true for identical empty styles', () => {
      expect(areStylesEqual({}, {})).toBe(true);
    });

    it('returns true for identical styles', () => {
      expect(
        areStylesEqual(
          { bold: true, italic: true },
          { bold: true, italic: true },
        ),
      ).toBe(true);
    });

    it('returns false for different styles', () => {
      expect(
        areStylesEqual({ bold: true }, { bold: false }),
      ).toBe(false);
    });

    it('treats undefined and false as equal for boolean fields', () => {
      expect(
        areStylesEqual({ bold: undefined }, { bold: false }),
      ).toBe(true);
    });

    it('compares color correctly', () => {
      expect(
        areStylesEqual({ color: '#ff0000' }, { color: '#ff0000' }),
      ).toBe(true);
      expect(
        areStylesEqual({ color: '#ff0000' }, { color: '#00ff00' }),
      ).toBe(false);
    });

    it('compares fontSize correctly', () => {
      expect(
        areStylesEqual({ fontSize: 16 }, { fontSize: 16 }),
      ).toBe(true);
      expect(
        areStylesEqual({ fontSize: 16 }, { fontSize: 24 }),
      ).toBe(false);
    });
  });

  // ─── mergeAdjacentSegments ───────────────────────────────────────────────

  describe('mergeAdjacentSegments', () => {
    it('returns single empty segment for empty input', () => {
      const result = mergeAdjacentSegments([]);
      expect(result).toEqual([createSegment('')]);
    });

    it('merges adjacent segments with same styles', () => {
      const segments = [
        createSegment('Hello', { bold: true }),
        createSegment(' World', { bold: true }),
      ];
      const result = mergeAdjacentSegments(segments);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Hello World');
      expect(result[0].styles.bold).toBe(true);
    });

    it('does not merge segments with different styles', () => {
      const segments = [
        createSegment('Hello', { bold: true }),
        createSegment(' World', { italic: true }),
      ];
      const result = mergeAdjacentSegments(segments);
      expect(result).toHaveLength(2);
    });

    it('removes empty segments (unless only one)', () => {
      const segments = [
        createSegment('Hello'),
        createSegment(''),
        createSegment('World'),
      ];
      const result = mergeAdjacentSegments(segments);
      expect(result).toHaveLength(2);
      expect(segmentsToPlainText(result)).toBe('HelloWorld');
    });

    it('keeps single empty segment', () => {
      const segments = [createSegment('')];
      const result = mergeAdjacentSegments(segments);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('');
    });
  });

  // ─── reconcileTextChange ─────────────────────────────────────────────────

  describe('reconcileTextChange', () => {
    it('handles appending text', () => {
      const segments = [createSegment('Hello')];
      const result = reconcileTextChange(segments, 'Hello World', {
        bold: true,
      });

      const plain = segmentsToPlainText(result);
      expect(plain).toBe('Hello World');
    });

    it('handles inserting text in the middle', () => {
      const segments = [createSegment('Helo')];
      const result = reconcileTextChange(segments, 'Hello', {});
      expect(segmentsToPlainText(result)).toBe('Hello');
    });

    it('handles deleting text', () => {
      const segments = [createSegment('Hello World')];
      const result = reconcileTextChange(segments, 'Hello', {});
      expect(segmentsToPlainText(result)).toBe('Hello');
    });

    it('preserves formatting on unmodified segments', () => {
      const segments = [
        createSegment('Hello', { bold: true }),
        createSegment(' World'),
      ];
      const result = reconcileTextChange(segments, 'Hello World!', {
        italic: true,
      });

      expect(segmentsToPlainText(result)).toBe('Hello World!');
      // First segment should still be bold
      expect(result[0].styles.bold).toBe(true);
    });

    it('applies active styles to inserted text', () => {
      const segments = [createSegment('Hello')];
      const activeStyles: FormatStyle = { bold: true, color: '#ff0000' };
      const result = reconcileTextChange(segments, 'HelloX', activeStyles);

      expect(segmentsToPlainText(result)).toBe('HelloX');
      // The new character should have the active styles
      const lastSeg = result[result.length - 1];
      expect(lastSeg.text).toContain('X');
    });

    it('returns unchanged segments when text is the same', () => {
      const segments = [createSegment('Hello')];
      const result = reconcileTextChange(segments, 'Hello', {});
      expect(result).toEqual(segments);
    });

    it('handles complete text replacement', () => {
      const segments = [createSegment('old text')];
      const result = reconcileTextChange(segments, 'new text', {
        italic: true,
      });
      expect(segmentsToPlainText(result)).toBe('new text');
    });

    it('handles multi-segment delete across boundaries', () => {
      const segments = [
        createSegment('AAA', { bold: true }),
        createSegment('BBB', { italic: true }),
        createSegment('CCC', { underline: true }),
      ];
      // Delete "ABBB" from position 2 to 6
      const result = reconcileTextChange(segments, 'AACCC', {});
      expect(segmentsToPlainText(result)).toBe('AACCC');
      expect(result[0].styles.bold).toBe(true);
    });
  });
});
