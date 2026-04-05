import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import type { ToolbarButtonProps } from '../types';
import { DEFAULT_THEME } from '../constants/defaultStyles';

/**
 * A single toolbar button that toggles a formatting option.
 * Supports custom rendering via the `renderButton` prop.
 */
export const ToolbarButton: React.FC<ToolbarButtonProps> = React.memo(
  ({ label, accessibilityLabel, active, onPress, theme, renderButton }) => {
    // Custom render
    if (renderButton) {
      return renderButton({ active, onPress, label, accessibilityLabel });
    }

    const resolvedTheme = theme ?? DEFAULT_THEME;
    const baseTextColor =
      resolvedTheme.toolbarButtonTextStyle?.color ??
      DEFAULT_THEME.toolbarButtonTextStyle?.color;
    const activeTextColor =
      resolvedTheme.toolbarButtonActiveTextStyle?.color ??
      DEFAULT_THEME.toolbarButtonActiveTextStyle?.color ??
      baseTextColor;
    const resolvedIconColor = active ? activeTextColor : baseTextColor;
    const iconColor =
      typeof resolvedIconColor === 'string' ? resolvedIconColor : undefined;

    const buttonStyle = [
      resolvedTheme.toolbarButtonStyle ?? DEFAULT_THEME.toolbarButtonStyle,
      active &&
      (resolvedTheme.toolbarButtonActiveStyle ??
        DEFAULT_THEME.toolbarButtonActiveStyle),
    ];

    const derivedAccessibilityLabel =
      accessibilityLabel ??
      (typeof label === 'string' || typeof label === 'number'
        ? `Format ${label}`
        : 'Toolbar action');

    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={derivedAccessibilityLabel}
        accessibilityState={{ selected: active }}
      >
        {renderToolbarContent(label, iconColor, active, resolvedTheme)}
      </TouchableOpacity>
    );
  },
);

ToolbarButton.displayName = 'ToolbarButton';

const styles = StyleSheet.create({
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
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

function renderToolbarContent(
  label: ToolbarButtonProps['label'],
  iconColor: string | undefined,
  active: boolean,
  theme: NonNullable<ToolbarButtonProps['theme']>,
) {
  if (typeof label === 'string' || typeof label === 'number') {
    const textStyle = [
      theme.toolbarButtonTextStyle ?? DEFAULT_THEME.toolbarButtonTextStyle,
      active &&
      (theme.toolbarButtonActiveTextStyle ??
        DEFAULT_THEME.toolbarButtonActiveTextStyle),
      label === 'I' && styles.italicLabel,
      label === 'U' && styles.underlineLabel,
      label === 'S' && styles.strikethroughLabel,
    ];

    return <Text style={textStyle}>{label}</Text>;
  }

  if (React.isValidElement(label)) {
    return (
      <View style={styles.contentWrapper}>
        {React.cloneElement(
          label as React.ReactElement<{
            color?: string;
            size?: number;
            strokeWidth?: number;
          }>,
          {
            color:
              (label.props as { color?: string }).color ?? iconColor,
            size: (label.props as { size?: number }).size ?? 18,
            strokeWidth:
              (label.props as { strokeWidth?: number }).strokeWidth ?? 2,
          },
        )}
      </View>
    );
  }

  return <View style={styles.contentWrapper}>{label}</View>;
}
