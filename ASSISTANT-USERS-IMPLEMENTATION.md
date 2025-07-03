# Assistant Users Feature - Implementation Guide

## Overview
This feature allows teachers to add assistant users to help them manage students and groups. The number of assistants allowed per teacher depends on their current subscription plan.

## Implementation Status
- ✅ Database Schema Updates
- ✅ Model Updates
- ✅ Middleware for Access Control
- ✅ Backend Controllers
- ✅ Frontend UI Components
- ✅ Email Templates
- ✅ Assistant User Management
- ✅ Extended Documentation

For detailed documentation, see [ASSISTANT-USERS-IMPLEMENTATION-EXTENDED.md](ASSISTANT-USERS-IMPLEMENTATION-EXTENDED.md)

## Step 1: Database Schema Updates ✅

### Users Table Updates
Added support for assistant users with the following columns:

- `type`: enum('teacher', 'assistant') — default: 'teacher'
- `teacher_id`: nullable foreign key referencing `users.id` — only used if type = 'assistant'

**Logic:**
- A teacher has `type = 'teacher'` and `teacher_id = null`
- An assistant has `type = 'assistant'` and `teacher_id = <the teacher's id>`

### Plans Table Updates
Added support for assistant limits:

- `max_assistants`: integer — default: 0

**Default Assistant Limits by Plan:**
- Plans with ≤10 students: 1 assistant
- Plans with 11-25 students: 2 assistants  
- Plans with 26-50 students: 3 assistants
- Plans with >50 students: 5 assistants

## Code Changes Implemented

### 1. Database Migrations ✅

**Created:** `2025_07_02_234315_add_assistant_support_to_users_table.php`
```php
// Adds type and teacher_id columns to users table
$table->enum('type', ['teacher', 'assistant'])->default('teacher');
$table->foreignId('teacher_id')->nullable()->constrained('users')->onDelete('cascade');
```

**Created:** `2025_07_02_234443_add_max_assistants_to_plans_table.php`
```php
// Adds max_assistants column to plans table
$table->integer('max_assistants')->default(0);
```

### 2. Model Updates ✅

**Updated:** `app/Models/User.php`
- Added `type` and `teacher_id` to fillable fields
- Added `teacher()` relationship for assistants
- Added `assistants()` relationship for teachers
- Added helper methods:
  - `isTeacher()`: Check if user is a teacher
  - `isAssistant()`: Check if user is an assistant
  - `getMainTeacher()`: Get the main teacher for assistants
  - `canAddAssistants()`: Check if teacher can add more assistants
  - `getAssistantCount()`: Get current assistant count

**Updated:** `app/Models/Plan.php`
- Added `max_assistants` to fillable fields

### 3. Database Seeding ✅

**Created:** `database/seeders/UpdatePlansWithAssistantLimits.php`
- Updates existing plans with reasonable assistant limits based on student capacity

## Database Schema

### Users Table Structure
```sql
users:
- id (primary key)
- name
- email
- password
- phone
- subject
- city
- notes
- is_approved
- is_admin
- approved_at
- type (enum: 'teacher', 'assistant') [NEW]
- teacher_id (foreign key to users.id, nullable) [NEW]
- created_at
- updated_at
```

### Plans Table Structure
```sql
plans:
- id (primary key)
- name
- max_students
- max_assistants [NEW]
- price_per_month
- is_default
- created_at
- updated_at
```

## Relationships

### Teacher → Assistants (One-to-Many)
```php
// Teacher model
public function assistants(): HasMany
{
    return $this->hasMany(User::class, 'teacher_id');
}
```

### Assistant → Teacher (Many-to-One)
```php
// Assistant model (same User model)
public function teacher()
{
    return $this->belongsTo(User::class, 'teacher_id');
}
```

## Usage Examples

### Check User Type
```php
$user = User::find(1);

if ($user->isTeacher()) {
    // Teacher logic
    $assistants = $user->assistants;
    $canAddMore = $user->canAddAssistants();
}

if ($user->isAssistant()) {
    // Assistant logic
    $teacher = $user->teacher;
    $mainTeacher = $user->getMainTeacher();
}
```

### Check Assistant Limits
```php
$teacher = User::find(1);
$currentAssistants = $teacher->getAssistantCount();
$canAddAssistant = $teacher->canAddAssistants(1);
```

## Next Steps

The following features still need to be implemented:

1. **Assistant Registration/Invitation System**
   - UI for teachers to invite assistants
   - Email invitation system
   - Assistant registration flow

2. **Access Control**
   - Middleware to check assistant permissions
   - Scope data access for assistants to their teacher's data
   - UI role-based restrictions

3. **Assistant Management Interface**
   - Dashboard section for managing assistants
   - List, edit, remove assistants
   - Assistant activity tracking

4. **Data Access Scoping**
   - Update controllers to scope data by teacher
   - Ensure assistants can only access their teacher's data
   - Update queries across the application

## Security Considerations

- Assistants should only access their assigned teacher's data
- Cascading delete: When a teacher is deleted, their assistants are also removed
- Validation to ensure assistants can't be assigned to other assistants
- Subscription limit enforcement for assistant creation

## Testing Checklist

- [ ] Migration runs successfully
- [ ] User relationships work correctly
- [ ] Plan assistant limits are enforced
- [ ] Helper methods return correct values
- [ ] Foreign key constraints work properly
- [ ] Cascade delete works when teacher is removed
