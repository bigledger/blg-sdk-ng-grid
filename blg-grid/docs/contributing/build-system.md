# Build System Guide

**Audience: Library Developers and Contributors**

This guide explains the BLG Grid build system, which uses Nx workspace tooling to manage multiple libraries, build processes, and development workflows. Understanding the build system is essential for contributors working on the library.

## Table of Contents

- [Nx Workspace Overview](#nx-workspace-overview)
- [Project Structure](#project-structure)
- [Build Configuration](#build-configuration)
- [Build Processes](#build-processes)
- [Library Publishing](#library-publishing)
- [Development Builds](#development-builds)
- [Production Builds](#production-builds)
- [Build Optimization](#build-optimization)
- [Troubleshooting](#troubleshooting)

## Nx Workspace Overview

BLG Grid uses Nx for monorepo management, providing:

- **Incremental builds**: Only rebuild what changed
- **Dependency graph**: Understand project relationships
- **Code sharing**: Shared utilities across libraries
- **Consistent tooling**: Standardized build, test, lint processes
- **Caching**: Speed up builds with intelligent caching

### Key Nx Concepts

```typescript
// nx.json - Workspace configuration
{
  "targetDefaults": {
    "build": {
      "cache": true,
      "dependsOn": ["^build"]
    },
    "test": {
      "cache": true
    }
  },
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint"]
      }
    }
  }
}
```

## Project Structure

### Workspace Layout

```
blg-grid/
├── libs/                    # Libraries (the main packages)
│   ├── core/               # @blg-grid/core
│   ├── grid/               # @blg-grid/grid  
│   ├── column/             # @blg-grid/column
│   ├── row/                # @blg-grid/row
│   ├── cell/               # @blg-grid/cell
│   ├── data/               # @blg-grid/data
│   └── theme/              # @blg-grid/theme
├── apps/                   # Applications
│   └── grid-demo/          # Demo application
├── dist/                   # Build output
├── tools/                  # Build tools and utilities
├── nx.json                 # Nx workspace configuration
├── package.json            # Root package.json
└── tsconfig.base.json      # Base TypeScript configuration
```

### Library Structure

Each library follows a consistent structure:

```
libs/core/
├── src/
│   ├── lib/               # Library source code
│   │   ├── services/      # Services and business logic
│   │   ├── interfaces/    # TypeScript interfaces
│   │   ├── utilities/     # Helper functions
│   │   └── index.ts       # Public API exports
│   ├── index.ts           # Main entry point
│   └── test-setup.ts      # Test configuration
├── project.json           # Nx project configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.lib.json      # Library-specific TypeScript config
├── tsconfig.spec.json     # Test TypeScript configuration
├── jest.config.ts         # Jest test configuration
├── README.md              # Library documentation
└── ng-package.json        # Angular build configuration
```

## Build Configuration

### Library Build Configuration

Each library has a `project.json` file defining build targets:

```json
// libs/core/project.json
{
  "name": "core",
  "projectType": "library",
  "sourceRoot": "libs/core/src",
  "prefix": "blg",
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "outputs": [
        "{workspaceRoot}/dist/libs/core"
      ],
      "options": {
        "project": "libs/core/ng-package.json"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/core/tsconfig.lib.prod.json"
        }
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": [
        "{workspaceRoot}/coverage/libs/core"
      ],
      "options": {
        "jestConfig": "libs/core/jest.config.ts",
        "passWithNoTests": true
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint",
      "outputs": [
        "{options.outputFile}"
      ],
      "options": {
        "lintFilePatterns": [
          "libs/core/**/*.ts",
          "libs/core/**/*.html"
        ]
      }
    }
  }
}
```

### ng-package.json Configuration

Angular libraries use ng-packagr for building:

```json
// libs/core/ng-package.json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/libs/core",
  "lib": {
    "entryFile": "src/index.ts"
  },
  "whitelistedNonPeerDependencies": [
    "tslib"
  ]
}
```

### TypeScript Configuration

```json
// libs/core/tsconfig.lib.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "declaration": true,
    "declarationMap": true,
    "inlineSources": true,
    "types": []
  },
  "exclude": [
    "src/test-setup.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "jest.config.ts"
  ],
  "include": [
    "src/**/*.ts"
  ]
}
```

## Build Processes

### Development Build Process

1. **Dependency Resolution**: Nx analyzes project dependencies
2. **Incremental Compilation**: Only builds changed libraries
3. **Type Checking**: TypeScript compilation with strict checks
4. **Asset Processing**: Copies and processes assets
5. **Bundle Generation**: Creates library bundles

```bash
# Build specific library
nx build core

# Build with dependencies
nx build grid  # Automatically builds core if needed

# Build all libraries
nx run-many --target=build --all

# Watch mode for development
nx build core --watch
```

### Build Order

Nx automatically determines build order based on dependencies:

```
core (no dependencies)
  ↓
data (depends on core)
  ↓
column (depends on core, data)
  ↓
row (depends on core, data)
  ↓
cell (depends on core, data)
  ↓
grid (depends on core, data, column, row, cell)
```

### Build Output Structure

```
dist/libs/core/
├── esm2022/           # ES2022 modules
├── fesm2022/          # Flat ES2022 modules  
├── lib/               # CommonJS modules
├── index.d.ts         # Type definitions
├── package.json       # NPM package metadata
└── README.md          # Documentation
```

## Library Publishing

### Package.json Generation

Each library gets a generated package.json for publishing:

```json
// dist/libs/core/package.json (generated)
{
  "name": "@blg-grid/core",
  "version": "1.0.0",
  "main": "./bundles/blg-grid-core.umd.min.js",
  "fesm2022": "./fesm2022/blg-grid-core.mjs",
  "fesm2015": "./fesm2015/blg-grid-core.mjs", 
  "esm2022": "./esm2022/blg-grid-core.mjs",
  "typings": "./index.d.ts",
  "module": "./fesm2022/blg-grid-core.mjs",
  "es2022": "./fesm2022/blg-grid-core.mjs",
  "peerDependencies": {
    "@angular/common": "^17.0.0 || ^18.0.0",
    "@angular/core": "^17.0.0 || ^18.0.0"
  }
}
```

### Publishing Workflow

```bash
# Build all libraries for publishing
npm run build

# Publish to npm (after build)
npm run publish

# Or publish individual library
nx publish core --registry=https://registry.npmjs.org/
```

### Versioning Strategy

- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **Synchronized Versions**: All libraries use same version
- **Automated Versioning**: CI/CD handles version bumps

## Development Builds

### Fast Development Builds

```bash
# Build with development optimizations
nx build core --configuration=development

# Watch mode for live rebuilding
nx build core --watch

# Build affected projects only
nx affected:build
```

### Development Configuration

```json
// Development build optimizations
{
  "configurations": {
    "development": {
      "buildOptimizer": false,
      "optimization": false,
      "sourceMap": true,
      "extractCss": true,
      "namedChunks": true
    }
  }
}
```

## Production Builds

### Optimized Production Builds

```bash
# Production build with all optimizations
nx build core --configuration=production

# Build all libraries for production
nx run-many --target=build --all --configuration=production
```

### Production Optimizations

- **Tree Shaking**: Remove unused code
- **Minification**: Compress JavaScript and CSS
- **Bundle Optimization**: Optimize bundle sizes
- **Source Maps**: Generate for debugging
- **Type Declarations**: Generate .d.ts files

### Bundle Analysis

```bash
# Generate bundle statistics
nx build grid --stats-json

# Analyze bundle with webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/libs/grid/stats.json
```

## Build Optimization

### Caching Strategy

Nx provides intelligent caching:

```bash
# Clear cache if needed
nx reset

# Show cache information
nx show projects --with-target=build
```

### Incremental Builds

```bash
# Only build what changed
nx affected:build --base=main

# Parallel building
nx run-many --target=build --all --parallel=3
```

### Build Performance Tips

1. **Use affected commands** during development
2. **Enable caching** for consistent builds
3. **Limit parallel builds** based on system resources
4. **Use watch mode** for active development
5. **Clean builds** when configuration changes

## Troubleshooting

### Common Build Issues

#### TypeScript Compilation Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.tsc_cache

# Rebuild with verbose output
nx build core --verbose
```

#### Dependency Issues

```bash
# Visualize project dependencies
nx dep-graph

# Check circular dependencies
nx lint --rule=no-circular-dependencies
```

#### Cache Problems

```bash
# Clear all caches
nx reset

# Clear specific project cache
rm -rf node_modules/.cache/nx

# Disable cache temporarily
nx build core --skip-nx-cache
```

#### Memory Issues

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=8192"
nx build grid

# Build with less parallelism
nx run-many --target=build --all --parallel=1
```

### Build Performance Issues

#### Slow Builds

```bash
# Profile build performance
nx build core --profile

# Check what's being rebuilt unnecessarily
nx show projects --affected --base=HEAD~1
```

#### Large Bundle Sizes

```bash
# Analyze bundle composition
nx build grid --stats-json
npx webpack-bundle-analyzer dist/libs/grid/stats.json

# Check for duplicate dependencies
npm ls --depth=0 | grep -v deduped
```

### Debugging Build Process

#### Verbose Logging

```bash
# Enable verbose logging
nx build core --verbose

# Debug Nx execution
NX_VERBOSE_LOGGING=true nx build core
```

#### Build Step Analysis

```bash
# Show build execution plan
nx build core --dry-run

# Profile individual build steps
nx build core --profile
```

### Environment-Specific Issues

#### CI/CD Build Failures

```bash
# Reproduce CI environment locally
npm ci  # Instead of npm install
nx run ci:test  # Run full CI test suite
```

#### Local vs CI Differences

```bash
# Check Node/npm versions match CI
node --version
npm --version

# Use same commands as CI
npm run ci:test
```

## Advanced Build Configuration

### Custom Build Executors

```typescript
// tools/executors/custom-build/impl.ts
import { ExecutorContext } from '@nx/devkit';

export interface CustomBuildExecutorOptions {
  command: string;
  outputPath: string;
}

export default async function runExecutor(
  options: CustomBuildExecutorOptions,
  context: ExecutorContext
) {
  // Custom build logic
  console.log('Running custom build...');
  
  return {
    success: true
  };
}
```

### Build Hooks

```json
// project.json
{
  "targets": {
    "build": {
      "executor": "@nx/angular:ng-packagr-lite",
      "options": {
        "project": "libs/core/ng-package.json"
      },
      "configurations": {
        "production": {
          "hooks": {
            "pre": ["lint", "test"],
            "post": ["copy-assets"]
          }
        }
      }
    }
  }
}
```

## Next Steps

To learn more about related topics:

- [Development Setup](./development-setup.md) - Setting up your development environment
- [Testing Guide](./testing-guide.md) - Testing in the build pipeline
- [Code Standards](./code-standards.md) - Code quality in builds
- [Release Process](./release-process.md) - Publishing and deployment

Understanding the build system enables you to work effectively with the BLG Grid library and contribute improvements to the build process itself.