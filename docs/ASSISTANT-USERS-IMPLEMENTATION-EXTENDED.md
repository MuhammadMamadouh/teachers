# Assistant Users Implementation Documentation

## Overview

This feature allows teachers to add assistant users who can help manage students and groups. The number of assistants allowed per teacher is determined by their subscription plan.

## Completed Implementation

### Database Changes

1. **User Table:**
   - Added `type` enum ('teacher', 'assistant') - Default: 'teacher'
   - Added `teacher_id` foreign key to users table (nullable) - References the teacher that an assistant belongs to

2. **Plans Table:**
   - Added `max_assistants` integer - Default values:
     - Plans with ≤10 students: 1 assistant
     - Plans with 11-25 students: 2 assistants
     - Plans with 26-50 students: 3 assistants
     - Plans with >50 students: 5 assistants

### User Model Updates

Added relationships and helper methods to the User model:
- `teacher()` - BelongsTo relationship for assistants to access their teacher
- `assistants()` - HasMany relationship for teachers to access their assistants
- Helper methods:
  - `isTeacher()` - Check if user is a teacher
  - `isAssistant()` - Check if user is an assistant
  - `getMainTeacher()` - Get the main teacher (self for teachers, teacher for assistants)
  - `canAddAssistants()` - Check if teacher can add more assistants based on plan limits
  - `getAssistantCount()` - Get current number of assistants

### Middleware

1. **EnsureUserIsTeacherOrAdmin:**
   - Ensures only teachers or admins can access certain routes

2. **ScopeResourcesByTeacher:**
   - Scopes resources by teacher ID
   - For assistants, resources are scoped to their teacher's ID
   - Adds `teacher_id` and `main_teacher` attributes to the request

### Controllers

1. **AssistantController:**
   - `index()` - Display list of assistants for a teacher
   - `store()` - Add a new assistant (with validation against limits)
   - `destroy()` - Remove an assistant
   - `resendInvitation()` - Resend invitation email to an assistant

2. **DashboardController Updates:**
   - Added `assistantDashboard()` method to show modified dashboard for assistants

### Frontend Components

1. **Assistants/Index.jsx:**
   - List of current assistants with management options
   - Modal for adding new assistants
   - Modal for confirming assistant removal
   - Resend invitation functionality

2. **Dashboard.jsx Updates:**
   - Added support for assistant user view
   - Added assistant info banner

### Email Templates

1. **AssistantInvitation Mail Class:**
   - Email sent to invite new assistants
   - Contains temporary password and login information

2. **assistant-invitation.blade.php:**
   - Email template for assistant invitations

## Usage Flow

1. **Teacher adds an assistant:**
   - Teacher navigates to Assistants page
   - Enters assistant's name and email
   - System validates against assistant limit
   - Assistant receives invitation email with temporary password

2. **Assistant logs in:**
   - Uses the provided temporary password
   - Should change password after first login
   - Has access to students and groups but with restricted permissions

3. **Teacher manages assistants:**
   - Can view all assistants on the Assistants page
   - Can remove assistants
   - Can resend invitation emails

## Permissions & Access Control

- Assistants can view and manage students and groups but cannot:
  - Add new assistants
  - Upgrade subscription plans
  - Access billing information
  - Start a new term
  
- Resources (students, groups, etc.) are automatically scoped to the teacher
  - Assistants only see their teacher's resources
  - Changes made by assistants are attributed to their teacher

## Technical Implementation Notes

- The `scope-by-teacher` middleware ensures assistants only see their teacher's data
- The `teacher-or-admin` middleware ensures only teachers can access certain routes
- Assistant user creation enforces plan limits through the `canAddAssistants()` method
- Invitation emails include temporary passwords for first-time login

## Future Enhancements

- Role-based permissions for finer control over what assistants can do
- Activity logging to track actions performed by assistants
- Assistant-specific notifications and dashboard widgets
- Custom permissions per assistant (e.g., read-only vs. full edit access)
