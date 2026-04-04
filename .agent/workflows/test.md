---
description: How to run tests for react-native-richify
---

# Test Workflow

## Steps

1. Install dependencies
```bash
npm install
```

2. Run all unit tests
```bash
npm test
```

3. Run tests in watch mode (development)
```bash
npm run test:watch
```

4. Run tests with coverage
```bash
npm run test:coverage
```

## Test Structure
- `__tests__/utils/` — Unit tests for parser, formatter, styleMapper
- `__tests__/hooks/` — Unit tests for custom hooks
- `__tests__/components/` — Component rendering tests
