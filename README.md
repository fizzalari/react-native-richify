# react-native-richify

A production-grade, fully customizable React Native Rich Text Input using the **Overlay Technique** — no WebView required.

[![npm version](https://img.shields.io/npm/v/react-native-richify.svg)](https://www.npmjs.com/package/react-native-richify)
[![license](https://img.shields.io/npm/l/react-native-richify.svg)](https://github.com/user/react-native-richify/blob/main/LICENSE)

## Features

- 🚀 **No WebView** — Pure React Native components (TextInput + Text overlay)
- 📝 **Rich Formatting** — Bold, italic, underline, strikethrough, code
- 🎨 **Text & Background Colors** — Full color customization
- 📐 **Font Sizes & Headings** — H1, H2, H3 presets + custom sizes
- 🔧 **Fully Customizable Toolbar** — Default toolbar + render props for full control
- 🎭 **Theming** — Complete theme system with plug-and-play defaults
- 💾 **Serialization** — Export/import as JSON
- 📦 **TypeScript First** — Full type definitions out of the box
- 🪝 **Headless Hook** — `useRichText` for building custom UIs
- 🌐 **Context API** — `RichTextProvider` for nested component access

## Installation

```bash
npm install react-native-richify
# or
yarn add react-native-richify
```

No native dependencies required. Works with Expo and bare React Native.

## Quick Start

```tsx
import React from 'react';
import { View } from 'react-native';
import { RichTextInput } from 'react-native-richify';

export default function App() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <RichTextInput
        placeholder="Start typing..."
        showToolbar
        onChangeText={(text) => console.log('Plain text:', text)}
        onChangeSegments={(segments) => console.log('Segments:', segments)}
      />
    </View>
  );
}
```

That's it! You get a fully functional rich text editor with default styling.

## API Reference

### `<RichTextInput />`

The main component. Drop it in and it works.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialSegments` | `StyledSegment[]` | `[]` | Initial content |
| `onChangeSegments` | `(segments: StyledSegment[]) => void` | — | Called when content changes |
| `onChangeText` | `(text: string) => void` | — | Called with plain text |
| `placeholder` | `string` | `"Start typing..."` | Placeholder text |
| `editable` | `boolean` | `true` | Whether input is editable |
| `maxLength` | `number` | — | Max character length |
| `showToolbar` | `boolean` | `true` | Show formatting toolbar |
| `toolbarPosition` | `'top' \| 'bottom'` | `'top'` | Toolbar position |
| `toolbarItems` | `ToolbarItem[]` | Default items | Custom toolbar items |
| `theme` | `RichTextTheme` | Default theme | Theme overrides |
| `multiline` | `boolean` | `true` | Enable multiline |
| `minHeight` | `number` | `120` | Minimum editor height |
| `maxHeight` | `number` | — | Maximum editor height |
| `autoFocus` | `boolean` | `false` | Auto-focus on mount |
| `renderToolbar` | `(props) => ReactElement` | — | Custom toolbar renderer |
| `onReady` | `(actions: RichTextActions) => void` | — | Called with action methods |

### `useRichText(options?)`

Headless hook for building custom UIs.

```tsx
import { useRichText } from 'react-native-richify';

function MyEditor() {
  const { state, actions } = useRichText({
    onChangeText: (text) => console.log(text),
  });

  return (
    <>
      <Button title="Bold" onPress={() => actions.toggleFormat('bold')} />
      <TextInput
        value={actions.getPlainText()}
        onChangeText={actions.handleTextChange}
        onSelectionChange={(e) =>
          actions.handleSelectionChange(e.nativeEvent.selection)
        }
      />
    </>
  );
}
```

### `<RichTextProvider>` & `useRichTextContext()`

Share state across the component tree:

```tsx
import { RichTextProvider, useRichTextContext } from 'react-native-richify';

function CustomToolbar() {
  const { state, actions } = useRichTextContext();
  return <Button title="B" onPress={() => actions.toggleFormat('bold')} />;
}

function App() {
  return (
    <RichTextProvider onChangeText={console.log}>
      <CustomToolbar />
      <RichTextInput showToolbar={false} />
    </RichTextProvider>
  );
}
```

### Actions

| Method | Description |
|--------|-------------|
| `toggleFormat(format)` | Toggle bold/italic/underline/strikethrough/code |
| `setColor(color)` | Set text color |
| `setBackgroundColor(color)` | Set highlight color |
| `setFontSize(size)` | Set font size |
| `setHeading(level)` | Set heading (h1/h2/h3/none) |
| `handleTextChange(text)` | Process text input changes |
| `handleSelectionChange(sel)` | Process selection changes |
| `getPlainText()` | Get plain text content |
| `exportJSON()` | Export segments as JSON |
| `importJSON(segments)` | Import segments from JSON |
| `clear()` | Clear all content |

## Theming

Customize every aspect of the editor:

```tsx
<RichTextInput
  theme={{
    colors: {
      primary: '#8B5CF6',
      background: '#1F2937',
      text: '#F9FAFB',
      placeholder: '#6B7280',
      toolbarBackground: '#374151',
      toolbarBorder: '#4B5563',
      cursor: '#8B5CF6',
    },
    containerStyle: {
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#4B5563',
    },
    toolbarButtonActiveStyle: {
      backgroundColor: '#4C1D95',
    },
  }}
/>
```

## Custom Toolbar

```tsx
<RichTextInput
  toolbarItems={[
    { id: 'bold', label: 'B', format: 'bold' },
    { id: 'italic', label: 'I', format: 'italic' },
    {
      id: 'custom',
      label: '🎨',
      onPress: () => showColorPicker(),
    },
    {
      id: 'render',
      label: 'Custom',
      renderButton: ({ active, onPress }) => (
        <MyCustomButton active={active} onPress={onPress} />
      ),
    },
  ]}
/>
```

## Data Model

Content is stored as an array of `StyledSegment` objects:

```typescript
interface StyledSegment {
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
  };
}
```

## How It Works

The **Overlay Technique** layers two components:

1. **Bottom**: A `<Text>` component renders the styled/formatted text
2. **Top**: A transparent `<TextInput>` captures user input and selection

Both layers use identical font metrics so text aligns perfectly. The user sees the formatted text from the bottom layer while typing into the invisible top layer.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © react-native-richify contributors
