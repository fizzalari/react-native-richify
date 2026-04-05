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
  ({
    actions,
    state,
    items,
    theme,
    visible = true,
    outputFormat = 'markdown',
    outputPreviewMode = 'literal',
    onOutputFormatChange,
    onOutputPreviewModeChange,
    onRequestLink,
    onRequestImage,
    renderToolbar,
  }) => {
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

        if (item.listType) {
          isActive = selectionStyle.listType === item.listType;
        }

        if (item.textAlign) {
          isActive = selectionStyle.textAlign === item.textAlign;
        }

        if (item.outputFormat) {
          isActive = outputFormat === item.outputFormat;
        }

        if (item.outputPreviewMode) {
          isActive = outputPreviewMode === item.outputPreviewMode;
        }

        if (item.actionType === 'link') {
          isActive = !!selectionStyle.link;
        }

        return {
          ...item,
          active: item.active ?? isActive,
        };
      });
    }, [actions, outputFormat, outputPreviewMode, toolbarItems]);

    // Custom render
    if (renderToolbar) {
      return renderToolbar({
        items: enrichedItems,
        state,
        actions,
        outputFormat,
        outputPreviewMode,
        onOutputFormatChange: onOutputFormatChange ?? (() => undefined),
        onOutputPreviewModeChange:
          onOutputPreviewModeChange ?? (() => undefined),
        onRequestLink,
        onRequestImage,
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
                } else if (item.listType) {
                  actions.setListType(item.listType);
                } else if (item.textAlign) {
                  actions.setTextAlign(item.textAlign);
                } else if (item.outputFormat) {
                  onOutputFormatChange?.(item.outputFormat);
                } else if (item.outputPreviewMode) {
                  onOutputPreviewModeChange?.(item.outputPreviewMode);
                } else if (item.actionType === 'link') {
                  onRequestLink?.();
                } else if (item.actionType === 'image') {
                  onRequestImage?.();
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
