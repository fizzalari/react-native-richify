import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { ToolbarButtonProps } from '@/types';
import { DEFAULT_THEME } from '@/constants/defaultStyles';

/**
 * A single toolbar button that toggles a formatting option.
 * Supports custom rendering via the `renderButton` prop.
 */
export const ToolbarButton: React.FC<ToolbarButtonProps> = React.memo(
  ({ label, active, onPress, theme, renderButton }) => {
    // Custom render
    if (renderButton) {
      return renderButton({ active, onPress, label });
    }

    const resolvedTheme = theme ?? DEFAULT_THEME;

    const buttonStyle = [
      resolvedTheme.toolbarButtonStyle ?? DEFAULT_THEME.toolbarButtonStyle,
      active &&
        (resolvedTheme.toolbarButtonActiveStyle ??
          DEFAULT_THEME.toolbarButtonActiveStyle),
    ];

    const textStyle = [
      resolvedTheme.toolbarButtonTextStyle ??
        DEFAULT_THEME.toolbarButtonTextStyle,
      active &&
        (resolvedTheme.toolbarButtonActiveTextStyle ??
          DEFAULT_THEME.toolbarButtonActiveTextStyle),
      // Make italic button actually italic, bold button actually bold, etc.
      label === 'I' && styles.italicLabel,
      label === 'U' && styles.underlineLabel,
      label === 'S' && styles.strikethroughLabel,
    ];

    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Format ${label}`}
        accessibilityState={{ selected: active }}
      >
        <Text style={textStyle}>{label}</Text>
      </TouchableOpacity>
    );
  },
);

ToolbarButton.displayName = 'ToolbarButton';

const styles = StyleSheet.create({
  italicLabel: {
    fontStyle: 'italic',
  },
  underlineLabel: {
    textDecorationLine: 'underline',
  },
  strikethroughLabel: {
    textDecorationLine: 'line-through',
  },
});
