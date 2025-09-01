# Development Setup Guide

**Audience: Library Developers and Contributors**

This guide will help you set up your development environment for contributing to BLG Grid. Follow these steps to get your local development environment ready for productive work on the library codebase.

## Prerequisites

### Required Software

Before setting up the project, ensure you have these tools installed:

#### Node.js and npm
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher

```bash
# Check your versions
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

**Installation options:**
- [Node.js official installer](https://nodejs.org/)
- [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) - Recommended for managing multiple Node versions
- [Volta](https://volta.sh/) - Another Node version manager option

#### Git
Git 2.x or higher for version control.

```bash
git --version
```

#### Angular CLI (Optional but Recommended)
```bash
npm install -g @angular/cli
ng version
```

### Recommended Development Tools

#### Code Editors
- **Visual Studio Code** (recommended)
  - Angular Language Service extension
  - TypeScript Importer extension  
  - Prettier extension
  - ESLint extension

#### Browser Development Tools
- Chrome DevTools or Firefox Developer Tools
- Angular DevTools browser extension

## Project Setup

### 1. Fork and Clone the Repository

```bash
# Fork the repository on GitHub first, then clone your fork
git clone https://github.com/YOUR_USERNAME/blg-sdk-ng-grid.git
cd ng-ui-lib

# Add the upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/blg-sdk-ng-grid.git
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install
```

This will install:
- Angular framework dependencies
- Nx workspace tools
- Development dependencies (ESLint, Prettier, Jest, Playwright)
- Build tools and utilities

### 3. Verify Installation

```bash
# Verify the build system works
npm run build

# Check that tests run
npm run test

# Start the development server
npm run serve
```

The development server should start at `http://localhost:4200`. You should see the BLG Grid demo application with various grid examples.

## Development Environment Configuration

### VS Code Setup

If using VS Code, create/update `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.nx": true,
    "**/coverage": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.nx": true,
    "**/coverage": true
  }
}
```

Recommended VS Code extensions:
```json
{
  "recommendations": [
    "angular.ng-template",
    "ms-vscode.vscode-typescript-next", 
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "nrwl.angular-console"
  ]
}
```

### Git Hooks Setup

The project uses Husky for Git hooks (if configured):

```bash
# If Husky is configured, install hooks
npm run prepare
```

This sets up:
- Pre-commit hooks for linting and formatting
- Pre-push hooks for running tests
- Commit message validation

## Nx Workspace Overview

BLG Grid uses Nx for managing the monorepo structure. Key Nx concepts:

### Libraries Structure
```
libs/
├── core/           # @ng-ui-lib/core - Core services and interfaces
├── grid/           # @ng-ui-lib/grid - Main grid component
├── column/         # @ng-ui-lib/column - Column management
├── row/            # @ng-ui-lib/row - Row components
├── cell/           # @ng-ui-lib/cell - Cell components  
├── data/           # @ng-ui-lib/data - Data services
└── theme/          # @ng-ui-lib/theme - Theming system
```

### Key Nx Commands

```bash
# Build specific library
nx build core
nx build grid

# Test specific library
nx test core
nx test grid

# Run all tests
nx run-many --target=test --all

# Lint specific library
nx lint core

# View dependency graph
nx dep-graph

# Generate new library or component
nx g @nx/angular:library new-lib
nx g @nx/angular:component new-component --project=core
```

## Development Scripts

The following npm scripts are available for development:

### Building
```bash
# Build all libraries
npm run build

# Build specific library
npm run build:grid
npm run build:core
```

### Testing
```bash
# Unit tests (Jest)
npm run test
npm run test:watch

# E2E tests (Playwright)
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui

# Performance tests
npm run test:performance

# Visual regression tests
npm run test:visual

# All tests (CI pipeline)
npm run ci:test
```

### Development Server
```bash
# Start demo app
npm run serve

# Start with production configuration
npm run serve:prod
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format
npm run format:check
```

### Advanced Development
```bash
# Dependency graph visualization
npm run dep-graph

# Affected projects analysis
npm run affected:build
npm run affected:test

# Playground for testing
npm run playwright:codegen
npm run playwright:ui
```

## Common Development Tasks

### Adding a New Feature

1. **Create feature branch**:
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Identify target library**:
   - Core functionality → `libs/core`
   - Grid-specific → `libs/grid`  
   - Column-related → `libs/column`
   - etc.

3. **Generate component/service** (if needed):
   ```bash
   nx g @nx/angular:component feature-name --project=grid
   nx g @nx/angular:service feature-name --project=core
   ```

4. **Implement with tests**:
   ```bash
   # Run tests in watch mode while developing
   nx test grid --watch
   ```

### Working with Dependencies

```bash
# Install new dependency
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### Debugging

#### Jest Tests
```bash
# Debug specific test file
npm run test -- --testNamePattern="test name"

# Run tests with coverage
npm run test -- --coverage
```

#### E2E Tests
```bash
# Run with browser visible
npm run test:e2e:headed

# Debug mode with breakpoints
npm run test:e2e:debug

# Interactive UI mode
npm run test:e2e:ui
```

#### Build Issues
```bash
# Clear Nx cache
nx reset

# Clean install
rm -rf node_modules package-lock.json
npm install

# Verbose build output
nx build grid --verbose
```

## Performance Optimization

### Development Build Performance
```bash
# Use production build for testing performance
npm run serve:prod

# Analyze bundle size
nx build grid --stats-json
npx webpack-bundle-analyzer dist/libs/grid/stats.json
```

### Memory Usage
```bash
# Increase Node memory if needed
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# If port 4200 is busy, specify different port
nx serve grid-demo --port 4201
```

#### TypeScript Errors After Dependency Updates
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run build
```

#### Jest Test Memory Issues
```bash
# Run with increased memory
node --max-old-space-size=8192 ./node_modules/.bin/jest
```

#### Nx Cache Issues
```bash
# Clear all Nx caches
nx reset

# Clear specific target cache  
nx reset --target=build
```

### Getting Help

- **Nx Documentation**: [nx.dev](https://nx.dev)
- **Angular Documentation**: [angular.io](https://angular.io)
- **Project Issues**: Check existing GitHub issues
- **Development Questions**: Start a GitHub discussion

## Next Steps

Now that your development environment is set up:

1. Read the [Architecture Overview](./architecture-overview.md) to understand the codebase
2. Review [Code Standards](./code-standards.md) for coding conventions
3. Check [Testing Guide](./testing-guide.md) for testing requirements
4. Look at existing issues labeled "good first issue" to get started

Happy coding! 🎉