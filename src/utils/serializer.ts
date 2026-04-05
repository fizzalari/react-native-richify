import type {
  FormatStyle,
  HeadingLevel,
  OutputFormat,
  StyledSegment,
} from '../types';

type LineFragment = Pick<StyledSegment, 'text' | 'styles'>;

/**
 * Serialize styled segments as Markdown or HTML.
 */
export function serializeSegments(
  segments: StyledSegment[],
  format: OutputFormat = 'markdown',
): string {
  const lines = splitSegmentsByLine(segments);
  return lines.map((line) => serializeLine(line, format)).join('\n');
}

/**
 * Convenience wrapper for Markdown output.
 */
export function segmentsToMarkdown(segments: StyledSegment[]): string {
  return serializeSegments(segments, 'markdown');
}

/**
 * Convenience wrapper for HTML output.
 */
export function segmentsToHTML(segments: StyledSegment[]): string {
  return serializeSegments(segments, 'html');
}

function splitSegmentsByLine(segments: StyledSegment[]): LineFragment[][] {
  const lines: LineFragment[][] = [[]];

  for (const segment of segments) {
    const parts = segment.text.split('\n');

    parts.forEach((part, index) => {
      if (part.length > 0) {
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

function serializeLine(
  line: LineFragment[],
  format: OutputFormat,
): string {
  const heading = getLineHeading(line);
  const content = line
    .map((fragment) => serializeFragment(fragment, format, heading))
    .join('');

  if (format === 'html') {
    const blockTag = heading ?? 'p';
    return `<${blockTag}>${content}</${blockTag}>`;
  }

  const headingPrefix = getHeadingPrefix(heading);
  if (!headingPrefix) {
    return content;
  }

  return content.length > 0 ? `${headingPrefix} ${content}` : headingPrefix;
}

function serializeFragment(
  fragment: LineFragment,
  format: OutputFormat,
  lineHeading?: HeadingLevel,
): string {
  const normalizedStyles: FormatStyle = {
    ...fragment.styles,
    heading: undefined,
    // Markdown headings already express emphasis at the block level.
    bold:
      lineHeading && lineHeading !== 'none' ? false : fragment.styles.bold,
  };

  return format === 'html'
    ? serializeHtmlFragment(fragment.text, normalizedStyles)
    : serializeMarkdownFragment(fragment.text, normalizedStyles);
}

function serializeHtmlFragment(text: string, styles: FormatStyle): string {
  let result = escapeHtml(text);

  if (styles.code) {
    result = `<code>${result}</code>`;
  }

  if (styles.bold) {
    result = `<strong>${result}</strong>`;
  }

  if (styles.italic) {
    result = `<em>${result}</em>`;
  }

  if (styles.underline) {
    result = `<u>${result}</u>`;
  }

  if (styles.strikethrough) {
    result = `<s>${result}</s>`;
  }

  const styleAttribute = buildInlineStyle(styles);
  if (styleAttribute) {
    result = `<span style="${styleAttribute}">${result}</span>`;
  }

  return result;
}

function serializeMarkdownFragment(text: string, styles: FormatStyle): string {
  let result = escapeMarkdown(text);

  if (styles.code) {
    result = wrapInlineCode(text);
  }

  if (styles.bold) {
    result = `**${result}**`;
  }

  if (styles.italic) {
    result = `*${result}*`;
  }

  if (styles.strikethrough) {
    result = `~~${result}~~`;
  }

  if (styles.underline) {
    result = `<u>${result}</u>`;
  }

  const styleAttribute = buildInlineStyle(styles);
  if (styleAttribute) {
    result = `<span style="${styleAttribute}">${result}</span>`;
  }

  return result;
}

function buildInlineStyle(styles: FormatStyle): string {
  const cssRules: string[] = [];

  if (styles.color) {
    cssRules.push(`color: ${styles.color}`);
  }

  if (styles.backgroundColor) {
    cssRules.push(`background-color: ${styles.backgroundColor}`);
  }

  if (styles.fontSize) {
    cssRules.push(`font-size: ${styles.fontSize}px`);
  }

  return cssRules.join('; ');
}

function getLineHeading(line: LineFragment[]): HeadingLevel | undefined {
  for (const fragment of line) {
    if (fragment.styles.heading && fragment.styles.heading !== 'none') {
      return fragment.styles.heading;
    }
  }

  return undefined;
}

function getHeadingPrefix(heading?: HeadingLevel): string | undefined {
  switch (heading) {
    case 'h1':
      return '#';
    case 'h2':
      return '##';
    case 'h3':
      return '###';
    default:
      return undefined;
  }
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_~[\]])/g, '\\$1');
}

function wrapInlineCode(text: string): string {
  const matches = text.match(/`+/g);
  const longestBacktickRun = matches?.reduce(
    (max, match) => Math.max(max, match.length),
    0,
  ) ?? 0;
  const fence = '`'.repeat(longestBacktickRun + 1);

  return `${fence}${text}${fence}`;
}
