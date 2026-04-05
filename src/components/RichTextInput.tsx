import React, {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
  type TextInputSelectionChangeEventData,
} from 'react-native';
import type { RichTextInputProps } from '../types';
import { DEFAULT_THEME } from '../constants/defaultStyles';
import { useRichText } from '../hooks/useRichText';
import { segmentsToPlainText } from '../utils/parser';
import { serializeSegments } from '../utils/serializer';
import { RenderedOutput } from './RenderedOutput';
import { Toolbar } from './Toolbar';

const DEFAULT_OUTPUT_PANEL_MAX_HEIGHT = 180;
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
  outputFormat,
  defaultOutputFormat = 'markdown',
  outputPreviewMode,
  defaultOutputPreviewMode = 'literal',
  maxOutputHeight = DEFAULT_OUTPUT_PANEL_MAX_HEIGHT,
  onChangeOutput,
  onChangeOutputFormat,
  onChangeOutputPreviewMode,
  onRequestLink,
  onRequestImage,
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
  const [internalOutputFormat, setInternalOutputFormat] =
    useState(defaultOutputFormat);
  const [internalOutputPreviewMode, setInternalOutputPreviewMode] = useState(
    defaultOutputPreviewMode,
  );
  const [contentHeight, setContentHeight] = useState(minHeight);

  const { state, actions } = useRichText({
    initialSegments,
    onChangeSegments,
    onChangeText,
  });

  useEffect(() => {
    onReady?.(actions);
  }, [actions, onReady]);

  const plainText = segmentsToPlainText(state.segments);
  const resolvedOutputFormat = outputFormat ?? internalOutputFormat;
  const resolvedOutputPreviewMode =
    outputPreviewMode ?? internalOutputPreviewMode;
  const inputHeight = Math.max(
    minHeight,
    typeof maxHeight === 'number'
      ? Math.min(contentHeight, maxHeight)
      : contentHeight,
  );
  const shouldScrollInput =
    typeof maxHeight === 'number' && contentHeight > maxHeight;
  const serializedOutput = useMemo(
    () => serializeSegments(state.segments, resolvedOutputFormat),
    [resolvedOutputFormat, state.segments],
  );
  const shouldShowOutputPreview = showOutputPreview && plainText.length > 0;
  const normalizedSelection = useMemo(
    () => ({
      start: Math.min(state.selection.start, state.selection.end),
      end: Math.max(state.selection.start, state.selection.end),
    }),
    [state.selection.end, state.selection.start],
  );
  const selectedText = useMemo(
    () => plainText.slice(normalizedSelection.start, normalizedSelection.end),
    [normalizedSelection.end, normalizedSelection.start, plainText],
  );
  const selectionStyle = useMemo(
    () => actions.getSelectionStyle(),
    [actions, state.activeStyles, state.segments, state.selection],
  );

  useEffect(() => {
    onChangeOutput?.(serializedOutput, resolvedOutputFormat);
  }, [onChangeOutput, resolvedOutputFormat, serializedOutput]);

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

  const onContentSizeChange = useCallback(
    (e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      setContentHeight(Math.ceil(e.nativeEvent.contentSize.height));
      textInputProps?.onContentSizeChange?.(e);
    },
    [textInputProps],
  );

  const handleOutputFormatChange = useCallback(
    (format: 'markdown' | 'html') => {
      if (outputFormat === undefined) {
        setInternalOutputFormat(format);
      }

      onChangeOutputFormat?.(format);
    },
    [onChangeOutputFormat, outputFormat],
  );

  const handleOutputPreviewModeChange = useCallback(
    (mode: 'literal' | 'rendered') => {
      if (outputPreviewMode === undefined) {
        setInternalOutputPreviewMode(mode);
      }

      onChangeOutputPreviewMode?.(mode);
    },
    [onChangeOutputPreviewMode, outputPreviewMode],
  );

  const handleRequestLink = useCallback(() => {
    if (onRequestLink) {
      onRequestLink({
        selectedText,
        currentUrl: selectionStyle.link,
        applyLink: actions.setLink,
      });
      return;
    }

    if (selectionStyle.link) {
      actions.setLink(undefined);
      return;
    }

    const detectedUrl = detectLinkTarget(selectedText);
    if (detectedUrl) {
      actions.setLink(detectedUrl);
    }
  }, [actions, onRequestLink, selectedText, selectionStyle.link]);

  const handleRequestImage = useCallback(() => {
    if (onRequestImage) {
      onRequestImage({
        insertImage: actions.insertImage,
      });
      return;
    }

    const detectedSource = detectImageSource(selectedText);
    if (detectedSource) {
      actions.insertImage(detectedSource, {
        alt: selectedText.trim() || undefined,
      });
    }
  }, [actions, onRequestImage, selectedText]);

  const outputLabel = useMemo(() => {
    const formatLabel = resolvedOutputFormat === 'html' ? 'HTML' : 'Markdown';

    if (resolvedOutputPreviewMode === 'rendered') {
      return `${formatLabel} preview`;
    }

    return `${formatLabel} output`;
  }, [resolvedOutputFormat, resolvedOutputPreviewMode]);

  const containerStyle = [
    resolvedTheme.containerStyle ?? DEFAULT_THEME.containerStyle,
  ];
  const inputAreaStyle = [styles.inputArea];
  const inputStyle = [
    styles.textInput,
    resolvedTheme.baseTextStyle ?? DEFAULT_THEME.baseTextStyle,
    resolvedTheme.inputStyle ?? DEFAULT_THEME.inputStyle,
    { height: inputHeight },
    textInputProps?.style,
  ];
  const outputAnimatedStyle = {
    maxHeight: previewProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, maxOutputHeight + 72],
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
      outputFormat={resolvedOutputFormat}
      outputPreviewMode={resolvedOutputPreviewMode}
      onOutputFormatChange={handleOutputFormatChange}
      onOutputPreviewModeChange={handleOutputPreviewModeChange}
      onRequestLink={handleRequestLink}
      onRequestImage={handleRequestImage}
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
          onContentSizeChange={onContentSizeChange}
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
          scrollEnabled={shouldScrollInput}
        />

        {showOutputPreview && (
          <Animated.View
            pointerEvents={shouldShowOutputPreview ? 'auto' : 'none'}
            style={[styles.outputAnimatedWrapper, outputAnimatedStyle]}
          >
            <View style={outputContainerStyle}>
              <Text style={outputLabelStyle}>
                {outputLabel}
              </Text>
              <ScrollView
                style={{ maxHeight: maxOutputHeight }}
                showsVerticalScrollIndicator={false}
              >
                {resolvedOutputPreviewMode === 'rendered' ? (
                  <RenderedOutput
                    segments={state.segments}
                    theme={resolvedTheme}
                  />
                ) : (
                  <Text selectable style={outputTextStyle}>
                    {serializedOutput}
                  </Text>
                )}
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

function detectLinkTarget(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return `mailto:${trimmed}`;
  }

  if (/^[^\s]+\.[^\s]+$/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return undefined;
}

function detectImageSource(value: string): string | undefined {
  const normalized = detectLinkTarget(value);
  if (!normalized) {
    return undefined;
  }

  const candidate = normalized.replace(/^mailto:/i, '');
  if (/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(candidate)) {
    return normalized;
  }

  return undefined;
}
