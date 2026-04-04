---
description: How to publish react-native-richify to npm
---

# Publish Workflow

## Pre-publish Checklist
1. Ensure all tests pass
2. Update version in `package.json`
3. Update CHANGELOG.md
4. Build the library

## Steps

1. Run tests
```bash
npm test
```

2. Build the library
```bash
npm run build
```

3. Dry run publish to verify package contents
```bash
npm pack --dry-run
```

4. Publish to npm
```bash
npm publish
```

## Versioning
- Follow semantic versioning (semver)
- Breaking changes → major version bump
- New features → minor version bump
- Bug fixes → patch version bump
