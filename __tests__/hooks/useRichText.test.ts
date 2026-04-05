import { renderHook, act } from '@testing-library/react-native';
import { useRichText } from '../../src/hooks/useRichText';
import { createSegment, segmentsToPlainText } from '../../src/utils/parser';
import type { StyledSegment } from '../../src/types';

describe('useRichText', () => {
  // ─── Initialization ─────────────────────────────────────────────────────

  describe('initialization', () => {
    it('initializes with empty segment', () => {
      const { result } = renderHook(() => useRichText());

      expect(result.current.state.segments).toHaveLength(1);
      expect(result.current.state.segments[0].text).toBe('');
      expect(result.current.state.selection).toEqual({ start: 0, end: 0 });
    });

    it('initializes with provided segments', () => {
      const initial: StyledSegment[] = [
        createSegment('Hello', { bold: true }),
        createSegment(' World'),
      ];

      const { result } = renderHook(() =>
        useRichText({ initialSegments: initial }),
      );

      expect(result.current.state.segments).toHaveLength(2);
      expect(segmentsToPlainText(result.current.state.segments)).toBe(
        'Hello World',
      );
    });
  });

  // ─── Text Changes ───────────────────────────────────────────────────────

  describe('handleTextChange', () => {
    it('updates segments when text changes', () => {
      const onChangeText = jest.fn();
      const { result } = renderHook(() =>
        useRichText({ onChangeText }),
      );

      act(() => {
        result.current.actions.handleTextChange('Hello');
      });

      expect(segmentsToPlainText(result.current.state.segments)).toBe(
        'Hello',
      );
      expect(onChangeText).toHaveBeenCalledWith('Hello');
    });

    it('calls onChangeSegments callback', () => {
      const onChangeSegments = jest.fn();
      const { result } = renderHook(() =>
        useRichText({ onChangeSegments }),
      );

      act(() => {
        result.current.actions.handleTextChange('Test');
      });

      expect(onChangeSegments).toHaveBeenCalled();
    });

    it('inherits selection styles when replacing selected text', () => {
      const { result } = renderHook(() =>
        useRichText({
          initialSegments: [
            createSegment('Bold', { bold: true }),
            createSegment(' plain'),
          ],
        }),
      );

      act(() => {
        result.current.actions.handleSelectionChange({ start: 0, end: 4 });
      });

      act(() => {
        result.current.actions.handleTextChange('X plain');
      });

      expect(result.current.state.segments[0].text).toBe('X');
      expect(result.current.state.segments[0].styles.bold).toBe(true);
    });
  });

  // ─── Selection Changes ──────────────────────────────────────────────────

  describe('handleSelectionChange', () => {
    it('updates selection state', () => {
      const { result } = renderHook(() => useRichText());

      act(() => {
        result.current.actions.handleTextChange('Hello World');
      });

      act(() => {
        result.current.actions.handleSelectionChange({ start: 0, end: 5 });
      });

      expect(result.current.state.selection).toEqual({
        start: 0,
        end: 5,
      });
    });

    it('updates active styles based on cursor position', () => {
      const initial: StyledSegment[] = [
        createSegment('Bold', { bold: true }),
        createSegment('Normal'),
      ];

      const { result } = renderHook(() =>
        useRichText({ initialSegments: initial }),
      );

      // Move cursor into bold segment
      act(() => {
        result.current.actions.handleSelectionChange({ start: 2, end: 2 });
      });

      expect(result.current.state.activeStyles.bold).toBe(true);
    });
  });

  // ─── Formatting ──────────────────────────────────────────────────────────

  describe('toggleFormat', () => {
    it('toggles active style when no selection', () => {
      const { result } = renderHook(() => useRichText());

      act(() => {
        result.current.actions.toggleFormat('bold');
      });

      expect(result.current.state.activeStyles.bold).toBe(true);

      act(() => {
        result.current.actions.toggleFormat('bold');
      });

      expect(result.current.state.activeStyles.bold).toBe(false);
    });

    it('applies format to selected text', () => {
      const { result } = renderHook(() =>
        useRichText({
          initialSegments: [createSegment('Hello World')],
        }),
      );

      // Select "Hello"
      act(() => {
        result.current.actions.handleSelectionChange({ start: 0, end: 5 });
      });

      // Apply bold
      act(() => {
        result.current.actions.toggleFormat('bold');
      });

      const segments = result.current.state.segments;
      expect(segments[0].text).toBe('Hello');
      expect(segments[0].styles.bold).toBe(true);
    });

    it('exposes selection-aware formatting helpers', () => {
      const { result } = renderHook(() =>
        useRichText({
          initialSegments: [createSegment('Bold', { bold: true })],
        }),
      );

      act(() => {
        result.current.actions.handleSelectionChange({ start: 0, end: 4 });
      });

      expect(result.current.actions.isFormatActive('bold')).toBe(true);
      expect(result.current.actions.getSelectionStyle().bold).toBe(true);
    });
  });

  describe('setColor', () => {
    it('sets text color', () => {
      const { result } = renderHook(() => useRichText());

      act(() => {
        result.current.actions.setColor('#ff0000');
      });

      expect(result.current.state.activeStyles.color).toBe('#ff0000');
    });
  });

  describe('setBackgroundColor', () => {
    it('sets background color', () => {
      const { result } = renderHook(() => useRichText());

      act(() => {
        result.current.actions.setBackgroundColor('#ffff00');
      });

      expect(result.current.state.activeStyles.backgroundColor).toBe(
        '#ffff00',
      );
    });
  });

  describe('setFontSize', () => {
    it('sets font size', () => {
      const { result } = renderHook(() => useRichText());

      act(() => {
        result.current.actions.setFontSize(24);
      });

      expect(result.current.state.activeStyles.fontSize).toBe(24);
    });
  });

  describe('setHeading', () => {
    it('applies heading to current line', () => {
      const { result } = renderHook(() =>
        useRichText({
          initialSegments: [createSegment('Title')],
        }),
      );

      act(() => {
        result.current.actions.setHeading('h1');
      });

      expect(result.current.state.segments[0].styles.heading).toBe('h1');
    });
  });

  // ─── Export / Import ─────────────────────────────────────────────────────

  describe('getPlainText', () => {
    it('returns plain text from segments', () => {
      const { result } = renderHook(() =>
        useRichText({
          initialSegments: [
            createSegment('Hello', { bold: true }),
            createSegment(' World'),
          ],
        }),
      );

      expect(result.current.actions.getPlainText()).toBe('Hello World');
    });
  });

  describe('exportJSON', () => {
    it('exports a deep copy of segments', () => {
      const initial = [createSegment('Test', { bold: true })];
      const { result } = renderHook(() =>
        useRichText({ initialSegments: initial }),
      );

      const exported = result.current.actions.exportJSON();
      expect(exported).toEqual(initial);

      // Verify it's a deep copy
      exported[0].text = 'Modified';
      expect(result.current.state.segments[0].text).toBe('Test');
    });
  });

  describe('importJSON', () => {
    it('replaces segments with imported data', () => {
      const { result } = renderHook(() => useRichText());

      const newSegments: StyledSegment[] = [
        createSegment('Imported', { italic: true }),
        createSegment(' Text'),
      ];

      act(() => {
        result.current.actions.importJSON(newSegments);
      });

      expect(segmentsToPlainText(result.current.state.segments)).toBe(
        'Imported Text',
      );
    });

    it('creates empty segment when importing empty array', () => {
      const { result } = renderHook(() => useRichText());

      act(() => {
        result.current.actions.importJSON([]);
      });

      expect(result.current.state.segments).toHaveLength(1);
      expect(result.current.state.segments[0].text).toBe('');
    });
  });

  describe('clear', () => {
    it('resets to empty state', () => {
      const { result } = renderHook(() =>
        useRichText({
          initialSegments: [createSegment('Some content', { bold: true })],
        }),
      );

      act(() => {
        result.current.actions.clear();
      });

      expect(result.current.state.segments).toHaveLength(1);
      expect(result.current.state.segments[0].text).toBe('');
      expect(result.current.state.activeStyles.bold).toBeFalsy();
    });
  });
});
