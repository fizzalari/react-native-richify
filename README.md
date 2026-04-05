# react-native-richify

A rich text input for React Native with a normal `TextInput` editing surface, a built-in formatting toolbar, and live Markdown or HTML output.

[![npm version](https://img.shields.io/npm/v/react-native-richify.svg)](https://www.npmjs.com/package/react-native-richify)
[![license](https://img.shields.io/npm/l/react-native-richify.svg)](https://github.com/soumya-99/react-native-richify/blob/main/LICENSE)

## Features

- Native editing with no WebView
- Rich inline formatting: bold, italic, underline, strikethrough, code
- Line-level formatting: H1, H2, H3, bullet list, ordered list, left/center/right alignment
- Link support on selected text
- Live output panel with Markdown or HTML serialization
- Raw output view or rendered preview view
- Auto-growing input with configurable input and preview heights
- Custom toolbar items, custom toolbar rendering, and theme overrides
- JSON import/export through typed segment data
- Headless `useRichText` hook for fully custom editors

## Installation

```bash
npm install react-native-richify
# or
yarn add react-native-richify
```

No native modules are required. The package works in Expo and bare React Native apps.

## Quick Start

```tsx
import React from 'react';
import { View } from 'react-native';
import { RichTextInput } from 'react-native-richify';

export default function App() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <RichTextInput
        placeholder="Write something..."
        showToolbar
        showOutputPreview
        defaultOutputFormat="markdown"
        onChangeText={(text) => console.log('Plain text:', text)}
        onChangeOutput={(output, format) =>
          console.log(`Serialized ${format}:`, output)
        }
      />
    </View>
  );
}
```

This gives you:

- a visible auto-growing `TextInput`
- a horizontally scrollable toolbar
- a collapsible output panel that opens when content exists
- Markdown output by default, with HTML and rendered preview toggles in the toolbar

## How Editing Works

The editor stores content as `StyledSegment[]`, not HTML strings. The plain text you type is always the source of truth for editing, and formatting metadata is applied to matching text ranges or lines.

Formatting rules:

- If no text is selected, pressing a style button affects the next characters you type.
- If text is selected, pressing a style button formats the selected range immediately.
- Headings, lists, and alignment are line-level controls.
- Every formatting button is toggleable except the output controls: `MD`, `HTML`, `Raw`, and `View`.

## Built-in Toolbar

The default toolbar includes these controls:

| Button | Purpose |
| --- | --- |
| `B` | Toggle bold |
| `I` | Toggle italic |
| `U` | Toggle underline |
| `S` | Toggle strikethrough |
| `<>` | Toggle inline code |
| `H1`, `H2`, `H3` | Toggle heading level on the current line |
| `•≡` | Toggle bullet list on the current line |
| `1≡` | Toggle ordered list on the current line |
| `🔗` | Apply or clear a hyperlink on the current selection |
| `⇤`, `↔`, `⇥` | Toggle left, center, or right alignment on the current line |
| `MD`, `HTML` | Switch serialized output format |
| `Raw`, `View` | Switch between literal serialized output and rendered preview |

Notes:

- Pressing the active heading again removes that heading.
- Pressing the active list or alignment button again clears it.
- The toolbar is horizontally scrollable by default.
- Image insertion is not part of the built-in toolbar right now.

## Output Panel

The panel below the input can show either:

- literal serialized output (`Raw`)
- rendered rich output (`View`)

It can serialize as either:

- Markdown
- HTML

Useful props:

| Prop | Description |
| --- | --- |
| `showOutputPreview` | Show or hide the output panel entirely |
| `outputFormat` | Controlled output format |
| `defaultOutputFormat` | Initial output format for uncontrolled usage |
| `outputPreviewMode` | Controlled preview mode: `'literal'` or `'rendered'` |
| `defaultOutputPreviewMode` | Initial preview mode for uncontrolled usage |
| `maxOutputHeight` | Max height of the output panel before it scrolls |
| `onChangeOutput` | Called whenever serialized output changes |
| `onChangeOutputFormat` | Called when toolbar output format changes |
| `onChangeOutputPreviewMode` | Called when toolbar preview mode changes |

Example:

```tsx
import React, { useState } from 'react';
import { RichTextInput, type OutputFormat } from 'react-native-richify';

export function ControlledOutputEditor() {
  const [format, setFormat] = useState<OutputFormat>('html');

  return (
    <RichTextInput
      outputFormat={format}
      onChangeOutputFormat={setFormat}
      defaultOutputPreviewMode="rendered"
      maxOutputHeight={220}
      onChangeOutput={(output) => {
        console.log(output);
      }}
    />
  );
}
```

## Links

Link formatting is selection-based. Select text, then press the link button.

There are two ways to use it:

1. Provide `onRequestLink` and show your own prompt, sheet, or modal.
2. Rely on the built-in fallback, which only auto-links when the selected text already looks like a URL, domain, or email address.

Custom link flow:

```tsx
<RichTextInput
  onRequestLink={({ selectedText, currentUrl, applyLink }) => {
    console.log('Selected:', selectedText);
    console.log('Existing URL:', currentUrl);

    // Replace this with your own modal, bottom sheet, or form.
    applyLink('https://example.com');
  }}
/>
```

If the selection already has a link, pressing the link button clears it.

## Sizing and TextInput Behavior

`RichTextInput` uses a normal visible `TextInput`.

- `minHeight` controls the minimum editor height.
- `maxHeight` limits the editor height before the input itself scrolls.
- `maxOutputHeight` limits the output panel height before the preview scrolls.
- `textInputProps` lets you pass through additional native `TextInput` props.

Example:

```tsx
<RichTextInput
  minHeight={140}
  maxHeight={280}
  maxOutputHeight={200}
  textInputProps={{
    autoCapitalize: 'sentences',
    keyboardType: 'default',
  }}
/>
```

## API Overview

### `<RichTextInput />`

Most common props:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `initialSegments` | `StyledSegment[]` | empty content | Initial document value |
| `onChangeSegments` | `(segments) => void` | - | Called with the rich document model |
| `onChangeText` | `(text) => void` | - | Called with plain text |
| `placeholder` | `string` | `"Start typing..."` | Placeholder text |
| `showToolbar` | `boolean` | `true` | Show the built-in toolbar |
| `toolbarPosition` | `'top' \| 'bottom'` | `'top'` | Place toolbar above or below the editor |
| `toolbarItems` | `ToolbarItem[]` | default items | Replace the built-in toolbar item list |
| `theme` | `RichTextTheme` | default theme | Visual overrides |
| `showOutputPreview` | `boolean` | `true` | Enable the output panel |
| `multiline` | `boolean` | `true` | Standard `TextInput` multiline editing |
| `minHeight` | `number` | `120` | Minimum editor height |
| `maxHeight` | `number` | - | Maximum editor height before scrolling |
| `autoFocus` | `boolean` | `false` | Focus input on mount |
| `textInputProps` | `TextInputProps` subset | - | Additional native input props |
| `renderToolbar` | `(props) => ReactElement` | - | Render a completely custom toolbar |
| `onReady` | `(actions) => void` | - | Access editor actions outside the toolbar |

### Actions from `onReady` or `useRichText`

| Action | Description |
| --- | --- |
| `toggleFormat(format)` | Toggle `bold`, `italic`, `underline`, `strikethrough`, or `code` |
| `setHeading(level)` | Toggle `h1`, `h2`, `h3`, or clear with `none` |
| `setListType(type)` | Toggle `bullet`, `ordered`, or clear with `none` |
| `setTextAlign(align)` | Toggle `left`, `center`, or `right` alignment |
| `setLink(url?)` | Apply or clear hyperlink formatting |
| `setColor(color)` | Set text color |
| `setBackgroundColor(color)` | Set highlight color |
| `setFontSize(size)` | Set font size |
| `handleTextChange(text)` | Sync plain text input changes |
| `handleSelectionChange(selection)` | Sync `TextInput` selection changes |
| `isFormatActive(format)` | Check active state for inline formats |
| `getSelectionStyle()` | Read the common style for the current selection |
| `getOutput(format?)` | Serialize current content as Markdown or HTML |
| `getPlainText()` | Get plain text only |
| `exportJSON()` | Export the current segment array |
| `importJSON(segments)` | Replace content from a saved segment array |
| `clear()` | Reset the editor |

## Custom Toolbar

Use `toolbarItems` when you only want to replace the built-in buttons, or `renderToolbar` when you want full control.

### `toolbarItems`

Supported built-in item fields:

- `format`
- `heading`
- `listType`
- `textAlign`
- `outputFormat`
- `outputPreviewMode`
- `actionType: 'link'`
- `onPress`
- `renderButton`

Example:

```tsx
<RichTextInput
  toolbarItems={[
    { id: 'bold', label: 'B', format: 'bold' },
    { id: 'h1', label: 'H1', heading: 'h1' },
    { id: 'bullet', label: '•≡', listType: 'bullet' },
    { id: 'center', label: '↔', textAlign: 'center' },
    { id: 'html', label: 'HTML', outputFormat: 'html' },
    { id: 'link', label: '🔗', actionType: 'link' },
  ]}
/>
```

### `renderToolbar`

Use `renderToolbar` if you need a custom layout or your own button components.

```tsx
<RichTextInput
  renderToolbar={({
    actions,
    outputFormat,
    outputPreviewMode,
    onOutputFormatChange,
    onOutputPreviewModeChange,
  }) => (
    <>
      <MyButton onPress={() => actions.toggleFormat('bold')} label="Bold" />
      <MyButton onPress={() => actions.setHeading('h2')} label="Heading" />
      <MyButton
        onPress={() => onOutputFormatChange('html')}
        label={outputFormat === 'html' ? 'HTML on' : 'HTML'}
      />
      <MyButton
        onPress={() => onOutputPreviewModeChange('rendered')}
        label={outputPreviewMode === 'rendered' ? 'Preview on' : 'Preview'}
      />
    </>
  )}
/>
```

## Theming

The theme object lets you style the editor container, input, toolbar, output panel, and button states.

```tsx
<RichTextInput
  theme={{
    colors: {
      primary: '#0F766E',
      background: '#FFFFFF',
      text: '#0F172A',
      placeholder: '#94A3B8',
      toolbarBackground: '#F8FAFC',
      toolbarBorder: '#CBD5E1',
      link: '#0EA5E9',
      cursor: '#0F766E',
    },
    containerStyle: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#CBD5E1',
    },
    outputContainerStyle: {
      marginHorizontal: 12,
      marginBottom: 12,
      padding: 12,
      borderRadius: 12,
      backgroundColor: '#F8FAFC',
    },
    toolbarButtonActiveStyle: {
      backgroundColor: '#CCFBF1',
    },
  }}
/>
```

Useful theme keys:

- `containerStyle`
- `inputStyle`
- `baseTextStyle`
- `outputContainerStyle`
- `outputLabelStyle`
- `outputTextStyle`
- `renderedOutputStyle`
- `toolbarStyle`
- `toolbarButtonStyle`
- `toolbarButtonActiveStyle`
- `toolbarButtonTextStyle`
- `toolbarButtonActiveTextStyle`
- `codeStyle`
- `colors.primary`
- `colors.link`

## Headless Hook

Use `useRichText` when you want to build your own editor UI.

```tsx
import React from 'react';
import { TextInput, View, Button } from 'react-native';
import { useRichText } from 'react-native-richify';

export function HeadlessEditor() {
  const { state, actions } = useRichText({
    onChangeText: (text) => console.log(text),
  });

  return (
    <View>
      <Button title="Bold" onPress={() => actions.toggleFormat('bold')} />
      <Button title="Bullet" onPress={() => actions.setListType('bullet')} />
      <TextInput
        multiline
        value={actions.getPlainText()}
        onChangeText={actions.handleTextChange}
        onSelectionChange={(event) =>
          actions.handleSelectionChange(event.nativeEvent.selection)
        }
        style={{ minHeight: 120, borderWidth: 1, padding: 12 }}
      />
    </View>
  );
}
```

## Context API

`RichTextProvider` and `useRichTextContext()` are for custom UIs built on the hook.

Important: the shipped `<RichTextInput />` manages its own state. Wrapping it in `RichTextProvider` does not automatically bind it to external context state.

Use context when you want to split a custom editor into multiple components:

```tsx
import React from 'react';
import { Button, TextInput, View } from 'react-native';
import {
  RichTextProvider,
  useRichTextContext,
} from 'react-native-richify';

function ToolbarRow() {
  const { actions } = useRichTextContext();
  return <Button title="Italic" onPress={() => actions.toggleFormat('italic')} />;
}

function EditorField() {
  const { actions } = useRichTextContext();

  return (
    <TextInput
      multiline
      value={actions.getPlainText()}
      onChangeText={actions.handleTextChange}
      onSelectionChange={(event) =>
        actions.handleSelectionChange(event.nativeEvent.selection)
      }
      style={{ minHeight: 120, borderWidth: 1, padding: 12 }}
    />
  );
}

export function SplitEditor() {
  return (
    <RichTextProvider>
      <View>
        <ToolbarRow />
        <EditorField />
      </View>
    </RichTextProvider>
  );
}
```

## Data Model

Content is stored as segments:

```ts
type StyledSegment = {
  text: string;
  styles: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    heading?: 'h1' | 'h2' | 'h3' | 'none';
    listType?: 'bullet' | 'ordered' | 'none';
    textAlign?: 'left' | 'center' | 'right';
    link?: string;
  };
};
```

This makes it easy to:

- store and restore content with `exportJSON()` and `importJSON()`
- inspect formatting state in your own UI
- serialize on demand to Markdown or HTML

Example:

```tsx
const saved = actions.exportJSON();
actions.importJSON(saved);

const markdown = actions.getOutput('markdown');
const html = actions.getOutput('html');
```

## Current Scope

Stable built-in features documented above are the recommended way to use the library.

- Rich text formatting, headings, lists, links, alignment, theming, and output serialization are supported.
- The built-in toolbar does not currently expose image insertion.

## Contributing

See [AGENTS.md](AGENTS.md) for contributor notes and repository workflow guidance.

## License

MIT
