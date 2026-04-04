import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Toolbar } from '@/components/Toolbar';
import type { RichTextActions, RichTextState, ToolbarItem } from '@/types';
import { EMPTY_FORMAT_STYLE } from '@/constants/defaultStyles';

const mockActions: RichTextActions = {
  toggleFormat: jest.fn(),
  setStyleProperty: jest.fn(),
  setHeading: jest.fn(),
  setColor: jest.fn(),
  setBackgroundColor: jest.fn(),
  setFontSize: jest.fn(),
  handleTextChange: jest.fn(),
  handleSelectionChange: jest.fn(),
  getPlainText: jest.fn(() => ''),
  exportJSON: jest.fn(() => []),
  importJSON: jest.fn(),
  clear: jest.fn(),
};

const mockState: RichTextState = {
  segments: [{ text: '', styles: {} }],
  selection: { start: 0, end: 0 },
  activeStyles: { ...EMPTY_FORMAT_STYLE },
};

describe('Toolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(
      <Toolbar actions={mockActions} state={mockState} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders default toolbar items', () => {
    const { getByText } = render(
      <Toolbar actions={mockActions} state={mockState} />,
    );

    expect(getByText('B')).toBeTruthy();
    expect(getByText('I')).toBeTruthy();
    expect(getByText('U')).toBeTruthy();
    expect(getByText('S')).toBeTruthy();
    expect(getByText('<>')).toBeTruthy();
    expect(getByText('H1')).toBeTruthy();
  });

  it('calls toggleFormat when format button is pressed', () => {
    const { getByText } = render(
      <Toolbar actions={mockActions} state={mockState} />,
    );

    fireEvent.press(getByText('B'));
    expect(mockActions.toggleFormat).toHaveBeenCalledWith('bold');

    fireEvent.press(getByText('I'));
    expect(mockActions.toggleFormat).toHaveBeenCalledWith('italic');
  });

  it('calls setHeading when heading button is pressed', () => {
    const { getByText } = render(
      <Toolbar actions={mockActions} state={mockState} />,
    );

    fireEvent.press(getByText('H1'));
    expect(mockActions.setHeading).toHaveBeenCalledWith('h1');
  });

  it('renders custom toolbar items', () => {
    const customItems: ToolbarItem[] = [
      { id: 'custom1', label: '🎨', onPress: jest.fn() },
      { id: 'custom2', label: '📝', onPress: jest.fn() },
    ];

    const { getByText } = render(
      <Toolbar
        actions={mockActions}
        state={mockState}
        items={customItems}
      />,
    );

    expect(getByText('🎨')).toBeTruthy();
    expect(getByText('📝')).toBeTruthy();
  });

  it('calls custom onPress for custom items', () => {
    const onPress = jest.fn();
    const customItems: ToolbarItem[] = [
      { id: 'custom', label: 'Custom', onPress },
    ];

    const { getByText } = render(
      <Toolbar
        actions={mockActions}
        state={mockState}
        items={customItems}
      />,
    );

    fireEvent.press(getByText('Custom'));
    expect(onPress).toHaveBeenCalled();
  });

  it('returns null when visible is false', () => {
    const { toJSON } = render(
      <Toolbar
        actions={mockActions}
        state={mockState}
        visible={false}
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it('uses custom renderToolbar', () => {
    const renderToolbar = jest.fn(() => <Text>Custom Toolbar</Text>);

    const { getByText } = render(
      <Toolbar
        actions={mockActions}
        state={mockState}
        renderToolbar={renderToolbar}
      />,
    );

    expect(renderToolbar).toHaveBeenCalled();
    expect(getByText('Custom Toolbar')).toBeTruthy();
  });

  it('shows active state for enabled formats', () => {
    const activeState: RichTextState = {
      ...mockState,
      activeStyles: { bold: true, italic: true },
    };

    const { toJSON } = render(
      <Toolbar actions={mockActions} state={activeState} />,
    );
    // The toolbar should render with active buttons
    expect(toJSON()).toBeTruthy();
  });
});
