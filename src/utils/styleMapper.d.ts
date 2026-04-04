import type { TextStyle } from 'react-native';
import type { FormatStyle, RichTextTheme, StyledSegment } from '@/types';
/**
 * Maps a FormatStyle to a React Native TextStyle.
 * Applies formatting properties based on the segment's style.
 */
export declare function formatStyleToTextStyle(formatStyle: FormatStyle, theme?: RichTextTheme): TextStyle;
/**
 * Maps an entire segment to its computed TextStyle (base + format).
 */
export declare function segmentToTextStyle(segment: StyledSegment, theme?: RichTextTheme): TextStyle;
/**
 * Batch-maps an array of segments to an array of TextStyles.
 */
export declare function segmentsToTextStyles(segments: StyledSegment[], theme?: RichTextTheme): TextStyle[];
