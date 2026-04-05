import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
} from 'react-native';
import type { RichTextInputProps } from '../types';
import { DEFAULT_THEME } from '../constants/defaultStyles';
import { useRichText } from '../hooks/useRichText';
import { segmentsToPlainText } from '../utils/parser';
import { serializeSegments } from '../utils/serializer';
import { Toolbar } from './Toolbar';

const OUTPUT_PANEL_HEIGHT = 180;
const isJestRuntime =
  typeof (
    globalThis as {
      process?: { env?: { JEST_WORKER_ID?: string } };
    }
  ).process?.env?.JEST_WORKER_ID === 'string';

/**
 * RichTextInput — The main rich text editor component.
 *
 * Uses a plain `TextInput` for editing and renders the serialized rich output
 * below it as Markdown or HTML.
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
  showOutputPreview = true,
  outputFormat = 'markdown',
  onChangeOutput,
  multiline = true,
  minHeight = 120,
  maxHeight,
  autoFocus = false,
  textInputProps,
  renderToolbar,
  onReady,
}) => {
  const resolvedTheme = theme ?? DEFAULT_THEME;
  const previewProgress = useRef(new Animated.Value(0)).current;

  const { state, actions } = useRichText({
    initialSegments,
    onChangeSegments,
    onChangeText,
  });

  useEffect(() => {
    onReady?.(actions);
  }, [actions, onReady]);

  const plainText = segmentsToPlainText(state.segments);
  const serializedOutput = useMemo(
    () => serializeSegments(state.segments, outputFormat),
    [outputFormat, state.segments],
  );
  const shouldShowOutputPreview = showOutputPreview && plainText.length > 0;

  useEffect(() => {
    onChangeOutput?.(serializedOutput, outputFormat);
  }, [onChangeOutput, outputFormat, serializedOutput]);

  useEffect(() => {
    if (isJestRuntime) {
      previewProgress.setValue(shouldShowOutputPreview ? 1 : 0);
      return;
    }

    Animated.timing(previewProgress, {
      toValue: shouldShowOutputPreview ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [previewProgress, shouldShowOutputPreview]);

  const onSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      const { start, end } = e.nativeEvent.selection;
      actions.handleSelectionChange({ start, end });
    },
    [actions],
  );

  const containerStyle = [
    resolvedTheme.containerStyle ?? DEFAULT_THEME.containerStyle,
  ];
  const inputAreaStyle = [
    styles.inputArea,
    { minHeight },
    maxHeight ? { maxHeight } : undefined,
  ];
  const inputStyle = [
    styles.textInput,
    resolvedTheme.baseTextStyle ?? DEFAULT_THEME.baseTextStyle,
    resolvedTheme.inputStyle ?? DEFAULT_THEME.inputStyle,
    textInputProps?.style,
  ];
  const outputAnimatedStyle = {
    maxHeight: previewProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, OUTPUT_PANEL_HEIGHT],
    }),
    opacity: previewProgress,
    marginTop: previewProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 12],
    }),
    transform: [
      {
        translateY: previewProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [-8, 0],
        }),
      },
    ],
  };
  const outputContainerStyle = [
    resolvedTheme.outputContainerStyle ?? DEFAULT_THEME.outputContainerStyle,
  ];
  const outputLabelStyle = [
    resolvedTheme.outputLabelStyle ?? DEFAULT_THEME.outputLabelStyle,
  ];
  const outputTextStyle = [
    resolvedTheme.outputTextStyle ?? DEFAULT_THEME.outputTextStyle,
  ];

  const toolbarComponent = showToolbar ? (
    <Toolbar
      actions={actions}
      state={state}
      items={toolbarItems}
      theme={resolvedTheme}
      renderToolbar={renderToolbar}
    />
  ) : null;

  const toolbarBorderStyle =
    toolbarPosition === 'top'
      ? {
          borderBottomWidth: 1,
          borderBottomColor:
            resolvedTheme.colors?.toolbarBorder ??
            DEFAULT_THEME.colors?.toolbarBorder,
        }
      : {
          borderTopWidth: 1,
          borderTopColor:
            resolvedTheme.colors?.toolbarBorder ??
            DEFAULT_THEME.colors?.toolbarBorder,
        };

  return (
    <View style={containerStyle}>
      {toolbarPosition === 'top' && toolbarComponent && (
        <View style={toolbarBorderStyle}>{toolbarComponent}</View>
      )}

      <View style={inputAreaStyle}>
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
          selectionColor={
            resolvedTheme.colors?.cursor ?? DEFAULT_THEME.colors?.cursor
          }
          textAlignVertical="top"
          scrollEnabled={typeof maxHeight === 'number'}
        />

        {showOutputPreview && (
          <Animated.View
            pointerEvents={shouldShowOutputPreview ? 'auto' : 'none'}
            style={[styles.outputAnimatedWrapper, outputAnimatedStyle]}
          >
            <View style={outputContainerStyle}>
              <Text style={outputLabelStyle}>
                {outputFormat === 'html' ? 'HTML output' : 'Markdown output'}
              </Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text selectable style={outputTextStyle}>
                  {serializedOutput}
                </Text>
              </ScrollView>
            </View>
          </Animated.View>
        )}
      </View>

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
  },
  outputAnimatedWrapper: {
    overflow: 'hidden',
  },
});
