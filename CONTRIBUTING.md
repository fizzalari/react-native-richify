# Contributing to react-native-richify

Thank you for your interest in contributing! This document provides guidelines and instructions.

## Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/user/react-native-richify.git
cd react-native-richify
```

2. **Install dependencies**
```bash
npm install
```

3. **Run tests**
```bash
npm test
```

4. **Type check**
```bash
npm run lint
```

5. **Build**
```bash
npm run build
```

## Project Structure

```
src/
├── index.ts                 # Public API exports
├── types/                   # TypeScript interfaces & types
├── constants/               # Default styles, theme, toolbar items
├── context/                 # React Context (RichTextProvider)
├── utils/
│   ├── parser.ts            # Text segmentation & reconciliation
│   ├── formatter.ts         # Style toggle/apply logic
│   └── styleMapper.ts       # FormatStyle → RN TextStyle
├── hooks/
│   ├── useRichText.ts       # Main state management hook
│   ├── useSelection.ts      # Selection tracking
│   └── useFormatting.ts     # Formatting commands
└── components/
    ├── RichTextInput.tsx     # Main component
    ├── OverlayText.tsx       # Styled text renderer
    ├── Toolbar.tsx           # Formatting toolbar
    └── ToolbarButton.tsx     # Toolbar button
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add/update tests as needed
5. Ensure all tests pass (`npm test`)
6. Ensure types are correct (`npm run lint`)
7. Commit with a descriptive message
8. Push to your fork and submit a Pull Request

## Coding Standards

- **TypeScript**: All code must be fully typed. No `any` types unless absolutely necessary.
- **Testing**: All new features must include unit tests. Aim for high coverage.
- **Components**: Use `React.memo()` for performance. Use `displayName` for debugging.
- **Hooks**: Follow React hooks naming conventions (`use*`).
- **Formatting**: Use consistent code style (prettier/eslint recommended).

## Commit Messages

Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Build/tooling changes

## Reporting Issues

When filing issues, include:
- React Native version
- Platform (iOS/Android)
- Steps to reproduce
- Expected vs actual behavior
- Code snippets if applicable

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
