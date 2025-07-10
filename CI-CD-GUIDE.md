# Teachers SaaS CI/CD Pipeline

This document describes the comprehensive CI/CD pipeline setup for the Teachers SaaS application.

## Pipeline Overview

The CI/CD pipeline consists of 9 stages that run automatically on every push to the main branch:

### 1. **Code Quality & Static Analysis**
- PHP syntax checking
- Code style validation with PHP-CS-Fixer
- Static analysis with PHPStan
- Security vulnerability scanning
- Dependency audit

### 2. **Frontend Build & Assets**
- Node.js dependency installation
- ESLint code quality checks
- Asset compilation and optimization
- Artifact storage for deployment

### 3. **Test Suite (Matrix Strategy)**
- Multi-version PHP testing (8.2, 8.3)
- Parallel test execution (Unit, Feature, Integration)
- MySQL and Redis service containers
- Test coverage collection

### 4. **Full Test Coverage**
- Complete test suite execution
- Minimum 90% coverage requirement
- Custom test runner validation
- Coverage reporting to Codecov

### 5. **Security Scanning**
- Trivy vulnerability scanner
- CodeQL security analysis
- SARIF report generation
- GitHub Security tab integration

### 6. **Docker Build**
- Multi-platform image building (AMD64, ARM64)
- Docker image optimization
- Container registry push
- Build cache optimization

### 7. **Deployment**
- Staging environment deployment
- Health check validation
- Slack notifications
- Production deployment (on main branch)

### 8. **Performance Testing**
- Lighthouse CI integration
- Performance metrics collection
- Accessibility auditing
- SEO optimization checks

### 9. **Cleanup**
- Artifact cleanup
- Resource optimization
- Storage management

## Required Secrets

Configure these secrets in your GitHub repository settings:

### Docker Registry
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password or access token

### Notifications
- `SLACK_WEBHOOK_URL`: Slack webhook for deployment notifications

### Performance Testing
- `LHCI_GITHUB_APP_TOKEN`: Lighthouse CI GitHub App token

## Configuration Files

### Code Quality Tools

#### `.php-cs-fixer.php`
PHP Code Sniffer configuration for consistent code formatting:
- PSR-12 compliance
- Array syntax standardization
- Import optimization
- Trailing comma enforcement

#### `phpstan.neon`
PHPStan static analysis configuration:
- Level 6 analysis
- Laravel-specific rules
- Error exclusions for framework code
- Bootstrap file configuration

### Docker Configuration

#### `Dockerfile`
Multi-stage production-ready container:
- PHP 8.2 FPM Alpine base
- Nginx web server
- Supervisor process management
- Security optimizations
- Health check endpoint

#### `docker-compose.yml`
Local development environment:
- Application container
- MySQL database
- Redis cache
- Nginx proxy
- Volume persistence

### Performance Testing

#### `lighthouserc.js`
Lighthouse CI configuration:
- Performance thresholds
- Accessibility requirements
- SEO optimization checks
- Best practices validation

## Pipeline Features

### ✅ **Comprehensive Testing**
- 177 tests with 589 assertions
- Unit, Feature, and Integration test suites
- Multi-PHP version compatibility
- Database and Redis integration testing

### ✅ **Security First**
- Automated vulnerability scanning
- Dependency security auditing
- Static code analysis
- Container security scanning

### ✅ **Quality Assurance**
- Code style enforcement
- Static analysis with PHPStan
- ESLint for JavaScript
- Performance monitoring

### ✅ **Automated Deployment**
- Zero-downtime deployments
- Health check validation
- Rollback capabilities
- Multi-environment support

### ✅ **Monitoring & Notifications**
- Slack integration
- Test coverage reporting
- Performance metrics
- Security alerts

## Usage

### Triggering the Pipeline

The pipeline runs automatically on:
- Push to `main` branch
- Pull requests to `main` branch

### Manual Deployment

For manual deployments, use the GitHub Actions interface:
1. Go to Actions tab
2. Select "Teachers SaaS CI/CD Pipeline"
3. Click "Run workflow"
4. Select branch and environment

### Viewing Results

Monitor pipeline execution:
- **Actions tab**: Overall pipeline status
- **Security tab**: Security scan results
- **Pull requests**: Integration with PR checks
- **Slack**: Deployment notifications

## Local Development

### Prerequisites

- Docker and Docker Compose
- PHP 8.2+
- Node.js 18+
- Composer
- NPM

### Setup

1. Clone the repository
2. Copy environment file: `cp .env.example .env`
3. Start services: `docker-compose up -d`
4. Install dependencies: `composer install && npm install`
5. Run migrations: `php artisan migrate`
6. Build assets: `npm run dev`

### Running Tests Locally

```bash
# All tests
php artisan test

# Specific test suite
php artisan test tests/Unit/
php artisan test tests/Feature/
php artisan test tests/Integration/

# With coverage
php artisan test --coverage

# Custom test runner
php test-runner.php
```

### Code Quality Checks

```bash
# PHP syntax check
find app/ -name "*.php" -exec php -l {} \;

# Code style fix
vendor/bin/php-cs-fixer fix

# Static analysis
vendor/bin/phpstan analyse

# Security check
composer audit
```

## Environment Configurations

### Development
- Debug mode enabled
- Detailed error reporting
- Local database and Redis
- Asset hot reloading

### Staging
- Production-like environment
- Limited debug information
- External database
- Performance monitoring

### Production
- Optimized for performance
- Error logging only
- Cached configurations
- Security headers
- SSL/TLS encryption

## Troubleshooting

### Common Issues

1. **Test Failures**
   - Check database connectivity
   - Verify environment variables
   - Review test isolation

2. **Build Failures**
   - Check PHP/Node versions
   - Verify dependency compatibility
   - Review error logs

3. **Deployment Issues**
   - Validate secrets configuration
   - Check network connectivity
   - Review deployment logs

### Getting Help

- Check GitHub Issues for known problems
- Review pipeline logs in Actions tab
- Contact development team for support
- Refer to deployment documentation

## Best Practices

### Code Quality
- Follow PSR-12 coding standards
- Write comprehensive tests
- Use static analysis tools
- Implement security best practices

### CI/CD Management
- Keep pipelines fast and efficient
- Use caching for dependencies
- Monitor resource usage
- Implement proper error handling

### Security
- Regular dependency updates
- Automated security scanning
- Proper secret management
- Access control and auditing

## Monitoring and Metrics

### Application Metrics
- Test coverage percentage
- Performance benchmarks
- Error rates and response times
- User activity analytics

### Infrastructure Metrics
- Build times and success rates
- Deployment frequency
- Mean time to recovery (MTTR)
- Resource utilization

### Security Metrics
- Vulnerability detection rates
- Compliance scores
- Security scan results
- Incident response times

## Continuous Improvement

The CI/CD pipeline is continuously evolving. We regularly:
- Update tools and dependencies
- Optimize build performance
- Enhance security measures
- Improve test coverage
- Refine deployment processes

For suggestions or improvements, please create an issue or submit a pull request.
