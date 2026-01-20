# Contributing Guidelines

Thank you for your interest in contributing to this project! Please follow these guidelines to ensure a smooth contribution process.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Security Guidelines](#security-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher)
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/rohithilluri.github.io.git
   cd rohithilluri.github.io
   ```
3. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```
4. Create a `.env` file in the `client` directory (see `.env.example` if available)
5. Start the development server:
   ```bash
   npm start
   ```

## Security Guidelines

### CRITICAL: Never Commit Secrets

- **API keys, tokens, passwords, and credentials must NEVER be committed**
- Use environment variables for all sensitive configuration
- Check your commits before pushing to ensure no secrets are included

### Environment Variables

All sensitive configuration should use the `REACT_APP_*` prefix:

```bash
# Example .env file (DO NOT commit actual values)
REACT_APP_SPOTIFY_CLIENT_ID=your_client_id
REACT_APP_SPOTIFY_CLIENT_SECRET=your_client_secret
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_TMDB_API_KEY=your_tmdb_key
REACT_APP_GITHUB_USERNAME=your_github_username
```

### Security Checklist Before Submitting PR

- [ ] No hardcoded secrets, API keys, or credentials
- [ ] No `.env` files committed
- [ ] New dependencies reviewed for known vulnerabilities (`npm audit`)
- [ ] User inputs are validated and sanitized
- [ ] No use of `dangerouslySetInnerHTML` without proper sanitization
- [ ] External URLs are validated before use
- [ ] No sensitive data logged to console in production code

### Dependency Security

1. Before adding new dependencies:
   - Check the package's security history on npm
   - Review the package's GitHub issues for security concerns
   - Prefer well-maintained packages with regular updates

2. Run security audit:
   ```bash
   npm audit
   ```

3. Fix vulnerabilities:
   ```bash
   npm audit fix
   ```

### Reporting Security Issues

If you discover a security vulnerability, please **DO NOT** create a public issue. Instead, follow the process outlined in [SECURITY.md](./SECURITY.md).

## Pull Request Process

### Before Submitting

1. Create a feature branch from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the coding standards below

3. Run tests:
   ```bash
   cd client && npm test
   ```

4. Run linting:
   ```bash
   cd client && npm run lint
   ```

5. Build to ensure no errors:
   ```bash
   cd client && npm run build
   ```

### PR Requirements

1. **Clear title**: Describe what the PR does
2. **Description**: Explain the changes and why they're needed
3. **Tests**: Include tests for new functionality
4. **Documentation**: Update docs if needed
5. **Security review**: Ensure no security issues are introduced

### PR Review Process

1. All PRs require review from a code owner
2. Security-sensitive changes require additional scrutiny
3. CI checks must pass before merging
4. Address all review comments before merge

## Coding Standards

### JavaScript/React

- Use functional components with hooks
- Follow React best practices
- Use meaningful variable and function names
- Keep components small and focused

### CSS/Tailwind

- Use Tailwind utility classes when possible
- Follow mobile-first responsive design
- Maintain consistent spacing and sizing

### File Structure

```
client/src/
├── components/
│   ├── sections/     # Page sections (Hero, Skills, etc.)
│   ├── github/       # GitHub-related components
│   ├── layout/       # Layout components (Sidebar, Nav, Footer)
│   └── ui/           # Reusable UI components
├── constants/        # Configuration and constants
├── utils/            # Utility functions and API helpers
└── assets/           # Static assets
```

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(music): add Spotify integration
fix(projects): resolve image loading issue
docs(readme): update installation instructions
chore(deps): update React to v19
```

## Questions?

If you have questions about contributing, feel free to open a discussion or reach out.

Thank you for contributing!
