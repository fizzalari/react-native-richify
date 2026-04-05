import React, { useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
} from 'react-native';
import type { RichTextInputProps } from '../types';
import { DEFAULT_THEME } from '../constants/defaultStyles';
import { segmentsToPlainText } from '../utils/parser';
import { useRichText } from '../hooks/useRichText';
import { OverlayText } from './OverlayText';
import { Toolbar } from './Toolbar';

/**
 * RichTextInput — The main rich text editor component.
 *
 * Uses the Overlay Technique:
 * - A transparent `TextInput` on top captures user input and selection
 * - A styled `<Text>` layer behind it renders the formatted content
 * - Both share identical font metrics for pixel-perfect alignment
 *
 * @example
 * ```tsx
 * <RichTextInput
 *   placeholder="Start typing..."
 *   showToolbar
 *   onChangeSegments={(segments) => console.log(segments)}
 * />
 * ```
 */
export const RichTextInput: React.FC<RichTextInputProps> = ({
  initialSegments,
  onChangeSegments,
  onChangeText,
  placeholder = 'Start typing...',
  editable = true,
  maxLength,
  showToolbar = true,
  toolbarPosition = 'top',
  toolbarItems,
  theme,
  multiline = true,
  minHeight = 120,
  maxHeight,
  autoFocus = false,
  textInputProps,
  renderToolbar,
  onReady,
}) => {
  const resolvedTheme = theme ?? DEFAULT_THEME;

  const { state, actions } = useRichText({
    initialSegments,
    onChangeSegments,
    onChangeText,
  });

  // Expose actions via onReady callback
  useEffect(() => {
    onReady?.(actions);
  }, [onReady, actions]);

  // Build plain text for the TextInput value
  const plainText = segmentsToPlainText(state.segments);

  // Handle selection change from TextInput
  const onSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      const { start, end } = e.nativeEvent.selection;
      actions.handleSelectionChange({ start, end });
    },
    [actions],
  );

  // Container style
  const containerStyle = [
    resolvedTheme.containerStyle ?? DEFAULT_THEME.containerStyle,
  ];

  // Input area style
  const inputAreaStyle = [
    styles.inputArea,
    { minHeight },
    maxHeight ? { maxHeight } : undefined,
  ];

  // Input style
  const inputStyle = [
    styles.textInput,
    resolvedTheme.baseTextStyle ?? DEFAULT_THEME.baseTextStyle,
    resolvedTheme.inputStyle ?? DEFAULT_THEME.inputStyle,
    textInputProps?.style,
    styles.hiddenInputText,
  ];

  // Toolbar component
  const toolbarComponent = showToolbar ? (
    <Toolbar
      actions={actions}
      state={state}
      items={toolbarItems}
      theme={resolvedTheme}
      renderToolbar={renderToolbar}
    />
  ) : null;

  // Toolbar border
  const toolbarBorderStyle =
    toolbarPosition === 'top'
      ? { borderBottomWidth: 1, borderBottomColor: resolvedTheme.colors?.toolbarBorder ?? DEFAULT_THEME.colors?.toolbarBorder }
      : { borderTopWidth: 1, borderTopColor: resolvedTheme.colors?.toolbarBorder ?? DEFAULT_THEME.colors?.toolbarBorder };

  return (
    <View style={containerStyle}>
      {/* Toolbar — Top */}
      {toolbarPosition === 'top' && toolbarComponent && (
        <View style={toolbarBorderStyle}>{toolbarComponent}</View>
      )}

      {/* Editor Area */}
      <View style={inputAreaStyle}>
        {/* Overlay — Styled text rendering (behind TextInput) */}
        <OverlayText
          segments={state.segments}
          baseTextStyle={resolvedTheme.baseTextStyle}
          theme={resolvedTheme}
        />

        {/* TextInput — Transparent layer on top for input capture */}
        <TextInput
          {...textInputProps}
          style={inputStyle}
          value={plainText}
          onChangeText={actions.handleTextChange}
          onSelectionChange={onSelectionChange}
          multiline={multiline}
          placeholder={placeholder}
          placeholderTextColor={
            resolvedTheme.colors?.placeholder ??
            DEFAULT_THEME.colors?.placeholder
          }
          editable={editable}
          maxLength={maxLength}
          autoFocus={autoFocus}
          underlineColorAndroid="transparent"
          selectionColor={
            resolvedTheme.colors?.cursor ?? DEFAULT_THEME.colors?.cursor
          }
          textAlignVertical="top"
          scrollEnabled={typeof maxHeight === 'number'}
        />
      </View>

      {/* Toolbar — Bottom */}
      {toolbarPosition === 'bottom' && toolbarComponent && (
        <View style={toolbarBorderStyle}>{toolbarComponent}</View>
      )}
    </View>
  );
};

RichTextInput.displayName = 'RichTextInput';

const styles = StyleSheet.create({
  inputArea: {
    position: 'relative',
  },
  textInput: {
    position: 'relative',
    zIndex: 1,
  },
  hiddenInputText: {
    // Keep the editable layer invisible while preserving the caret.
    color: 'transparent',
    backgroundColor: 'transparent',
    textShadowColor: 'transparent',
  },
});
