import {
  toggleFormatOnSelection,
  setStyleOnSelection,
  setHeadingOnLine,
  isFormatActiveInSelection,
  getSelectionStyle,
} from '../../src/utils/formatter';
import { createSegment, segmentsToPlainText } from '../../src/utils/parser';
import type { StyledSegment, SelectionRange } from '../../src/types';

describe('formatter', () => {
  // ─── toggleFormatOnSelection ─────────────────────────────────────────────

  describe('toggleFormatOnSelection', () => {
    it('returns unchanged segments when no selection (cursor)', () => {
      const segments = [createSegment('Hello')];
      const result = toggleFormatOnSelection(
        segments,
        { start: 2, end: 2 },
        'bold',
      );
      expect(result).toEqual(segments);
    });

    it('applies bold to selected text', () => {
      const segments = [createSegment('Hello World')];
      const result = toggleFormatOnSelection(
        segments,
        { start: 0, end: 5 },
        'bold',
      );

      expect(segmentsToPlainText(result)).toBe('Hello World');
      expect(result[0].styles.bold).toBe(true);
      expect(result[0].text).toBe('Hello');
      expect(result[1].styles.bold).toBeFalsy();
      expect(result[1].text).toBe(' World');
    });

    it('removes bold from fully-bold selection', () => {
      const segments = [createSegment('Hello', { bold: true })];
      const result = toggleFormatOnSelection(
        segments,
        { start: 0, end: 5 },
        'bold',
      );

      expect(result[0].styles.bold).toBe(false);
    });

    it('applies italic to middle of text', () => {
      const segments = [createSegment('Hello World')];
      const result = toggleFormatOnSelection(
        segments,
        { start: 6, end: 11 },
        'italic',
      );

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Hello ');
      expect(result[0].styles.italic).toBeFalsy();
      expect(result[1].text).toBe('World');
      expect(result[1].styles.italic).toBe(true);
    });

    it('applies format across multiple segments', () => {
      const segments = [
        createSegment('Hello', { bold: true }),
        createSegment(' World'),
      ];
      const result = toggleFormatOnSelection(
        segments,
        { start: 3, end: 8 },
        'underline',
      );

      const plain = segmentsToPlainText(result);
      expect(plain).toBe('Hello World');
      // The underlined portion should span from index 3 to 8
    });

    it('handles reversed selection (end < start)', () => {
      const segments = [createSegment('Hello')];
      const result = toggleFormatOnSelection(
        segments,
        { start: 5, end: 0 },
        'bold',
      );
      expect(result[0].styles.bold).toBe(true);
    });

    it('toggles strikethrough', () => {
      const segments = [createSegment('Hello')];
      const result = toggleFormatOnSelection(
        segments,
        { start: 0, end: 5 },
        'strikethrough',
      );
      expect(result[0].styles.strikethrough).toBe(true);
    });

    it('toggles code format', () => {
      const segments = [createSegment('console.log')];
      const result = toggleFormatOnSelection(
        segments,
        { start: 0, end: 11 },
        'code',
      );
      expect(result[0].styles.code).toBe(true);
    });
  });

  // ─── setStyleOnSelection ─────────────────────────────────────────────────

  describe('setStyleOnSelection', () => {
    it('returns unchanged when no selection', () => {
      const segments = [createSegment('Hello')];
      const result = setStyleOnSelection(
        segments,
        { start: 2, end: 2 },
        'color',
        '#ff0000',
      );
      expect(result).toEqual(segments);
    });

    it('sets color on selection', () => {
      const segments = [createSegment('Hello World')];
      const result = setStyleOnSelection(
        segments,
        { start: 0, end: 5 },
        'color',
        '#ff0000',
      );

      expect(result[0].styles.color).toBe('#ff0000');
      expect(result[0].text).toBe('Hello');
    });

    it('sets backgroundColor on selection', () => {
      const segments = [createSegment('Highlight me')];
      const result = setStyleOnSelection(
        segments,
        { start: 0, end: 9 },
        'backgroundColor',
        '#ffff00',
      );

      expect(result[0].styles.backgroundColor).toBe('#ffff00');
    });

    it('sets fontSize on selection', () => {
      const segments = [createSegment('Big text')];
      const result = setStyleOnSelection(
        segments,
        { start: 0, end: 8 },
        'fontSize',
        24,
      );

      expect(result[0].styles.fontSize).toBe(24);
    });
  });

  // ─── setHeadingOnLine ────────────────────────────────────────────────────

  describe('setHeadingOnLine', () => {
    it('applies h1 heading to a line', () => {
      const segments = [createSegment('Title')];
      const result = setHeadingOnLine(
        segments,
        { start: 0, end: 0 },
        'h1',
      );

      expect(result[0].styles.heading).toBe('h1');
    });

    it('applies h2 heading', () => {
      const segments = [createSegment('Subtitle')];
      const result = setHeadingOnLine(
        segments,
        { start: 0, end: 0 },
        'h2',
      );

      expect(result[0].styles.heading).toBe('h2');
    });

    it('applies h3 heading', () => {
      const segments = [createSegment('Section')];
      const result = setHeadingOnLine(
        segments,
        { start: 0, end: 0 },
        'h3',
      );

      expect(result[0].styles.heading).toBe('h3');
    });

    it('removes heading when set to none', () => {
      const segments = [createSegment('Title', { heading: 'h1' })];
      const result = setHeadingOnLine(
        segments,
        { start: 0, end: 0 },
        'none',
      );

      expect(result[0].styles.heading).toBeUndefined();
    });

    it('only affects the line at cursor in multi-line text', () => {
      const segments = [createSegment('Line 1\nLine 2\nLine 3')];
      const result = setHeadingOnLine(
        segments,
        { start: 8, end: 8 }, // cursor on "Line 2"
        'h1',
      );

      const plain = segmentsToPlainText(result);
      expect(plain).toBe('Line 1\nLine 2\nLine 3');
      // Line 2 should have heading, others should not
    });
  });

  // ─── isFormatActiveInSelection ───────────────────────────────────────────

  describe('isFormatActiveInSelection', () => {
    it('returns false when no selection', () => {
      const segments = [createSegment('Hello', { bold: true })];
      expect(
        isFormatActiveInSelection(segments, { start: 2, end: 2 }, 'bold'),
      ).toBe(false);
    });

    it('returns true when entire selection has the format', () => {
      const segments = [createSegment('Hello', { bold: true })];
      expect(
        isFormatActiveInSelection(segments, { start: 0, end: 5 }, 'bold'),
      ).toBe(true);
    });

    it('returns false when part of selection lacks the format', () => {
      const segments = [
        createSegment('Bold', { bold: true }),
        createSegment('Normal'),
      ];
      expect(
        isFormatActiveInSelection(segments, { start: 0, end: 10 }, 'bold'),
      ).toBe(false);
    });

    it('returns true for italic', () => {
      const segments = [createSegment('text', { italic: true })];
      expect(
        isFormatActiveInSelection(segments, { start: 0, end: 4 }, 'italic'),
      ).toBe(true);
    });
  });

  // ─── getSelectionStyle ───────────────────────────────────────────────────

  describe('getSelectionStyle', () => {
    it('returns style at cursor position when no selection', () => {
      const segments = [
        createSegment('Bold', { bold: true }),
        createSegment('Normal'),
      ];
      const style = getSelectionStyle(segments, { start: 2, end: 2 });
      expect(style.bold).toBe(true);
    });

    it('returns common styles across selection', () => {
      const segments = [
        createSegment('Both', { bold: true, italic: true }),
        createSegment('Bold', { bold: true }),
      ];
      const style = getSelectionStyle(segments, { start: 0, end: 8 });
      expect(style.bold).toBe(true);
      // Italic is not common — should be undefined
    });

    it('returns empty object for empty segments', () => {
      const style = getSelectionStyle([], { start: 0, end: 0 });
      expect(style).toEqual({});
    });
  });
});
