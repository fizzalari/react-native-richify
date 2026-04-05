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

    it('preserves active styles while typing in the middle of text', () => {
      const { result } = renderHook(() =>
        useRichText({
          initialSegments: [createSegment('HelloWorld')],
        }),
      );

      act(() => {
        result.current.actions.handleSelectionChange({ start: 5, end: 5 });
      });

      act(() => {
        result.current.actions.toggleFormat('bold');
      });

      act(() => {
        result.current.actions.handleSelectionChange({ start: 6, end: 6 });
        result.current.actions.handleTextChange('HelloaWorld');
      });

      act(() => {
        result.current.actions.handleSelectionChange({ start: 7, end: 7 });
        result.current.actions.handleTextChange('HelloabWorld');
      });

      expect(result.current.actions.getOutput('markdown')).toBe(
        'Hello**ab**World',
      );
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

    it('serializes output as markdown or HTML', () => {
      const { result } = renderHook(() =>
        useRichText({
          initialSegments: [createSegment('Title', { heading: 'h1' })],
        }),
      );

      expect(result.current.actions.getOutput('markdown')).toBe('# Title');
      expect(result.current.actions.getOutput('html')).toBe('<h1>Title</h1>');
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

    it('toggles an applied heading off when the same button is pressed again', () => {
      const { result } = renderHook(() =>
        useRichText({
          initialSegments: [createSegment('Title', { heading: 'h1' })],
        }),
      );

      act(() => {
        result.current.actions.handleSelectionChange({ start: 0, end: 0 });
        result.current.actions.setHeading('h1');
      });

      expect(result.current.state.segments[0].styles.heading).toBeUndefined();
    });

    it('stores heading as an active style for future typing', () => {
      const { result } = renderHook(() => useRichText());

      act(() => {
        result.current.actions.setHeading('h3');
      });

      act(() => {
        result.current.actions.handleSelectionChange({ start: 1, end: 1 });
        result.current.actions.handleTextChange('A');
      });

      expect(result.current.actions.getOutput('markdown')).toBe('### A');
    });
  });

  describe('setListType', () => {
    it('applies list formatting to the current line', () => {
      const { result } = renderHook(() =>
        useRichText({
          initialSegments: [createSegment('First item')],
        }),
      );

      act(() => {
        result.current.actions.setListType('bullet');
      });

      expect(result.current.actions.getOutput('markdown')).toBe('- First item');
    });
  });

  describe('setTextAlign', () => {
    it('serializes alignment through markdown output using html fallback', () => {
      const { result } = renderHook(() =>
        useRichText({
          initialSegments: [createSegment('Centered copy')],
        }),
      );

      act(() => {
        result.current.actions.setTextAlign('center');
      });

      expect(result.current.actions.getOutput('markdown')).toBe(
        '<p style="text-align: center">Centered copy</p>',
      );
    });
  });

  describe('setLink', () => {
    it('applies a link to selected text', () => {
      const { result } = renderHook(() =>
        useRichText({
          initialSegments: [createSegment('OpenAI')],
        }),
      );

      act(() => {
        result.current.actions.handleSelectionChange({ start: 0, end: 6 });
      });

      act(() => {
        result.current.actions.setLink('https://openai.com');
      });

      expect(result.current.actions.getOutput('markdown')).toBe(
        '[OpenAI](https://openai.com)',
      );
    });
  });

  describe('insertImage', () => {
    it('inserts an image placeholder and serializes it', () => {
      const { result } = renderHook(() => useRichText());

      act(() => {
        result.current.actions.insertImage('https://cdn.test/photo.png', {
          alt: 'Photo',
        });
      });

      expect(result.current.actions.getPlainText()).toBe('[Image: Photo]');
      expect(result.current.actions.getOutput('markdown')).toBe(
        '![Photo](https://cdn.test/photo.png)',
      );
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
