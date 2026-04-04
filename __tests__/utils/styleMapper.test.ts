import {
  formatStyleToTextStyle,
  segmentToTextStyle,
  segmentsToTextStyles,
} from '@/utils/styleMapper';
import { createSegment } from '@/utils/parser';
import { DEFAULT_THEME } from '@/constants/defaultStyles';
import type { FormatStyle, RichTextTheme } from '@/types';

describe('styleMapper', () => {
  // ─── formatStyleToTextStyle ──────────────────────────────────────────────

  describe('formatStyleToTextStyle', () => {
    it('returns empty style for empty format', () => {
      const style = formatStyleToTextStyle({});
      expect(Object.keys(style).length).toBe(0);
    });

    it('maps bold to fontWeight bold', () => {
      const style = formatStyleToTextStyle({ bold: true });
      expect(style.fontWeight).toBe('bold');
    });

    it('maps italic to fontStyle italic', () => {
      const style = formatStyleToTextStyle({ italic: true });
      expect(style.fontStyle).toBe('italic');
    });

    it('maps underline to textDecorationLine', () => {
      const style = formatStyleToTextStyle({ underline: true });
      expect(style.textDecorationLine).toBe('underline');
    });

    it('maps strikethrough to textDecorationLine', () => {
      const style = formatStyleToTextStyle({ strikethrough: true });
      expect(style.textDecorationLine).toBe('line-through');
    });

    it('combines underline and strikethrough', () => {
      const style = formatStyleToTextStyle({
        underline: true,
        strikethrough: true,
      });
      expect(style.textDecorationLine).toBe('underline line-through');
    });

    it('maps code format with monospace font', () => {
      const style = formatStyleToTextStyle({ code: true });
      expect(style.fontFamily).toBe('monospace');
    });

    it('maps text color', () => {
      const style = formatStyleToTextStyle({ color: '#ff0000' });
      expect(style.color).toBe('#ff0000');
    });

    it('maps background color', () => {
      const style = formatStyleToTextStyle({
        backgroundColor: '#ffff00',
      });
      expect(style.backgroundColor).toBe('#ffff00');
    });

    it('maps fontSize', () => {
      const style = formatStyleToTextStyle({ fontSize: 24 });
      expect(style.fontSize).toBe(24);
    });

    it('maps heading h1', () => {
      const style = formatStyleToTextStyle({ heading: 'h1' });
      expect(style.fontSize).toBe(32);
      expect(style.fontWeight).toBe('bold');
    });

    it('maps heading h2', () => {
      const style = formatStyleToTextStyle({ heading: 'h2' });
      expect(style.fontSize).toBe(24);
      expect(style.fontWeight).toBe('bold');
    });

    it('maps heading h3', () => {
      const style = formatStyleToTextStyle({ heading: 'h3' });
      expect(style.fontSize).toBe(20);
      expect(style.fontWeight).toBe('bold');
    });

    it('does not apply heading styles for none', () => {
      const style = formatStyleToTextStyle({ heading: 'none' });
      expect(style.fontSize).toBeUndefined();
      expect(style.fontWeight).toBeUndefined();
    });

    it('applies multiple formats together', () => {
      const style = formatStyleToTextStyle({
        bold: true,
        italic: true,
        underline: true,
        color: '#333',
        fontSize: 20,
      });
      expect(style.fontWeight).toBe('bold');
      expect(style.fontStyle).toBe('italic');
      expect(style.textDecorationLine).toBe('underline');
      expect(style.color).toBe('#333');
      expect(style.fontSize).toBe(20);
    });

    it('uses custom theme codeStyle', () => {
      const customTheme: RichTextTheme = {
        codeStyle: {
          fontFamily: 'Courier',
          backgroundColor: '#000',
        },
      };
      const style = formatStyleToTextStyle({ code: true }, customTheme);
      expect(style.fontFamily).toBe('Courier');
      expect(style.backgroundColor).toBe('#000');
    });
  });

  // ─── segmentToTextStyle ──────────────────────────────────────────────────

  describe('segmentToTextStyle', () => {
    it('combines base style with format style', () => {
      const segment = createSegment('test', { bold: true });
      const style = segmentToTextStyle(segment);

      // Should have base styles
      expect(style.fontSize).toBe(DEFAULT_THEME.baseTextStyle?.fontSize);
      expect(style.lineHeight).toBe(DEFAULT_THEME.baseTextStyle?.lineHeight);
      // And format styles
      expect(style.fontWeight).toBe('bold');
    });

    it('format styles override base styles when conflicting', () => {
      const segment = createSegment('test', { fontSize: 32 });
      const style = segmentToTextStyle(segment);

      // fontSize should come from format, not base
      expect(style.fontSize).toBe(32);
    });

    it('uses custom theme base style', () => {
      const customTheme: RichTextTheme = {
        baseTextStyle: {
          fontSize: 20,
          color: '#000',
        },
      };
      const segment = createSegment('test', {});
      const style = segmentToTextStyle(segment, customTheme);

      expect(style.fontSize).toBe(20);
      expect(style.color).toBe('#000');
    });
  });

  // ─── segmentsToTextStyles ────────────────────────────────────────────────

  describe('segmentsToTextStyles', () => {
    it('maps multiple segments to styles', () => {
      const segments = [
        createSegment('Bold', { bold: true }),
        createSegment('Normal'),
        createSegment('Italic', { italic: true }),
      ];

      const styles = segmentsToTextStyles(segments);
      expect(styles).toHaveLength(3);
      expect(styles[0].fontWeight).toBe('bold');
      expect(styles[1].fontWeight).toBeUndefined();
      expect(styles[2].fontStyle).toBe('italic');
    });

    it('returns empty array for empty segments', () => {
      expect(segmentsToTextStyles([])).toHaveLength(0);
    });
  });
});
