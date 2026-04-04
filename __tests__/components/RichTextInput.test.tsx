import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RichTextInput } from '@/components/RichTextInput';
import { createSegment } from '@/utils/parser';
import type { StyledSegment } from '@/types';

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
    const { getByText } = render(<RichTextInput />);
    // Default toolbar should have Bold button
    expect(getByText('B')).toBeTruthy();
  });

  it('hides toolbar when showToolbar is false', () => {
    const { queryByText } = render(
      <RichTextInput showToolbar={false} />,
    );
    expect(queryByText('B')).toBeNull();
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
