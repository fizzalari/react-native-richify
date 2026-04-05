import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import { Toolbar } from '../../src/components/Toolbar';
import type { RichTextActions, RichTextState, ToolbarItem } from '../../src/types';
import { EMPTY_FORMAT_STYLE } from '../../src/constants/defaultStyles';

const mockActions: RichTextActions = {
  toggleFormat: jest.fn(),
  setStyleProperty: jest.fn(),
  setHeading: jest.fn(),
  setListType: jest.fn(),
  setTextAlign: jest.fn(),
  setLink: jest.fn(),
  insertImage: jest.fn(),
  setColor: jest.fn(),
  setBackgroundColor: jest.fn(),
  setFontSize: jest.fn(),
  handleTextChange: jest.fn(),
  handleSelectionChange: jest.fn(),
  isFormatActive: jest.fn(() => false),
  getSelectionStyle: jest.fn(() => ({ ...EMPTY_FORMAT_STYLE })),
  getOutput: jest.fn(() => ''),
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
    mockActions.isFormatActive = jest.fn(() => false);
    mockActions.getSelectionStyle = jest.fn(() => ({ ...EMPTY_FORMAT_STYLE }));
  });

  it('renders without crashing', () => {
    const { toJSON } = render(
      <Toolbar actions={mockActions} state={mockState} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders default toolbar items', () => {
    const { getByLabelText, getByText } = render(
      <Toolbar actions={mockActions} state={mockState} />,
    );

    expect(getByLabelText('Bold')).toBeTruthy();
    expect(getByLabelText('Italic')).toBeTruthy();
    expect(getByLabelText('Underline')).toBeTruthy();
    expect(getByLabelText('Strikethrough')).toBeTruthy();
    expect(getByLabelText('Code')).toBeTruthy();
    expect(getByLabelText('Heading 1')).toBeTruthy();
    expect(getByLabelText('Bullet list')).toBeTruthy();
    expect(getByLabelText('Ordered list')).toBeTruthy();
    expect(getByLabelText('Link')).toBeTruthy();
    expect(getByLabelText('Insert image')).toBeTruthy();
    expect(getByLabelText('Align left')).toBeTruthy();
    expect(getByLabelText('Align center')).toBeTruthy();
    expect(getByLabelText('Align right')).toBeTruthy();
    expect(getByText('MD')).toBeTruthy();
  });

  it('calls toggleFormat when format button is pressed', () => {
    const { getByLabelText } = render(
      <Toolbar actions={mockActions} state={mockState} />,
    );

    fireEvent.press(getByLabelText('Bold'));
    expect(mockActions.toggleFormat).toHaveBeenCalledWith('bold');

    fireEvent.press(getByLabelText('Italic'));
    expect(mockActions.toggleFormat).toHaveBeenCalledWith('italic');
  });

  it('calls setHeading when heading button is pressed', () => {
    const { getByLabelText } = render(
      <Toolbar actions={mockActions} state={mockState} />,
    );

    fireEvent.press(getByLabelText('Heading 1'));
    expect(mockActions.setHeading).toHaveBeenCalledWith('h1');
  });

  it('calls image request handler when the image button is pressed', () => {
    const onRequestImage = jest.fn();
    const { getByLabelText } = render(
      <Toolbar
        actions={mockActions}
        state={mockState}
        onRequestImage={onRequestImage}
      />,
    );

    fireEvent.press(getByLabelText('Insert image'));
    expect(onRequestImage).toHaveBeenCalled();
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
    mockActions.isFormatActive = jest.fn(
      (format) => format === 'bold' || format === 'italic',
    );
    mockActions.getSelectionStyle = jest.fn(() => ({ heading: 'h1' }));

    const { toJSON } = render(
      <Toolbar actions={mockActions} state={mockState} />,
    );
    // The toolbar should render with active buttons
    expect(toJSON()).toBeTruthy();
  });

  it('derives active state from selection-aware editor actions', () => {
    mockActions.isFormatActive = jest.fn((format) => format === 'bold');
    mockActions.getSelectionStyle = jest.fn(() => ({ heading: 'h2' }));

    const { UNSAFE_getAllByType } = render(
      <Toolbar actions={mockActions} state={mockState} />,
    );

    const selectedButtons = UNSAFE_getAllByType(TouchableOpacity).filter(
      (button) => button.props.accessibilityState?.selected,
    );

    expect(mockActions.isFormatActive).toHaveBeenCalledWith('bold');
    expect(mockActions.getSelectionStyle).toHaveBeenCalled();
    expect(selectedButtons).toHaveLength(4);
  });

  it('routes output format and preview mode buttons through toolbar callbacks', () => {
    const onOutputFormatChange = jest.fn();
    const onOutputPreviewModeChange = jest.fn();
    const { getByText } = render(
      <Toolbar
        actions={mockActions}
        state={mockState}
        onOutputFormatChange={onOutputFormatChange}
        onOutputPreviewModeChange={onOutputPreviewModeChange}
      />,
    );

    fireEvent.press(getByText('HTML'));
    fireEvent.press(getByText('View'));

    expect(onOutputFormatChange).toHaveBeenCalledWith('html');
    expect(onOutputPreviewModeChange).toHaveBeenCalledWith('rendered');
  });
});
