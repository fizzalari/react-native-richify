import type {
  FormatStyle,
  HeadingLevel,
  ListType,
  OutputFormat,
  StyledSegment,
  TextAlign,
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
  const blocks: string[] = [];

  for (let index = 0; index < lines.length; ) {
    const line = lines[index];
    const listType = getLineListType(line);

    if (listType && listType !== 'none') {
      const listLines: LineFragment[][] = [];

      while (index < lines.length && getLineListType(lines[index]) === listType) {
        listLines.push(lines[index]);
        index++;
      }

      blocks.push(serializeListBlock(listLines, format, listType));
      continue;
    }

    blocks.push(serializeBlockLine(line, format));
    index++;
  }

  return blocks.join('\n');
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

function serializeListBlock(
  lines: LineFragment[][],
  format: OutputFormat,
  listType: ListType,
): string {
  if (format === 'html' || lines.some((line) => !!getLineTextAlign(line))) {
    const tag = listType === 'ordered' ? 'ol' : 'ul';
    const items = lines.map((line) => serializeHtmlListItem(line)).join('');
    return `<${tag}>${items}</${tag}>`;
  }

  return lines
    .map((line, index) => {
      const marker = listType === 'ordered' ? `${index + 1}.` : '-';
      const content = serializeLineContent(line, format);
      return content.length > 0 ? `${marker} ${content}` : marker;
    })
    .join('\n');
}

function serializeHtmlListItem(line: LineFragment[]): string {
  const content = serializeLineContent(line, 'html');
  const styleAttribute = buildBlockStyle(getLineTextAlign(line));
  return `<li${styleAttribute ? ` style="${styleAttribute}"` : ''}>${content}</li>`;
}

function serializeBlockLine(
  line: LineFragment[],
  format: OutputFormat,
): string {
  const heading = getLineHeading(line);
  const textAlign = getLineTextAlign(line);
  const content = serializeLineContent(line, format, heading);

  if (format === 'html') {
    const blockTag = heading ?? 'p';
    const styleAttribute = buildBlockStyle(textAlign);
    return `<${blockTag}${styleAttribute ? ` style="${styleAttribute}"` : ''}>${content}</${blockTag}>`;
  }

  if (textAlign) {
    return serializeAlignedMarkdownLine(content, heading, textAlign);
  }

  const headingPrefix = getHeadingPrefix(heading);
  if (!headingPrefix) {
    return content;
  }

  return content.length > 0 ? `${headingPrefix} ${content}` : headingPrefix;
}

function serializeAlignedMarkdownLine(
  content: string,
  heading: HeadingLevel | undefined,
  textAlign: TextAlign,
): string {
  const blockTag = heading ?? 'p';
  const styleAttribute = buildBlockStyle(textAlign);
  return `<${blockTag} style="${styleAttribute}">${content}</${blockTag}>`;
}

function serializeLineContent(
  line: LineFragment[],
  format: OutputFormat,
  lineHeading?: HeadingLevel,
): string {
  return line
    .map((fragment) => serializeFragment(fragment, format, lineHeading))
    .join('');
}

function serializeFragment(
  fragment: LineFragment,
  format: OutputFormat,
  lineHeading?: HeadingLevel,
): string {
  if (fragment.styles.imageSrc) {
    return serializeImageFragment(fragment, format);
  }

  const normalizedStyles: FormatStyle = {
    ...fragment.styles,
    heading: undefined,
    listType: undefined,
    textAlign: undefined,
    imageSrc: undefined,
    imageAlt: undefined,
    bold:
      lineHeading && lineHeading !== 'none' ? false : fragment.styles.bold,
  };

  return format === 'html'
    ? serializeHtmlFragment(fragment.text, normalizedStyles)
    : serializeMarkdownFragment(fragment.text, normalizedStyles);
}

function serializeImageFragment(
  fragment: LineFragment,
  format: OutputFormat,
): string {
  const source = fragment.styles.imageSrc ?? '';
  const altText = fragment.styles.imageAlt ?? extractImageAlt(fragment.text);

  if (format === 'html') {
    return `<img src="${escapeHtml(source)}" alt="${escapeHtml(altText)}" />`;
  }

  return `![${escapeMarkdown(altText)}](${escapeMarkdownUrl(source)})`;
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

  if (styles.link) {
    result = `<a href="${escapeHtml(styles.link)}">${result}</a>`;
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

  if (styles.link) {
    result = `[${result}](${escapeMarkdownUrl(styles.link)})`;
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

function buildBlockStyle(textAlign?: TextAlign): string {
  const cssRules: string[] = [];

  if (textAlign) {
    cssRules.push(`text-align: ${textAlign}`);
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

function getLineListType(line: LineFragment[]): ListType | undefined {
  for (const fragment of line) {
    if (fragment.styles.listType && fragment.styles.listType !== 'none') {
      return fragment.styles.listType;
    }
  }

  return undefined;
}

function getLineTextAlign(line: LineFragment[]): TextAlign | undefined {
  for (const fragment of line) {
    if (fragment.styles.textAlign) {
      return fragment.styles.textAlign;
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

function extractImageAlt(text: string): string {
  const normalized = text.replace(/^\[Image:\s*/i, '').replace(/^\[Image\]/i, '').replace(/\]$/, '').trim();
  return normalized.length > 0 ? normalized : 'image';
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

function escapeMarkdownUrl(url: string): string {
  return url.replaceAll(' ', '%20').replaceAll(')', '%29');
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
