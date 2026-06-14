# Contributing to Health & Fitness App

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Style Guides](#style-guides)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/health-fitness-app.git`
3. Add upstream remote: `git remote add upstream https://github.com/original/health-fitness-app.git`

## Development Setup

### Prerequisites

- Node.js 20+
- MySQL 8.4+
- Redis 7+
- Docker & Docker Compose (optional)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npx prisma generate
npm run dev
```

### Mobile Setup

```bash
cd mobile
cp .env.example .env
# Edit .env with your configuration
npm install
npx expo start
```

### Running Tests

```bash
# Backend tests
cd backend
npm run test

# Mobile tests
cd mobile
npm run test
```

## Making Changes

### Branch Naming

- `feature/` - New features (e.g., `feature/user-workouts`)
- `fix/` - Bug fixes (e.g., `fix/login-redirect`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-module`)
- `docs/` - Documentation updates

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user workout history
fix: resolve login timeout issue
docs: update API documentation
style: format code with prettier
refactor: extract auth service
test: add unit tests for users service
chore: update dependencies
```

### Pull Request Process

1. Create a new branch from `develop`
2. Make your changes
3. Add/update tests as needed
4. Ensure all tests pass
5. Update documentation if needed
6. Submit a pull request

## Style Guides

### TypeScript

- Use strict TypeScript
- Prefer interfaces over type aliases for object shapes
- Use `const` over `let` over `var`
- Use async/await over raw promises
- Use named exports over default exports for utilities

### React Native

- Use functional components with hooks
- Use Zustand for state management
- Follow atomic design for components
- Use `testID` props for testing

### Backend

- Use service pattern for business logic
- Use DTOs for input validation (Zod)
- Use Prisma for database access
- Follow REST conventions for API design

## Testing Guidelines

### Unit Tests

- Test behavior, not implementation
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

### Integration Tests

- Test API endpoints end-to-end
- Use real database transactions
- Clean up test data after each test

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be descriptive in issue descriptions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
