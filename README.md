# Teachers Management System

A comprehensive Laravel-based system for managing teachers, students, groups, schedules, payments, and attendance.

## Features

### 🎓 Student Management
- Complete student registration and profile management
- Student assignment to groups with capacity controls
- Student search and filtering capabilities

### 👥 Group Management
- Create and manage learning groups
- Flexible scheduling system with multiple time slots
- Group capacity management and student enrollment
- **NEW: Special Sessions & Calendar View**

### 📅 Advanced Scheduling
- **Weekly Calendar View**: Interactive FullCalendar integration showing all sessions
- **Recurring Sessions**: Regular weekly schedules from group_schedules
- **Special Sessions**: One-time sessions with custom dates and descriptions
- **RTL Support**: Full Arabic language and right-to-left layout support

### 💰 Payment Tracking
- Monthly payment tracking per student per group
- Payment status management (paid/unpaid)
- Bulk payment operations
- Payment summaries and reports

### ✅ Attendance Management
- Daily attendance tracking
- Group-based attendance recording
- Attendance history and reports

### 🔐 User Management & Security
- User registration with admin approval system
- Role-based access control (Admin/Teacher)
- Secure authentication and authorization

## Technical Stack

- **Backend**: Laravel 11 with Inertia.js
- **Frontend**: React 18 with Tailwind CSS
- **Calendar**: FullCalendar React integration
- **Database**: SQLite (development) / MySQL (production)
- **Build Tools**: Vite
- **UI Components**: Headless UI, Lucide React icons

## Recent Updates

### Special Sessions Feature ✨
- Interactive calendar view for each group
- Add, edit, and delete special one-time sessions
- Visual distinction between recurring and special sessions
- Real-time calendar updates without page refresh
- Mobile-responsive calendar interface

For detailed implementation information, see [SPECIAL-SESSIONS-IMPLEMENTATION.md](SPECIAL-SESSIONS-IMPLEMENTATION.md)

## Installation

1. Clone the repository
2. Install PHP dependencies: `composer install`
3. Install Node.js dependencies: `npm install`
4. Copy environment file: `cp .env.example .env`
5. Generate application key: `php artisan key:generate`
6. Run migrations: `php artisan migrate`
7. Build frontend assets: `npm run build`
8. Start the development server: `php artisan serve`

## Development

For development with hot reload:
```bash
npm run dev
```

## Documentation

- [Special Sessions Implementation](SPECIAL-SESSIONS-IMPLEMENTATION.md)
- [Student Management Guide](STUDENT-MANAGEMENT.md)
- [Payment Tracking Implementation](PAYMENT-TRACKING-IMPLEMENTATION.md)
- [Subscription System Implementation](SUBSCRIPTION-IMPLEMENTATION.md)

---

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
