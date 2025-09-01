# Release Process

**Audience: Library Maintainers and Core Contributors**

This document outlines the release process for the BLG Grid library, including versioning strategy, release workflows, and deployment procedures. This information is primarily for maintainers who have release permissions.

## Table of Contents

- [Release Philosophy](#release-philosophy)
- [Versioning Strategy](#versioning-strategy)
- [Release Types](#release-types)
- [Pre-Release Process](#pre-release-process)
- [Release Workflow](#release-workflow)
- [Post-Release Process](#post-release-process)
- [Hotfix Process](#hotfix-process)
- [Release Automation](#release-automation)
- [Documentation Updates](#documentation-updates)
- [Communication Strategy](#communication-strategy)

## Release Philosophy

### Core Principles

1. **Predictable Releases**: Regular, scheduled releases with clear timelines
2. **Semantic Versioning**: Strict adherence to semver principles
3. **Quality First**: All releases must meet quality gates
4. **Backward Compatibility**: Breaking changes only in major releases
5. **Clear Communication**: Transparent release notes and migration guides
6. **Automated Testing**: Comprehensive CI/CD pipeline validation

### Release Schedule

- **Major Releases**: 6-12 months (breaking changes, new features)
- **Minor Releases**: 4-6 weeks (new features, enhancements)
- **Patch Releases**: 1-2 weeks or as needed (bug fixes, security updates)
- **Pre-releases**: As needed for testing (alpha, beta, rc)

## Versioning Strategy

### Semantic Versioning (SemVer)

We follow [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

Examples:
1.0.0        - Initial release
1.1.0        - New feature
1.1.1        - Bug fix
2.0.0        - Breaking change
2.0.0-beta.1 - Pre-release
2.0.0+20231215 - Build metadata
```

### Version Increment Rules

#### MAJOR (Breaking Changes)
- API signature changes
- Removed public APIs
- Changed default behaviors
- Angular version requirements
- Minimum Node.js version changes

```typescript
// Example: Breaking change in v2.0.0
// Before (v1.x.x)
interface ColumnDefinition {
  id: string;
  field: string;
  header: string;
}

// After (v2.0.0) - Added required property
interface ColumnDefinition {
  id: string;
  field: string;
  header: string;
  type: ColumnType; // New required property
}
```

#### MINOR (New Features)
- New public APIs
- New optional parameters
- New components or services
- Performance improvements
- Deprecation notices (not removals)

```typescript
// Example: Minor change in v1.2.0
interface GridConfig {
  columns: ColumnDefinition[];
  // ... existing properties
  
  // New optional feature
  virtualScrolling?: VirtualScrollConfig; // Added in v1.2.0
}
```

#### PATCH (Bug Fixes)
- Bug fixes that don't change API
- Documentation updates
- Internal refactoring
- Security patches
- Performance optimizations (non-breaking)

### Library Versioning

All BLG Grid libraries are versioned together:

```json
{
  "@blg-grid/core": "1.2.3",
  "@blg-grid/grid": "1.2.3",
  "@blg-grid/column": "1.2.3",
  "@blg-grid/row": "1.2.3",
  "@blg-grid/cell": "1.2.3",
  "@blg-grid/data": "1.2.3",
  "@blg-grid/theme": "1.2.3"
}
```

## Release Types

### 1. Stable Release (Production)

```bash
# Standard release versions
1.0.0, 1.1.0, 1.1.1, 2.0.0
```

**Characteristics:**
- Fully tested and validated
- Complete documentation
- Migration guides for breaking changes
- Published to npm with `latest` tag

### 2. Pre-Release Versions

#### Alpha Releases
```bash
2.0.0-alpha.1, 2.0.0-alpha.2
```
- Early development builds
- May have incomplete features
- Internal testing only
- Published with `alpha` tag

#### Beta Releases
```bash
2.0.0-beta.1, 2.0.0-beta.2
```
- Feature complete but may have bugs
- Community testing encouraged
- API likely to change
- Published with `beta` tag

#### Release Candidates
```bash
2.0.0-rc.1, 2.0.0-rc.2
```
- Production ready candidates
- Final testing phase
- API stable unless critical issues found
- Published with `rc` tag

### 3. Hotfix Releases

```bash
1.2.4, 1.2.5 (patches on stable branch)
```
- Critical bug fixes only
- Minimal changes to reduce risk
- Fast-track release process

## Pre-Release Process

### 1. Release Planning

```markdown
## Release Planning Checklist

### 6 Weeks Before Release
- [ ] Create release milestone
- [ ] Identify target features/fixes
- [ ] Review breaking changes
- [ ] Plan migration guides
- [ ] Schedule code freeze

### 4 Weeks Before Release
- [ ] Feature development deadline
- [ ] Begin release branch preparation
- [ ] Update documentation
- [ ] Start migration guide drafts

### 2 Weeks Before Release
- [ ] Code freeze for non-critical changes
- [ ] Intensive testing phase
- [ ] Community beta testing
- [ ] Finalize release notes

### 1 Week Before Release
- [ ] Final validation
- [ ] Release candidate
- [ ] Documentation review
- [ ] Marketing preparation
```

### 2. Quality Gates

All releases must pass these quality gates:

#### Automated Checks
```bash
# All automated checks must pass
npm run ci:test           # Full test suite
npm run lint              # Code quality
npm run build             # Build verification
npm run test:e2e          # End-to-end tests
npm run test:performance  # Performance validation
npm run test:visual       # Visual regression
```

#### Manual Validation
- [ ] Feature functionality testing
- [ ] Cross-browser compatibility
- [ ] Accessibility compliance
- [ ] Performance benchmarks
- [ ] Documentation accuracy
- [ ] Example applications work

### 3. Release Branch Creation

```bash
# Create release branch from main
git checkout main
git pull origin main
git checkout -b release/v1.2.0

# Update version numbers
npm version 1.2.0 --no-git-tag-version

# Update package.json files in all libraries
# This is typically automated via script
./scripts/update-versions.sh 1.2.0

# Commit version updates
git add .
git commit -m "chore: bump version to 1.2.0"
git push origin release/v1.2.0
```

## Release Workflow

### 1. Automated Release Pipeline

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]
    paths: ['CHANGELOG.md']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build all packages
        run: npm run build
        
      - name: Run full test suite
        run: npm run ci:test
        
      - name: Create release
        run: npm run release
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 2. Manual Release Steps

#### Step 1: Final Preparation
```bash
# Switch to release branch
git checkout release/v1.2.0

# Final check of all changes
git log --oneline main..release/v1.2.0

# Run full validation
npm run ci:test
```

#### Step 2: Create Release Tag
```bash
# Create and push tag
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
```

#### Step 3: Build and Publish
```bash
# Clean build
npm run clean
npm run build

# Publish to npm
npm run publish:all
```

#### Step 4: Create GitHub Release
```bash
# Using GitHub CLI
gh release create v1.2.0 \
  --title "Release v1.2.0" \
  --notes-file CHANGELOG.md \
  --verify-tag
```

### 3. Release Script

```bash
#!/bin/bash
# scripts/release.sh

set -e

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

echo "🚀 Starting release process for version $VERSION"

# Validation
echo "📋 Running pre-release validation..."
npm run ci:test

# Build
echo "🔨 Building all packages..."
npm run build

# Update versions
echo "📝 Updating version numbers..."
npm version $VERSION --no-git-tag-version
./scripts/update-library-versions.sh $VERSION

# Commit and tag
echo "🏷️ Creating release commit and tag..."
git add .
git commit -m "chore: release version $VERSION"
git tag -a v$VERSION -m "Release version $VERSION"

# Publish
echo "📦 Publishing to npm..."
npm run publish:all

# Push changes
echo "⬆️ Pushing changes to remote..."
git push origin main --tags

# Create GitHub release
echo "🎉 Creating GitHub release..."
gh release create v$VERSION \
  --title "Release v$VERSION" \
  --notes-file CHANGELOG.md \
  --verify-tag

echo "✅ Release $VERSION completed successfully!"
```

## Post-Release Process

### 1. Merge Release Branch
```bash
# Merge release branch back to main
git checkout main
git merge release/v1.2.0 --no-ff
git push origin main

# Clean up release branch
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

### 2. Update Documentation
- [ ] Update getting started guides with new version
- [ ] Publish updated API documentation
- [ ] Update example applications
- [ ] Update migration guides

### 3. Communication
- [ ] Publish release announcement
- [ ] Update social media
- [ ] Notify key stakeholders
- [ ] Update community discussions

### 4. Monitor Release
- [ ] Monitor npm download statistics
- [ ] Watch for bug reports
- [ ] Monitor GitHub issues
- [ ] Track community feedback

## Hotfix Process

For critical bugs in production:

### 1. Create Hotfix Branch
```bash
# Branch from latest release tag
git checkout v1.2.0
git checkout -b hotfix/v1.2.1

# Apply fix
# ... make necessary changes ...

# Test thoroughly
npm run ci:test
```

### 2. Fast-Track Release
```bash
# Update version (patch increment)
npm version patch --no-git-tag-version

# Commit and tag
git add .
git commit -m "fix: critical bug in data processing"
git tag -a v1.2.1 -m "Hotfix version 1.2.1"

# Publish immediately
npm run build
npm run publish:all

# Push changes
git push origin hotfix/v1.2.1 --tags
```

### 3. Merge Back
```bash
# Merge hotfix to main
git checkout main
git merge hotfix/v1.2.1 --no-ff
git push origin main

# Clean up
git branch -d hotfix/v1.2.1
git push origin --delete hotfix/v1.2.1
```

## Release Automation

### Automated Version Management

```json
// package.json scripts
{
  "scripts": {
    "version:patch": "npm version patch --no-git-tag-version",
    "version:minor": "npm version minor --no-git-tag-version", 
    "version:major": "npm version major --no-git-tag-version",
    "version:prerelease": "npm version prerelease --no-git-tag-version",
    "release:prepare": "./scripts/prepare-release.sh",
    "release:publish": "./scripts/publish-release.sh",
    "release:complete": "./scripts/complete-release.sh"
  }
}
```

### Conventional Commits

We use conventional commits for automated changelog generation:

```bash
# Commit types that trigger releases
feat: new feature (minor release)
fix: bug fix (patch release) 
perf: performance improvement (patch release)
BREAKING CHANGE: breaking change (major release)

# Examples
feat(grid): add virtual scrolling support
fix(column): resolve header alignment issue
perf(data): optimize sorting algorithm
feat(grid)!: change default pagination size (breaking change)
```

### Changelog Generation

```bash
# Automated changelog generation
npm install -g conventional-changelog-cli

# Generate changelog for current version
conventional-changelog -p angular -i CHANGELOG.md -s

# Generate changelog for specific version
conventional-changelog -p angular -i CHANGELOG.md -s -r 0
```

## Documentation Updates

### Release Documentation Checklist

- [ ] **API Documentation**: Updated with new/changed APIs
- [ ] **Migration Guides**: Created for breaking changes
- [ ] **Examples**: Updated to use new features
- [ ] **Getting Started**: Updated with latest version numbers
- [ ] **Changelog**: Comprehensive list of changes
- [ ] **Breaking Changes**: Clearly documented with migration paths

### Migration Guide Template

```markdown
# Migration Guide: v1.x to v2.0

## Breaking Changes

### Changed API: ColumnDefinition Interface

**Before (v1.x)**:
```typescript
interface ColumnDefinition {
  id: string;
  field: string;
  header: string;
}
```

**After (v2.0)**:
```typescript
interface ColumnDefinition {
  id: string;
  field: string;
  header: string;
  type: ColumnType; // New required property
}
```

**Migration Steps**:
1. Add `type` property to all column definitions
2. Use appropriate `ColumnType` enum values
3. Update unit tests

**Automated Migration**:
```bash
# Run migration script
npx @blg-grid/migrations v1-to-v2
```

## New Features

### Virtual Scrolling Support

New optional configuration for improved performance:

```typescript
const config: GridConfig = {
  // ... existing config
  virtualScrolling: {
    enabled: true,
    itemHeight: 40,
    bufferSize: 10
  }
};
```

## Deprecated Features

### Column.width (Deprecated in v2.0, will be removed in v3.0)

Use the new `sizing` property instead:

```typescript
// Old (deprecated)
{ id: 'name', field: 'name', header: 'Name', width: 200 }

// New (recommended)
{ id: 'name', field: 'name', header: 'Name', sizing: { width: 200 } }
```
```

## Communication Strategy

### Release Announcement Template

```markdown
# 🎉 BLG Grid v1.2.0 Released!

We're excited to announce the release of BLG Grid v1.2.0, packed with new features, improvements, and bug fixes.

## ✨ New Features

- **Virtual Scrolling**: Handle large datasets with ease
- **Advanced Filtering**: New filter operators and UI
- **Keyboard Navigation**: Improved accessibility support

## 🐛 Bug Fixes

- Fixed memory leak in data processing
- Resolved column resizing edge cases
- Improved error handling in export functionality

## 📈 Performance Improvements

- 40% faster initial rendering
- Reduced memory usage during scrolling
- Optimized sort operations

## 🚀 Getting Started

```bash
npm install @blg-grid/grid@1.2.0
```

## 📚 Documentation

- [Migration Guide](./docs/migration/v1.1-to-v1.2.md)
- [New Features Guide](./docs/features/virtual-scrolling.md)
- [Full Changelog](./CHANGELOG.md)

## 🙏 Thank You

Special thanks to our contributors who made this release possible!

Happy coding! 🎊
```

### Communication Channels

- [ ] GitHub Releases page
- [ ] npm package changelog
- [ ] Project documentation site
- [ ] Developer blog/newsletter
- [ ] Social media announcements
- [ ] Community forums/Discord

This release process ensures high-quality, predictable releases that provide value to users while maintaining backward compatibility and clear communication about changes.