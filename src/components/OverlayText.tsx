import React from 'react';
import { Text, View } from 'react-native';
import type { OverlayTextProps } from '@/types';
import { segmentToTextStyle } from '@/utils/styleMapper';
import { DEFAULT_THEME } from '@/constants/defaultStyles';

/**
 * OverlayText renders the styled text segments as a `<Text>` component tree.
 *
 * This component is positioned behind the transparent TextInput to create
 * the overlay effect — the user types into the TextInput while seeing
 * the formatted rendering from this component.
 */
export const OverlayText: React.FC<OverlayTextProps> = React.memo(
  ({ segments, baseTextStyle, theme }) => {
    const resolvedTheme = theme ?? DEFAULT_THEME;
    const overlayStyle =
      resolvedTheme.overlayContainerStyle ??
      DEFAULT_THEME.overlayContainerStyle;

    return (
      <View style={overlayStyle} pointerEvents="none">
        <Text>
          {segments.map((segment, index) => {
            if (segment.text.length === 0 && segments.length > 1) {
              return null;
            }

            const textStyle = segmentToTextStyle(segment, resolvedTheme);

            return (
              <Text
                key={`${index}-${segment.text.slice(0, 8)}`}
                style={[baseTextStyle, textStyle]}
              >
                {segment.text}
              </Text>
            );
          })}
        </Text>
      </View>
    );
  },
);

OverlayText.displayName = 'OverlayText';
