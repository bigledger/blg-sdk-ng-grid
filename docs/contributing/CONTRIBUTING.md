# Contributing to BLG Grid

**Audience: Library Developers and Contributors**

Thank you for considering contributing to BLG Grid! This guide will help you get started with contributing to our Angular grid library. This document is specifically for developers who want to contribute code, documentation, or improvements to the library itself.

> **Note**: If you're a library user looking for API documentation, examples, or usage guides, please see our [User Documentation](../README.md) instead.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Getting Help](#getting-help)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful, inclusive, and professional in all interactions.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **Git**
- **Angular CLI** (optional, but recommended)

### Initial Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/blg-sdk-ng-grid.git
   cd ng-ui-lib
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run serve
   ```

5. **Verify the setup** by opening http://localhost:4200 in your browser

For detailed setup instructions, see [Development Setup Guide](./development-setup.md).

## Development Workflow

### Branch Strategy

- **main**: Production-ready code, protected branch
- **develop**: Integration branch for features (if used)
- **feature/**: New features (`feature/virtual-scrolling-improvements`)
- **fix/**: Bug fixes (`fix/sorting-memory-leak`)
- **docs/**: Documentation updates (`docs/api-reference-updates`)

### Typical Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our [coding standards](./code-standards.md)

3. **Write tests** for your changes (see [Testing Guide](./testing-guide.md))

4. **Run the test suite**:
   ```bash
   npm run ci:test
   ```

5. **Commit your changes** with conventional commit messages:
   ```bash
   git commit -m "feat(grid): add virtual scrolling performance optimization"
   ```

6. **Push to your fork** and create a pull request

## Project Structure

BLG Grid uses Nx workspace architecture with multiple libraries:

```
libs/
├── core/           # Core services, interfaces, and utilities
├── grid/           # Main grid component and grid-specific logic  
├── column/         # Column-related components and services
├── row/            # Row-related components and services
├── cell/           # Cell-related components and services
├── data/           # Data processing and management
└── theme/          # Theming and styling utilities

apps/
└── grid-demo/      # Demo application for testing and examples

docs/               # Documentation (users and contributors)
e2e/               # End-to-end tests
```

For a deep dive into the architecture, see [Architecture Overview](./architecture-overview.md).

## Making Changes

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug fixes**: Fix issues or unexpected behavior
- **✨ New features**: Add functionality that enhances the library
- **⚡ Performance improvements**: Optimize existing code
- **📝 Documentation**: Improve or add documentation
- **🧪 Tests**: Add or improve test coverage
- **🎨 Styling**: Improve UI/UX or themes
- **♿ Accessibility**: Improve accessibility features

### Before You Start

1. **Check existing issues** to see if your idea is already being discussed
2. **Create an issue** to discuss major changes before implementing
3. **Review our [architecture overview](./architecture-overview.md)** to understand the codebase
4. **Check our [testing requirements](./testing-guide.md)** for the type of change you're making

### Code Guidelines

- Follow [Angular style guide](https://angular.io/guide/styleguide)
- Use TypeScript strictly (no `any` unless absolutely necessary)
- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- Add JSDoc comments for public APIs
- Follow our [code standards](./code-standards.md)

## Testing

Testing is crucial for library stability. We require:

- **Unit tests** for all new functionality
- **Integration tests** for component interactions
- **E2E tests** for user workflows
- **Performance tests** for performance-critical changes

See our [Testing Guide](./testing-guide.md) for detailed testing requirements and examples.

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e

# All tests (what CI runs)
npm run ci:test

# Performance tests
npm run test:performance

# Visual regression tests
npm run test:visual
```

## Documentation

We maintain two types of documentation:

### User Documentation (`docs/`)
For library users: API references, examples, guides, and tutorials.

### Contributor Documentation (`docs/contributing/`)
For library developers: architecture, development setup, testing, etc.

When contributing:
- Update user docs for new features or API changes
- Update contributor docs for architecture or process changes
- Include code examples and screenshots where helpful
- Keep documentation clear and up-to-date

## Pull Request Process

### Before Submitting

- [ ] Code follows our style guidelines
- [ ] Self-review your code changes
- [ ] Add/update tests for your changes
- [ ] Update documentation if needed
- [ ] Verify all tests pass locally
- [ ] Commit messages follow conventional format

### PR Requirements

1. **Clear description**: Explain what and why, not just how
2. **Link to issue**: Reference related GitHub issue(s)
3. **Screenshots**: For UI changes, include before/after images
4. **Breaking changes**: Clearly document any breaking changes
5. **Reviewer assignment**: Request review from maintainers

### PR Template

When creating a PR, use this template:

```markdown
## Description
Brief description of changes and motivation.

Fixes #(issue number)

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass  
- [ ] Manual testing completed
- [ ] Performance impact assessed

## Screenshots (if applicable)
Include screenshots for UI changes.
```

### Review Process

1. **Automated checks** must pass (CI, linting, tests)
2. **Code review** by at least one maintainer
3. **Manual testing** for complex changes
4. **Documentation review** for user-facing changes

## Release Process

Releases are managed by maintainers following [semantic versioning](https://semver.org/). For details, see [Release Process](./release-process.md).

Contributors should:
- Indicate if changes are breaking in PR description
- Update CHANGELOG.md if contributing breaking changes
- Follow conventional commit format for automatic changelog generation

## Getting Help

### Resources

- [Development Setup](./development-setup.md) - Getting your development environment ready
- [Architecture Overview](./architecture-overview.md) - Understanding the codebase structure  
- [Testing Guide](./testing-guide.md) - Writing and running tests
- [Code Standards](./code-standards.md) - Coding conventions and best practices

### Communication

- **GitHub Issues**: Bug reports, feature requests, questions
- **GitHub Discussions**: General questions and community discussions
- **Pull Request Comments**: Code-specific discussions

### Maintainers

Current maintainers who can help with questions:

- [@maintainer1](https://github.com/maintainer1) - Core architecture
- [@maintainer2](https://github.com/maintainer2) - Performance and testing
- [@maintainer3](https://github.com/maintainer3) - Documentation and UX

## Thank You!

Your contributions help make BLG Grid better for everyone. Whether you're fixing a typo, implementing a major feature, or improving documentation, every contribution is valuable and appreciated.

Happy coding! 🚀