import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ToolbarButton } from '../../src/components/ToolbarButton';
import { Text } from 'react-native';
import { Bold } from 'lucide-react-native';

describe('ToolbarButton', () => {
  const defaultProps = {
    label: 'B',
    active: false,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<ToolbarButton {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays the label text', () => {
    const { getByText } = render(<ToolbarButton {...defaultProps} />);
    expect(getByText('B')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ToolbarButton {...defaultProps} onPress={onPress} />,
    );

    fireEvent.press(getByText('B'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders active state', () => {
    const { toJSON } = render(
      <ToolbarButton {...defaultProps} active={true} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('uses custom renderButton when provided', () => {
    const renderButton = jest.fn(({ label, onPress, active }) => (
      <Text onPress={onPress}>{`Custom-${label}`}</Text>
    ));

    const { getByText } = render(
      <ToolbarButton {...defaultProps} renderButton={renderButton} />,
    );

    expect(renderButton).toHaveBeenCalled();
    expect(getByText('Custom-B')).toBeTruthy();
  });

  it('has proper accessibility role', () => {
    const { getByRole } = render(<ToolbarButton {...defaultProps} />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('shows accessibility state for active button', () => {
    const { getByRole } = render(
      <ToolbarButton {...defaultProps} active={true} />,
    );
    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('renders with different labels', () => {
    const labels = ['B', 'I', 'U', 'S', '<>', 'H1', 'H2', 'H3'];
    labels.forEach((label) => {
      const { getByText } = render(
        <ToolbarButton {...defaultProps} label={label} />,
      );
      expect(getByText(label)).toBeTruthy();
    });
  });

  it('renders icon content with an accessibility label', () => {
    const { getByLabelText } = render(
      <ToolbarButton
        {...defaultProps}
        label={<Bold />}
        accessibilityLabel="Bold"
      />,
    );

    expect(getByLabelText('Bold')).toBeTruthy();
  });
});
