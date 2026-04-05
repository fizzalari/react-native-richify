# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the library source. Key areas are `components/` for UI (`RichTextInput`, `Toolbar`, `OverlayText`), `hooks/` for editor state, `utils/` for parsing/formatting, `constants/` for theme defaults, `types/` for the public API, and `context/` for `RichTextProvider`. `__tests__/` mirrors the source layout with Jest tests for components, hooks, and utilities. `lib/` is generated build output from `bob`; do not hand-edit it.

This package is built around an overlay editor: a transparent `TextInput` captures input while formatted text renders underneath. Keep changes aligned with that model.

## Build, Test, and Development Commands
- `npm test`: run the full Jest suite.
- `npm run test:watch`: rerun tests during local work.
- `npm run test:coverage`: collect coverage for `src/**/*.{ts,tsx}`.
- `npm run lint`: run TypeScript in strict no-emit mode.
- `npm run build`: generate `lib/commonjs`, `lib/module`, and `lib/typescript` with `react-native-builder-bob`.

The pre-commit hook runs `npm test` and `npm run build`, so keep both green before opening a PR.

## Coding Style & Naming Conventions
Use TypeScript with strict typing. Avoid `any`. Prefer React function components, `React.memo()` for exported UI components, and set `displayName` on memoized components. Use `PascalCase` for component files, `useX` for hooks, and `camelCase` for utilities and variables. Match the existing style: 2-space indentation, single quotes, trailing commas, and relative imports inside `src/`.

If you change public types, keep `src/**/*.d.ts` and generated declarations in sync by running `npm run build`.

## Testing Guidelines
Tests use Jest with `@testing-library/react-native`. Add or update tests in the matching `__tests__/` subfolder, for example `src/hooks/useRichText.ts` -> `__tests__/hooks/useRichText.test.ts`. Cover behavior changes, not just snapshots, especially for selection handling, formatting toggles, and text reconciliation.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit prefixes such as `feat:` and `fix:`. Keep commits short, imperative, and scoped, for example `fix: preserve selection styles on replace`.

PRs should include a clear summary, linked issue if applicable, test coverage for behavior changes, and screenshots or recordings for toolbar/editor UI changes. Note any API or type-surface changes explicitly.
