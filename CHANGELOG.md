# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-05

### Added
- Initial release
- `RichTextInput` component with overlay technique (TextInput + Text layers)
- Formatting support: bold, italic, underline, strikethrough, code
- Text and background color customization
- Font size control
- Heading presets (H1, H2, H3)
- `Toolbar` component with default items and full customization
- `ToolbarButton` component with custom render support
- `OverlayText` component for styled text rendering
- `useRichText` hook for headless usage
- `useSelection` hook for selection tracking
- `useFormatting` hook for formatting commands
- `RichTextProvider` and `useRichTextContext` for context-based access
- Default theme with plug-and-play styling
- Full TypeScript support with exported types
- JSON serialization (export/import)
- Comprehensive test suite
