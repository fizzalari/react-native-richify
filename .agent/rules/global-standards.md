---
description: Global Standards and Security Rules
---

# Global Standards & Security Rules

## Tech Stack & Versions
- **React**: Ensure React is v19+ for optimal rendering efficiency and security.
- **React Native**: Maintain React Native at v0.84+ for modern mobile performance support.
- **TypeScript**: Rely on strictly-typed features. Do not use `any` unless absolutely necessary.
- **Testing**: Jest paired with React Native Testing Library.

## Coding Style & Structure
- **Path Aliases**: Always use `@/*` to map to `src/*` for imports instead of relative paths (`../` or `./`).
- **Component Design**: Functional components + React hooks strictly. No class-based components.
- **Pure RN**: Do not use WebView based editors. Use React Native constructs seamlessly to limit XSS and vulnerability vectors natively.

## Security Practices (Vulnerability Prevention)
- **Dependency Tracking**: Always run `npm audit` frequently to check dependencies for known vulnerabilities and patch them.
- **Injection Attacks Prevention**: Since this package builds a text editor, ensure any imported JSON representation (e.g. `importJSON`) strictly structures `StyledSegment` with bounded fields. While React Native `<Text>` nodes are naturally protected from HTML-based XSS, validating external serialized strings guarantees the app memory bounds are stable.
- **State Integrity**: Reconciling new texts must limit unexpected deep iteration.
