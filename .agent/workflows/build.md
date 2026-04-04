---
description: How to build the react-native-richify library
---

# Build Workflow

## Prerequisites
- Node.js >= 18
- npm >= 9

## Steps

1. Install dependencies
```bash
npm install
```

2. Build the TypeScript source
```bash
npm run build
```

3. Verify the build output exists in `lib/` directory

## Build Output
- `lib/` — Compiled JavaScript + type declarations
- `lib/commonjs/` — CommonJS modules
- `lib/module/` — ES modules
- `lib/typescript/` — Type declarations
