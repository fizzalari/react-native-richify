import { renderHook, act } from '@testing-library/react-native';
import { useFormatting } from '@/hooks/useFormatting';
import { createSegment } from '@/utils/parser';
import type { StyledSegment, FormatStyle, SelectionRange } from '@/types';
import { EMPTY_FORMAT_STYLE } from '@/constants/defaultStyles';

function createFormattingHook(overrides: {
  segments?: StyledSegment[];
  selection?: SelectionRange;
  activeStyles?: FormatStyle;
} = {}) {
  const onSegmentsChange = jest.fn();
  const onActiveStylesChange = jest.fn();

  const segments = overrides.segments ?? [createSegment('Hello World')];
  const selection = overrides.selection ?? { start: 0, end: 0 };
  const activeStyles = overrides.activeStyles ?? { ...EMPTY_FORMAT_STYLE };

  return {
    hook: renderHook(() =>
      useFormatting({
        segments,
        selection,
        activeStyles,
        onSegmentsChange,
        onActiveStylesChange,
      }),
    ),
    onSegmentsChange,
    onActiveStylesChange,
  };
}

describe('useFormatting', () => {
  describe('toggleFormat', () => {
    it('toggles active styles when no selection', () => {
      const { hook, onActiveStylesChange } = createFormattingHook();

      act(() => {
        hook.result.current.toggleFormat('bold');
      });

      expect(onActiveStylesChange).toHaveBeenCalledWith(
        expect.objectContaining({ bold: true }),
      );
    });

    it('applies format to selected text', () => {
      const { hook, onSegmentsChange } = createFormattingHook({
        selection: { start: 0, end: 5 },
      });

      act(() => {
        hook.result.current.toggleFormat('bold');
      });

      expect(onSegmentsChange).toHaveBeenCalled();
      const newSegments = onSegmentsChange.mock.calls[0][0];
      expect(newSegments[0].styles.bold).toBe(true);
      expect(newSegments[0].text).toBe('Hello');
    });
  });

  describe('setStyleProperty', () => {
    it('updates active styles when no selection', () => {
      const { hook, onActiveStylesChange } = createFormattingHook();

      act(() => {
        hook.result.current.setStyleProperty('color', '#ff0000');
      });

      expect(onActiveStylesChange).toHaveBeenCalledWith(
        expect.objectContaining({ color: '#ff0000' }),
      );
    });

    it('applies style to selection', () => {
      const { hook, onSegmentsChange } = createFormattingHook({
        selection: { start: 0, end: 5 },
      });

      act(() => {
        hook.result.current.setStyleProperty('color', '#00ff00');
      });

      expect(onSegmentsChange).toHaveBeenCalled();
    });
  });

  describe('setColor', () => {
    it('calls setStyleProperty with color', () => {
      const { hook, onActiveStylesChange } = createFormattingHook();

      act(() => {
        hook.result.current.setColor('#333');
      });

      expect(onActiveStylesChange).toHaveBeenCalledWith(
        expect.objectContaining({ color: '#333' }),
      );
    });
  });

  describe('setBackgroundColor', () => {
    it('calls setStyleProperty with backgroundColor', () => {
      const { hook, onActiveStylesChange } = createFormattingHook();

      act(() => {
        hook.result.current.setBackgroundColor('#ffff00');
      });

      expect(onActiveStylesChange).toHaveBeenCalledWith(
        expect.objectContaining({ backgroundColor: '#ffff00' }),
      );
    });
  });

  describe('setFontSize', () => {
    it('calls setStyleProperty with fontSize', () => {
      const { hook, onActiveStylesChange } = createFormattingHook();

      act(() => {
        hook.result.current.setFontSize(24);
      });

      expect(onActiveStylesChange).toHaveBeenCalledWith(
        expect.objectContaining({ fontSize: 24 }),
      );
    });
  });

  describe('setHeading', () => {
    it('applies heading to current line', () => {
      const { hook, onSegmentsChange } = createFormattingHook();

      act(() => {
        hook.result.current.setHeading('h1');
      });

      expect(onSegmentsChange).toHaveBeenCalled();
    });
  });

  describe('isFormatActive', () => {
    it('returns active style value when no selection', () => {
      const { hook } = createFormattingHook({
        activeStyles: { bold: true },
      });

      expect(hook.result.current.isFormatActive('bold')).toBe(true);
      expect(hook.result.current.isFormatActive('italic')).toBe(false);
    });

    it('checks selection format when text is selected', () => {
      const { hook } = createFormattingHook({
        segments: [createSegment('Bold', { bold: true })],
        selection: { start: 0, end: 4 },
      });

      expect(hook.result.current.isFormatActive('bold')).toBe(true);
    });
  });

  describe('currentSelectionStyle', () => {
    it('returns active styles when no selection', () => {
      const activeStyles = { bold: true, color: '#f00' };
      const { hook } = createFormattingHook({ activeStyles });

      const style = hook.result.current.currentSelectionStyle();
      expect(style).toEqual(activeStyles);
    });

    it('returns computed style when text is selected', () => {
      const { hook } = createFormattingHook({
        segments: [createSegment('Bold', { bold: true, italic: true })],
        selection: { start: 0, end: 4 },
      });

      const style = hook.result.current.currentSelectionStyle();
      expect(style.bold).toBe(true);
      expect(style.italic).toBe(true);
    });
  });
});
