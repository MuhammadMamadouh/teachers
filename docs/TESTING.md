# Testing Setup

This project includes automated testing to ensure code quality and functionality before deployment.

## Test Scripts

- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode for development
- `npm run lint` - Check code quality with ESLint
- `npm run lint:fix` - Fix linting issues automatically
- `npm run build` - Build the project for production

## Test Structure

- `tests/Pages/` - Component tests for React pages
- `tests/utils.test.js` - Utility function tests

## CI/CD Pipeline

The GitHub Actions workflow runs the following steps:

1. **Test** - Runs all tests to ensure functionality
2. **Lint** - Checks code quality and style
3. **Build** - Builds the project for production
4. **Deploy** - Deploys if all previous steps pass

## What We Test

- Basic component functionality
- RTL (Arabic) text handling
- Data structure validation
- Utility functions (email validation, currency formatting)
- RTL text detection

## Technologies Used

- **Vitest** - Fast unit test framework
- **React Testing Library** - React component testing utilities
- **jsdom** - DOM simulation for testing
- **ESLint** - Code linting and formatting

## Running Tests Locally

```bash
# Install dependencies
npm ci

# Run tests
npm run test

# Run tests with watch mode
npm run test:watch

# Run the full CI pipeline
npm run test && npm run lint && npm run build
```

The tests are designed to be simple and focused on core functionality, avoiding complex component rendering that would require extensive mocking.
