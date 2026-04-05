import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import type { ToolbarProps, ToolbarItem } from '../types';
import { DEFAULT_THEME, DEFAULT_TOOLBAR_ITEMS } from '../constants/defaultStyles';
import { ToolbarButton } from './ToolbarButton';

/**
 * Formatting toolbar for the rich text editor.
 *
 * Supports:
 * - Default toolbar items (bold, italic, underline, etc.)
 * - Custom toolbar items via the `items` prop
 * - Fully custom rendering via `renderToolbar`
 * - Horizontal scrolling for overflow
 */
export const Toolbar: React.FC<ToolbarProps> = React.memo(
  ({ actions, state, items, theme, visible = true, renderToolbar }) => {
    const resolvedTheme = theme ?? DEFAULT_THEME;
    const toolbarItems = items ?? DEFAULT_TOOLBAR_ITEMS;

    // Compute active state for each item
    const enrichedItems: ToolbarItem[] = useMemo(() => {
      const selectionStyle = actions.getSelectionStyle();

      return toolbarItems.map((item) => {
        let isActive = false;

        if (item.format) {
          isActive = actions.isFormatActive(item.format);
        }

        if (item.heading) {
          isActive = selectionStyle.heading === item.heading;
        }

        return {
          ...item,
          active: item.active ?? isActive,
        };
      });
    }, [actions, toolbarItems]);

    // Custom render
    if (renderToolbar) {
      return renderToolbar({
        items: enrichedItems,
        state,
        actions,
      });
    }

    if (!visible) {
      return null;
    }

    const toolbarStyle = [
      resolvedTheme.toolbarStyle ?? DEFAULT_THEME.toolbarStyle,
    ];

    return (
      <View style={toolbarStyle}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.scrollContent}
        >
          {enrichedItems.map((item) => (
            <ToolbarButton
              key={item.id}
              label={item.label}
              active={!!item.active}
              theme={resolvedTheme}
              renderButton={item.renderButton}
              onPress={() => {
                if (item.onPress) {
                  item.onPress();
                } else if (item.format) {
                  actions.toggleFormat(item.format);
                } else if (item.heading) {
                  actions.setHeading(item.heading);
                }
              }}
            />
          ))}
        </ScrollView>
      </View>
    );
  },
);

Toolbar.displayName = 'Toolbar';

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
