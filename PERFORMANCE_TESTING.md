# Performance Testing Database Seeders

This project includes comprehensive database seeders designed for performance testing of the teacher SaaS platform.

## Overview

The seeders create realistic test data with proper relationships between teachers, students, groups, payments, and attendance records.

## Available Seeders

### 1. SmallTestSeeder
- **Purpose**: Quick testing and development
- **Data Volume**:
  - 10 teachers
  - 20 assistants (2 per teacher)
  - 50 groups (5 per teacher)
  - 500 students (50 per teacher, 10 per group)
  - 3,000 payment records (6 months per student)
  - 4,000 attendance records (2 months, 4 sessions per month)

### 2. PerformanceTestSeeder
- **Purpose**: Full-scale performance testing
- **Data Volume**:
  - 1,000 teachers
  - 2,000 assistants (2 per teacher)
  - 10,000 groups (10 per teacher)
  - 500,000 students (500 per teacher, ~50 per group)
  - 6,000,000 payment records (12 months per student)
  - 12,000,000 attendance records (3 months, 8 sessions per month)

### 3. PerformanceSeeder
- **Purpose**: Interactive seeder that lets you choose between small or large test
- Prompts you to select which test to run

## Usage

### Using the Performance Test Command (Recommended)

The easiest way to manage performance testing is using the custom Artisan command:

```bash
# Run small test (10 teachers, good for development)
php artisan performance:test small

# Run large test (1000 teachers, for performance testing)
php artisan performance:test large

# Verify data integrity and get statistics
php artisan performance:test verify

# Clear all test data (preserves admin users and plans)
php artisan performance:test clear

# Force operations without confirmation prompts
php artisan performance:test large --force
```

### Using Seeders Directly

#### Running Small Test (Recommended for Development)
```bash
php artisan db:seed --class=SmallTestSeeder
```

#### Running Performance Test (Warning: Large Data Set)
```bash
php artisan db:seed --class=PerformanceTestSeeder
```

#### Interactive Selection
```bash
php artisan db:seed --class=PerformanceSeeder
```

#### Data Verification
```bash
php artisan db:seed --class=DataVerificationSeeder
```

#### Clear Test Data
```bash
php artisan db:seed --class=ClearPerformanceDataSeeder
```

### Reset and Seed
```bash
php artisan migrate:fresh --seed --class=SmallTestSeeder
```

## Features

### Optimized Performance
- **Batch Processing**: Data is inserted in batches to manage memory usage
- **Foreign Key Optimization**: Temporarily disables foreign key checks during seeding
- **Memory Management**: Includes garbage collection to prevent memory exhaustion
- **Chunked Inserts**: Uses DB::insert() with chunks for better performance

### Realistic Data
- **Arabic Names**: Uses authentic Arabic names for teachers and students
- **Phone Numbers**: Saudi Arabia format (05xxxxxxxx)
- **Subjects**: Common school subjects in Arabic
- **Cities**: Major Saudi cities
- **Realistic Relationships**: Proper teacher-student-group relationships

### Data Relationships
- Each teacher has exactly 10 groups and 500 students
- Students are evenly distributed among groups (~50 per group)
- Each teacher has 2 assistants
- Payment records cover the last 12 months with 85% payment rate
- Attendance records cover the last 3 months with 80% attendance rate

## Performance Monitoring

### Database Size Estimates
- **Small Test**: ~50MB database
- **Performance Test**: ~15GB database

### Execution Time Estimates
- **Small Test**: 30-60 seconds
- **Performance Test**: 30-60 minutes (depending on hardware)

## Memory Requirements

### Small Test
- RAM: ~100MB
- Recommended: 1GB available memory

### Performance Test
- RAM: ~500MB-1GB during execution
- Recommended: 4GB available memory
- Uses batching to keep memory usage manageable

## Factories

The following factories are included:

### UserFactory (Enhanced)
- Supports both teachers and assistants
- Arabic names and realistic data
- Proper field population for teacher-specific attributes

### StudentFactory
- Arabic student names
- Guardian information
- Saudi phone number format

### GroupFactory
- Subject-based group names
- Realistic group sizes (45-55 students)
- Arabic descriptions

### PaymentFactory
- Realistic payment amounts (300-600 SAR)
- Payment status and dates
- Arabic notes

### AttendanceFactory
- Date-based attendance
- Realistic attendance rates
- Arabic absence notes

## Database Cleanup

The seeders automatically truncate the following tables before seeding:
- attendances
- payments
- students
- groups
- users (except admin users are preserved by other seeders)

## Tips for Performance Testing

1. **Start Small**: Always test with SmallTestSeeder first
2. **Monitor Resources**: Watch memory and disk usage during large seeding
3. **Database Configuration**: Ensure your database has sufficient storage space
4. **Indexes**: Make sure proper indexes are in place before performance testing
5. **Backups**: Take database backups before running large seeders

## Troubleshooting

### Out of Memory Errors
- Increase PHP memory limit: `php -d memory_limit=2G artisan db:seed`
- Use SmallTestSeeder instead of PerformanceTestSeeder
- Ensure adequate system RAM

### Slow Performance
- Check database configuration
- Ensure proper indexes exist
- Monitor disk space and I/O
- Consider using SSD storage for better performance

### Foreign Key Errors
- Ensure all migrations are run: `php artisan migrate`
- Check that relationships are properly defined in models
- Verify factory definitions match model fillable attributes

## Example Commands

```bash
# Quick development setup
php artisan migrate:fresh
php artisan db:seed --class=PlansSeeder
php artisan db:seed --class=AdminUserSeeder
php artisan performance:test small

# Full performance test setup
php artisan migrate:fresh
php artisan db:seed --class=PlansSeeder
php artisan db:seed --class=AdminUserSeeder
php artisan performance:test large

# Verify current data
php artisan performance:test verify

# Clear test data and start over
php artisan performance:test clear
php artisan performance:test small

# Reset everything and start fresh
php artisan migrate:fresh --seed
```

## Available Artisan Commands

### Performance Test Management
- `php artisan performance:test small` - Quick test with 10 teachers
- `php artisan performance:test large` - Full test with 1000 teachers  
- `php artisan performance:test verify` - Verify data integrity
- `php artisan performance:test clear` - Clear all test data
- `php artisan performance:test --help` - Show command help

### Traditional Seeder Commands
- `php artisan db:seed --class=SmallTestSeeder`
- `php artisan db:seed --class=PerformanceTestSeeder`
- `php artisan db:seed --class=DataVerificationSeeder`
- `php artisan db:seed --class=ClearPerformanceDataSeeder`
