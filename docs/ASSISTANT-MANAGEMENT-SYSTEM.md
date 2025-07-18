# Center Assistant Management System

## Overview
The assistant management system allows center owners to add and manage assistants with limited permissions to help manage their educational centers. This feature provides role-based access control ensuring that assistants can only access the features they need while maintaining security.

## Features

### 1. Role-Based Access Control
- **Center Owner (Admin Role)**: Full access to all center management features
- **Teacher Role**: Access to teaching-related features (students, groups, attendance)
- **Assistant Role**: Limited access based on assigned permissions

### 2. Permission System
Assistants can be granted specific permissions including:
- **View Students**: Can see student lists and basic information
- **Manage Attendance**: Can mark attendance and view attendance records
- **View Groups**: Can see group information and schedules
- **View Reports**: Can access basic reports and analytics
- **Manage Payments**: Can record and manage student payments

### 3. Subscription Limits
- Assistant limits are controlled by subscription plans
- Each plan has a maximum number of assistants allowed
- Center owners can upgrade their plans to add more assistants

## User Interface

### Center Owner Dashboard
1. **Assistants Page** (`/center/owner/assistants`)
   - View all assistants
   - Add new assistants
   - Edit assistant permissions
   - Remove assistants
   - View subscription limits

2. **Statistics Cards**
   - Total assistants count
   - Active assistants
   - Available assistant slots

### Traditional Assistant Management
1. **Assistants Index** (`/assistants`)
   - Alternative interface for assistant management
   - Available through main navigation
   - Includes modal-based forms

## Technical Implementation

### Database Structure
```sql
-- Users table includes assistant type
users (
    id,
    name,
    email,
    phone,
    password,
    type, -- 'assistant', 'teacher', 'center_owner'
    teacher_id, -- For assistants, references their supervising teacher
    center_id,
    is_active,
    created_at,
    updated_at
)

-- Plans table defines assistant limits
plans (
    id,
    name,
    max_assistants, -- Maximum assistants allowed
    price,
    duration_days
)
```

### Key Models

#### User Model Methods
```php
// Check if user is an assistant
public function isAssistant(): bool

// Get all assistants for a teacher/center owner
public function assistants(): HasMany

// Get the supervising teacher for an assistant
public function teacher(): BelongsTo

// Check if can add more assistants
public function canAddAssistants(int $count = 1): bool

// Get subscription limits
public function getSubscriptionLimits(): array
```

#### Center Model Methods
```php
// Get all assistants in a center
public function assistants(): HasMany
```

### Controllers

#### AssistantController
- `index()`: List all assistants for current user
- `store()`: Create new assistant
- `edit()`: Edit assistant form
- `update()`: Update assistant details
- `destroy()`: Remove assistant

#### CenterOwnerDashboardController
- `assistants()`: Center owner specific assistant management page

### Middleware Protection
1. **CheckAssistantLimit**: Ensures assistant limits aren't exceeded
2. **EnsureAssistantOwnership**: Verifies assistant belongs to current teacher
3. **ManageAssistants**: Controls access to assistant management features

### Routes
```php
// Traditional assistant management
Route::middleware(['manage-assistants'])->group(function () {
    Route::get('/assistants', [AssistantController::class, 'index']);
    Route::post('/assistants', [AssistantController::class, 'store']);
    Route::get('/assistants/{assistant}/edit', [AssistantController::class, 'edit']);
    Route::put('/assistants/{assistant}', [AssistantController::class, 'update']);
    Route::delete('/assistants/{assistant}', [AssistantController::class, 'destroy']);
});

// Center owner specific routes
Route::prefix('center/owner')->middleware(['center-owner'])->group(function () {
    Route::get('/assistants', [CenterOwnerDashboardController::class, 'assistants']);
});
```

## Permissions and Security

### Role Definitions
```php
// Admin (Center Owner) - Full permissions
$adminRole->givePermissionTo([
    'view center', 'edit center', 'manage center users', 'invite users',
    'view all students', 'create students', 'edit students', 'delete students',
    'view all groups', 'create groups', 'edit groups', 'delete groups',
    'view all attendance', 'manage attendance',
    'view subscriptions', 'manage subscriptions',
    'view all reports', 'manage settings'
]);

// Assistant - Limited permissions
$assistantRole->givePermissionTo([
    'view center', 'view own students', 'view own groups',
    'view own attendance', 'view own reports'
]);
```

### Permission Checks
```php
// Check if user can manage assistants
$user->can('manage center users')

// Check if user can invite new users
$user->can('invite users')

// Assistant-specific checks
if ($user->isAssistant()) {
    // Restrict to assigned permissions
}
```

## Usage Examples

### Creating an Assistant
```php
// In AssistantController::store()
$assistant = User::create([
    'name' => $request->name,
    'email' => $request->email,
    'phone' => $request->phone,
    'password' => Hash::make($request->password),
    'type' => 'assistant',
    'teacher_id' => auth()->id(),
    'center_id' => auth()->user()->center_id,
]);

$assistant->assignRole('assistant');
```

### Checking Limits
```php
// Before creating assistant
if (!$user->canAddAssistants()) {
    return back()->withErrors(['error' => 'Assistant limit reached']);
}
```

### Assistant Authentication
```php
// Assistant login is handled the same as other users
// Role-based access is controlled through middleware and permissions
```

## Frontend Components

### CenterOwner/Assistants.jsx
- Complete assistant management interface
- Modal forms for adding assistants
- Permission selection checkboxes
- Statistics dashboard
- Responsive design with Arabic RTL support

### Assistants/Index.jsx
- Traditional list view
- Add/edit/delete functionality
- Mobile-responsive cards
- Integration with existing layout

## Best Practices

1. **Permission Management**
   - Always check permissions before allowing access
   - Use middleware for route protection
   - Implement permission-based UI rendering

2. **Subscription Compliance**
   - Check limits before adding assistants
   - Provide upgrade options when limits reached
   - Display current usage vs. limits

3. **User Experience**
   - Clear indication of assistant roles
   - Easy permission management
   - Responsive design for all devices

4. **Security**
   - Validate assistant ownership
   - Secure password generation
   - Audit trail for assistant actions

## Integration Points

### Navigation
- Added to CenterOwnerLayout navigation
- Available in main AuthenticatedLayout
- Mobile navigation support

### Dashboard Integration
- Statistics cards showing assistant metrics
- Quick access to assistant management
- Subscription status indicators

### Subscription System
- Plan-based assistant limits
- Upgrade prompts when limits reached
- Clear limit display and tracking

This assistant management system provides center owners with the flexibility to delegate responsibilities while maintaining control and security over their educational center operations.
