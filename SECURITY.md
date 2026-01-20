# Security Policy

## Supported Versions

This is a personal portfolio website. Security updates are applied to the latest version only.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| Older   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Send a detailed report via email or create a private security advisory

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if available)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity and complexity

### Severity Levels

| Level    | Description                                    | Response Time |
| -------- | ---------------------------------------------- | ------------- |
| Critical | Data exposure, XSS, injection vulnerabilities  | 24-48 hours   |
| High     | Authentication bypass, sensitive data leakage  | 3-5 days      |
| Medium   | Configuration issues, minor data exposure      | 1-2 weeks     |
| Low      | Best practice violations, minor improvements   | Next release  |

## Security Best Practices

### For Contributors

1. **Never commit secrets**: API keys, tokens, or credentials must never be committed
2. **Use environment variables**: All sensitive configuration should use `REACT_APP_*` env vars
3. **Validate inputs**: Always validate and sanitize user inputs
4. **Keep dependencies updated**: Regularly run `npm audit` and update vulnerable packages
5. **Review code changes**: All PRs should be reviewed for security implications

### Environment Variables

This project uses the following environment variables (never commit actual values):

```
REACT_APP_SPOTIFY_CLIENT_ID=<your-client-id>
REACT_APP_SPOTIFY_CLIENT_SECRET=<your-client-secret>
REACT_APP_SPOTIFY_REDIRECT_URI=<your-redirect-uri>
REACT_APP_TMDB_API_KEY=<your-api-key>
REACT_APP_GITHUB_USERNAME=<your-username>
```

### Client-Side Security Considerations

Since this is a React application deployed as a static site:

1. **API Keys**: Client-side API keys are exposed in the browser. Only use keys with appropriate restrictions
2. **CORS**: Be aware of CORS policies when making API requests
3. **Content Security Policy**: Consider implementing CSP headers via your hosting provider
4. **XSS Prevention**: React escapes values by default, but be cautious with `dangerouslySetInnerHTML`

## Dependency Management

- Dependencies are monitored via Dependabot (GitHub's automated security updates)
- Run `npm audit` before each release to check for vulnerabilities
- Update dependencies regularly, especially those with known security issues

## Security Checklist for Releases

- [ ] Run `npm audit` and address any vulnerabilities
- [ ] Ensure no secrets are committed in the codebase
- [ ] Verify environment variables are properly configured
- [ ] Review any new dependencies for security implications
- [ ] Test authentication flows if applicable
- [ ] Validate all external API integrations

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve this project's security.
