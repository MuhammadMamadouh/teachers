# Deployment Guide

## Prerequisites

Before deploying the Teachers SaaS application, ensure you have:

- Docker and Docker Compose installed
- SSL certificates (for production)
- Database backup and restore procedures
- Monitoring and logging setup

## Environment Setup

### 1. Environment Variables

Copy and configure the environment file:

```bash
cp .env.example .env
```

Required environment variables:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY=` (generate with `php artisan key:generate`)
- `DB_*` database connection settings
- `REDIS_*` Redis connection settings
- `MAIL_*` email configuration
- `AWS_*` S3 storage settings (if using)

### 2. Database Setup

Run migrations and seeders:

```bash
php artisan migrate --force
php artisan db:seed --force
```

### 3. Storage Setup

Create storage links:

```bash
php artisan storage:link
```

Set proper permissions:

```bash
chmod -R 755 storage bootstrap/cache
```

## Deployment Methods

### Method 1: Docker Deployment

1. Build the Docker image:
```bash
docker build -t teachers-saas .
```

2. Run with Docker Compose:
```bash
docker-compose up -d
```

3. Run post-deployment commands:
```bash
docker-compose exec app php artisan migrate --force
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan route:cache
docker-compose exec app php artisan view:cache
```

### Method 2: Traditional Server Deployment

1. Upload files to server
2. Install dependencies:
```bash
composer install --no-dev --optimize-autoloader
npm ci --only=production
npm run build
```

3. Configure web server (Nginx/Apache)
4. Set up SSL certificates
5. Configure process manager (Supervisor)

## Post-Deployment Steps

### 1. Cache Optimization

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### 2. Queue Workers

Start queue workers:

```bash
php artisan queue:work --daemon --tries=3
```

### 3. Scheduler

Add to crontab:

```bash
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

### 4. Health Checks

Verify the deployment:

```bash
curl -f http://your-domain/health
```

## Monitoring

### Application Monitoring

- Set up application performance monitoring (APM)
- Configure error tracking (Sentry, Bugsnag)
- Monitor queue jobs and failures
- Track user activity and performance metrics

### Infrastructure Monitoring

- Server resource usage (CPU, memory, disk)
- Database performance and connections
- Redis memory usage
- Network connectivity and latency

### Logging

- Application logs: `storage/logs/laravel.log`
- Web server logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

## Backup Strategy

### Database Backups

Daily automated backups:

```bash
# MySQL backup
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > /backups/db_backup_$DATE.sql.gz
```

### File Backups

- Application files
- User uploads
- Configuration files
- SSL certificates

### Backup Retention

- Daily backups: Keep for 30 days
- Weekly backups: Keep for 12 weeks
- Monthly backups: Keep for 12 months
- Yearly backups: Keep permanently

## Security Considerations

### SSL/TLS Configuration

- Use strong cipher suites
- Enable HTTP/2
- Configure HSTS headers
- Implement certificate pinning

### Firewall Rules

- Allow only necessary ports (80, 443, 22)
- Restrict database access
- Block suspicious IP addresses
- Enable fail2ban for SSH protection

### Regular Updates

- Keep operating system updated
- Update PHP and extensions
- Update application dependencies
- Monitor security advisories

## Rollback Procedures

### Quick Rollback

1. Switch to previous Docker image:
```bash
docker-compose down
docker tag teachers-saas:previous teachers-saas:latest
docker-compose up -d
```

2. Restore database from backup:
```bash
mysql -u username -p database_name < backup_file.sql
```

### Emergency Procedures

- Maintenance mode: `php artisan down`
- Disable features: Use feature flags
- Scale down: Reduce server capacity
- Emergency contacts: Keep contact list updated

## Performance Optimization

### Application Level

- Enable OPcache
- Use Redis for caching and sessions
- Optimize database queries
- Implement CDN for static assets

### Server Level

- Configure PHP-FPM properly
- Optimize web server settings
- Use HTTP/2 and compression
- Implement load balancing

### Database Optimization

- Regular maintenance and optimization
- Monitor slow queries
- Implement proper indexing
- Use read replicas for scaling

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check application logs
   - Verify file permissions
   - Check database connectivity

2. **Queue Jobs Failing**
   - Restart queue workers
   - Check Redis connectivity
   - Review job logs

3. **Slow Performance**
   - Check server resources
   - Review database queries
   - Analyze application profiling

### Debug Tools

- Laravel Telescope (development only)
- Laravel Horizon (queue monitoring)
- Database query logging
- Application profiling tools
