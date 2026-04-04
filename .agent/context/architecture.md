# react-native-richify Architecture

## Overlay Technique
- **Bottom layer**: `<Text>` component renders styled/formatted text segments
- **Top layer**: Transparent `<TextInput>` captures user input and selection
- Both layers use identical font metrics for pixel-perfect alignment

## Key Design Decisions
- No WebView — pure React Native components only
- Segment-based model: text is stored as an array of `StyledSegment` objects
- Each segment carries its own formatting styles (bold, italic, color, etc.)
- Formatting is applied by splitting/merging segments at selection boundaries
- Serializable state for save/restore (JSON format)

## State Model
```typescript
interface StyledSegment {
  text: string;
  styles: FormatStyle;
}
```

The entire rich text content is `StyledSegment[]` — an ordered array of segments where each segment has uniform formatting.

## Component Hierarchy
```
RichTextInput
├── OverlayText (absolute positioned, renders styled segments)
├── TextInput (transparent, on top, captures input)
└── Toolbar (optional, formatting controls)
```

## Public API Surface
- `RichTextInput` — main component
- `Toolbar` — standalone toolbar
- `useRichText` — headless hook for custom UIs
- `RichTextProvider` / `useRichTextContext` — context-based access
- Types: all exported from `types/index.ts`
