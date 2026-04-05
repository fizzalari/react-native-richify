import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { FormatStyle, RichTextTheme, StyledSegment } from '../types';
import { DEFAULT_THEME } from '../constants/defaultStyles';
import { segmentToTextStyle } from '../utils/styleMapper';

interface RenderedOutputProps {
  segments: StyledSegment[];
  theme?: RichTextTheme;
}

type LineFragment = Pick<StyledSegment, 'text' | 'styles'>;

export const RenderedOutput: React.FC<RenderedOutputProps> = React.memo(
  ({ segments, theme }) => {
    const resolvedTheme = theme ?? DEFAULT_THEME;
    const lines = useMemo(() => splitSegmentsByLine(segments), [segments]);
    let orderedIndex = 0;

    return (
      <View
        style={[
          styles.container,
          resolvedTheme.renderedOutputStyle ?? DEFAULT_THEME.renderedOutputStyle,
        ]}
      >
        {lines.map((line, lineIndex) => {
          const listType = getLineStyle(line, 'listType');
          const textAlign = getLineStyle(line, 'textAlign');
          const marker =
            listType === 'bullet'
              ? '\u2022'
              : listType === 'ordered'
                ? `${orderedIndex + 1}.`
                : undefined;

          orderedIndex = listType === 'ordered' ? orderedIndex + 1 : 0;

          const textFragments = line.filter(
            (fragment) => !fragment.styles.imageSrc && fragment.text.length > 0,
          );
          const imageFragments = line.filter((fragment) => !!fragment.styles.imageSrc);
          const contentAlignStyle =
            textAlign === 'center'
              ? styles.alignCenter
              : textAlign === 'right'
                ? styles.alignRight
                : styles.alignLeft;

          if (textFragments.length === 0 && imageFragments.length === 0) {
            return (
              <View
                key={`line-${lineIndex}`}
                style={[styles.emptyLine, contentAlignStyle]}
              />
            );
          }

          const textNode =
            textFragments.length > 0 ? (
              <Text
                style={[
                  resolvedTheme.baseTextStyle ?? DEFAULT_THEME.baseTextStyle,
                  textAlign ? { textAlign } : undefined,
                ]}
              >
                {textFragments.map((fragment, fragmentIndex) => (
                  <Text
                    key={`text-${lineIndex}-${fragmentIndex}`}
                    style={segmentToTextStyle(fragment as StyledSegment, resolvedTheme)}
                  >
                    {fragment.text}
                  </Text>
                ))}
              </Text>
            ) : null;

          const imageNodes = imageFragments.map((fragment, fragmentIndex) => (
            <View key={`image-${lineIndex}-${fragmentIndex}`} style={styles.imageBlock}>
              <Image
                source={{ uri: fragment.styles.imageSrc }}
                style={styles.image}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.imageCaption,
                  resolvedTheme.baseTextStyle ?? DEFAULT_THEME.baseTextStyle,
                  textAlign ? { textAlign } : undefined,
                ]}
              >
                {fragment.styles.imageAlt ?? extractImageAlt(fragment.text)}
              </Text>
            </View>
          ));

          const content = (
            <View style={[styles.lineContent, contentAlignStyle]}>
              {textNode}
              {imageNodes}
            </View>
          );

          if (!marker) {
            return (
              <View key={`line-${lineIndex}`} style={styles.line}>
                {content}
              </View>
            );
          }

          return (
            <View key={`line-${lineIndex}`} style={styles.listLine}>
              <Text
                style={[
                  styles.listMarker,
                  resolvedTheme.baseTextStyle ?? DEFAULT_THEME.baseTextStyle,
                ]}
              >
                {marker}
              </Text>
              <View style={styles.listContent}>{content}</View>
            </View>
          );
        })}
      </View>
    );
  },
);

RenderedOutput.displayName = 'RenderedOutput';

function splitSegmentsByLine(segments: StyledSegment[]): LineFragment[][] {
  const lines: LineFragment[][] = [[]];

  for (const segment of segments) {
    const parts = segment.text.split('\n');

    parts.forEach((part, index) => {
      if (part.length > 0 || segment.styles.imageSrc) {
        lines[lines.length - 1]?.push({
          text: part,
          styles: { ...segment.styles },
        });
      }

      if (index < parts.length - 1) {
        lines.push([]);
      }
    });
  }

  return lines;
}

function getLineStyle<K extends keyof FormatStyle>(
  line: LineFragment[],
  key: K,
): FormatStyle[K] {
  for (const fragment of line) {
    const value = fragment.styles[key];
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

function extractImageAlt(text: string): string {
  const normalized = text
    .replace(/^\[Image:\s*/i, '')
    .replace(/^\[Image\]/i, '')
    .replace(/\]$/, '')
    .trim();

  return normalized.length > 0 ? normalized : 'image';
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  line: {
    width: '100%',
  },
  lineContent: {
    width: '100%',
    gap: 8,
  },
  listLine: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  listMarker: {
    minWidth: 20,
    paddingTop: 1,
  },
  listContent: {
    flex: 1,
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  emptyLine: {
    minHeight: 20,
    width: '100%',
  },
  imageBlock: {
    width: '100%',
    gap: 6,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  imageCaption: {
    fontSize: 13,
    opacity: 0.8,
  },
});
