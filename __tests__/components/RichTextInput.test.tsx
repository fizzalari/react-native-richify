import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RichTextInput } from '../../src/components/RichTextInput';
import { createSegment } from '../../src/utils/parser';
import type { StyledSegment } from '../../src/types';

describe('RichTextInput', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<RichTextInput />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with placeholder', () => {
    const { getByPlaceholderText } = render(
      <RichTextInput placeholder="Type here..." />,
    );
    expect(getByPlaceholderText('Type here...')).toBeTruthy();
  });

  it('renders with initial segments', () => {
    const initial: StyledSegment[] = [
      createSegment('Hello', { bold: true }),
      createSegment(' World'),
    ];
    const { toJSON } = render(
      <RichTextInput initialSegments={initial} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders toolbar by default', () => {
    const { getByLabelText } = render(<RichTextInput />);
    expect(getByLabelText('Bold')).toBeTruthy();
  });

  it('hides toolbar when showToolbar is false', () => {
    const { queryByLabelText } = render(
      <RichTextInput showToolbar={false} />,
    );
    expect(queryByLabelText('Bold')).toBeNull();
  });

  it('handles text input', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <RichTextInput
        placeholder="Type..."
        onChangeText={onChangeText}
      />,
    );

    fireEvent.changeText(getByPlaceholderText('Type...'), 'Hello');
    expect(onChangeText).toHaveBeenCalledWith('Hello');
  });

  it('handles onChangeSegments callback', () => {
    const onChangeSegments = jest.fn();
    const { getByPlaceholderText } = render(
      <RichTextInput
        placeholder="Type..."
        onChangeSegments={onChangeSegments}
      />,
    );

    fireEvent.changeText(getByPlaceholderText('Type...'), 'Test');
    expect(onChangeSegments).toHaveBeenCalled();
  });

  it('renders with custom theme', () => {
    const { toJSON } = render(
      <RichTextInput
        theme={{
          colors: {
            primary: '#00ff00',
            background: '#111',
            text: '#fff',
          },
        }}
      />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders toolbar at bottom when toolbarPosition is bottom', () => {
    const { toJSON } = render(
      <RichTextInput toolbarPosition="bottom" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('supports multiline by default', () => {
    const { getByPlaceholderText } = render(
      <RichTextInput placeholder="Type..." />,
    );
    const input = getByPlaceholderText('Type...');
    expect(input.props.multiline).toBe(true);
  });

  it('renders with custom toolbar items', () => {
    const { getByText } = render(
      <RichTextInput
        toolbarItems={[
          { id: 'emoji', label: '😊' },
          { id: 'link', label: '🔗' },
        ]}
      />,
    );
    expect(getByText('😊')).toBeTruthy();
    expect(getByText('🔗')).toBeTruthy();
  });

  it('calls onReady with actions', () => {
    const onReady = jest.fn();
    render(<RichTextInput onReady={onReady} />);

    expect(onReady).toHaveBeenCalled();
    const actions = onReady.mock.calls[0][0];
    expect(actions.toggleFormat).toBeDefined();
    expect(actions.handleTextChange).toBeDefined();
    expect(actions.getOutput).toBeDefined();
    expect(actions.exportJSON).toBeDefined();
    expect(actions.clear).toBeDefined();
  });

  it('respects editable prop', () => {
    const { getByPlaceholderText } = render(
      <RichTextInput placeholder="Type..." editable={false} />,
    );
    const input = getByPlaceholderText('Type...');
    expect(input.props.editable).toBe(false);
  });

  it('respects maxLength prop', () => {
    const { getByPlaceholderText } = render(
      <RichTextInput placeholder="Type..." maxLength={100} />,
    );
    const input = getByPlaceholderText('Type...');
    expect(input.props.maxLength).toBe(100);
  });

  it('keeps caller text input styles on the visible input', () => {
    const { getByPlaceholderText } = render(
      <RichTextInput
        placeholder="Type..."
        textInputProps={{ style: { letterSpacing: 2 } }}
      />,
    );

    const input = getByPlaceholderText('Type...');
    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ letterSpacing: 2 }),
        expect.objectContaining({ color: expect.any(String) }),
      ]),
    );
  });

  it('only enables internal scrolling when maxHeight is set', () => {
    const { getByPlaceholderText, rerender } = render(
      <RichTextInput placeholder="Type..." />,
    );

    expect(getByPlaceholderText('Type...').props.scrollEnabled).toBe(false);

    rerender(<RichTextInput placeholder="Type..." maxHeight={300} />);
    const input = getByPlaceholderText('Type...');
    fireEvent(input, 'contentSizeChange', {
      nativeEvent: { contentSize: { height: 420, width: 200 } },
    });

    expect(getByPlaceholderText('Type...').props.scrollEnabled).toBe(true);
  });

  it('shows markdown output below the input as content changes', () => {
    const { getByPlaceholderText, getByText } = render(
      <RichTextInput placeholder="Type..." />,
    );

    fireEvent.changeText(getByPlaceholderText('Type...'), 'Hello');

    expect(getByText('Markdown output')).toBeTruthy();
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders HTML output when requested', () => {
    const { getByText } = render(
      <RichTextInput
        outputFormat="html"
        initialSegments={[createSegment('Title', { heading: 'h1' })]}
      />,
    );

    expect(getByText('HTML output')).toBeTruthy();
    expect(getByText('<h1>Title</h1>')).toBeTruthy();
  });

  it('hides the output panel when showOutputPreview is false', () => {
    const { queryByText } = render(
      <RichTextInput
        showOutputPreview={false}
        initialSegments={[createSegment('Hello')]}
      />,
    );

    expect(queryByText('Markdown output')).toBeNull();
  });

  it('switches between markdown and html output from the toolbar', () => {
    const { getByPlaceholderText, getByText } = render(
      <RichTextInput placeholder="Type..." />,
    );

    fireEvent.changeText(getByPlaceholderText('Type...'), 'Hello');
    fireEvent.press(getByText('HTML'));

    expect(getByText('HTML output')).toBeTruthy();
    expect(getByText('<p>Hello</p>')).toBeTruthy();
  });

  it('switches between raw output and rendered preview from the toolbar', () => {
    const { getByText, queryByText } = render(
      <RichTextInput
        initialSegments={[createSegment('Title', { heading: 'h1' })]}
      />,
    );

    expect(getByText('# Title')).toBeTruthy();

    fireEvent.press(getByText('View'));

    expect(getByText('Markdown preview')).toBeTruthy();
    expect(queryByText('# Title')).toBeNull();
    expect(getByText('Title')).toBeTruthy();
  });

  it('grows the input height before maxHeight is reached', () => {
    const { getByPlaceholderText } = render(
      <RichTextInput placeholder="Type..." minHeight={120} />,
    );

    const input = getByPlaceholderText('Type...');
    fireEvent(input, 'contentSizeChange', {
      nativeEvent: { contentSize: { height: 220, width: 200 } },
    });

    expect(input.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ height: 220 })]),
    );
  });

  it('renders with minHeight', () => {
    const { toJSON } = render(
      <RichTextInput minHeight={200} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with maxHeight', () => {
    const { toJSON } = render(
      <RichTextInput maxHeight={500} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
