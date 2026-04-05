import {
  serializeSegments,
  segmentsToHTML,
  segmentsToMarkdown,
} from '../../src/utils/serializer';
import { createSegment } from '../../src/utils/parser';

describe('serializer', () => {
  it('serializes markdown inline formats', () => {
    const output = segmentsToMarkdown([
      createSegment('Hello', { bold: true }),
      createSegment(' world', { italic: true }),
    ]);

    expect(output).toBe('**Hello*** world*');
  });

  it('serializes headings as markdown blocks', () => {
    const output = serializeSegments(
      [createSegment('Title', { heading: 'h1' })],
      'markdown',
    );

    expect(output).toBe('# Title');
  });

  it('serializes headings and inline styles as HTML', () => {
    const output = segmentsToHTML([
      createSegment('Title', { heading: 'h2' }),
      createSegment('!', { heading: 'h2', color: '#ff0000' }),
    ]);

    expect(output).toBe(
      '<h2>Title<span style="color: #ff0000">!</span></h2>',
    );
  });

  it('uses inline HTML for markdown-only unsupported styles', () => {
    const output = serializeSegments(
      [
        createSegment('Marked', {
          underline: true,
          color: '#00aa00',
        }),
      ],
      'markdown',
    );

    expect(output).toBe(
      '<span style="color: #00aa00"><u>Marked</u></span>',
    );
  });

  it('preserves line breaks between serialized blocks', () => {
    const output = serializeSegments(
      [
        createSegment('Title', { heading: 'h3' }),
        createSegment('\n'),
        createSegment('Paragraph'),
      ],
      'html',
    );

    expect(output).toBe('<h3>Title</h3>\n<p>Paragraph</p>');
  });

  it('serializes list items as grouped markdown lists', () => {
    const output = serializeSegments(
      [
        createSegment('One', { listType: 'bullet' }),
        createSegment('\n'),
        createSegment('Two', { listType: 'bullet' }),
      ],
      'markdown',
    );

    expect(output).toBe('- One\n- Two');
  });

  it('serializes links and images', () => {
    const output = serializeSegments(
      [
        createSegment('Docs', { link: 'https://openai.com' }),
        createSegment('\n'),
        createSegment('[Image: Hero]', {
          imageSrc: 'https://cdn.test/hero.png',
          imageAlt: 'Hero',
        }),
      ],
      'markdown',
    );

    expect(output).toBe(
      '[Docs](https://openai.com)\n![Hero](https://cdn.test/hero.png)',
    );
  });

  it('uses html block fallback for markdown alignment', () => {
    const output = serializeSegments(
      [createSegment('Centered', { textAlign: 'center' })],
      'markdown',
    );

    expect(output).toBe('<p style="text-align: center">Centered</p>');
  });
});
