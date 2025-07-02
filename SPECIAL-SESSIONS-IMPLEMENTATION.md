# Special Sessions Feature Implementation

## Overview
The Special Sessions feature allows teachers to add one-time special sessions to their groups in addition to the regular recurring schedules. This feature includes a comprehensive calendar view using FullCalendar that displays both types of sessions.

## Database Schema

### `group_special_sessions` Table
- `id` - Primary key
- `group_id` - Foreign key to groups table
- `date` - Date of the special session
- `start_time` - Start time (TIME format)
- `end_time` - End time (TIME format) 
- `description` - Optional description of the session
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Models

### GroupSpecialSession Model
Located at: `app/Models/GroupSpecialSession.php`

**Relationships:**
- `belongsTo(Group::class)` - Each special session belongs to a group

**Attributes:**
- All fields are fillable except timestamps
- Date is cast to Carbon date instance
- Times are cast to strings for easy manipulation

### Group Model Updates
Added relationship: `hasMany(GroupSpecialSession::class)`

## Controllers

### GroupController Updates
Added the following methods:

#### `calendar(Group $group)`
- Displays the calendar view for a specific group
- Loads group with schedules and special sessions
- Returns Inertia page: `Groups/Calendar`

#### `getCalendarEvents(Request $request, Group $group)`
- API endpoint that returns calendar events in FullCalendar format
- Combines recurring schedule events with special session events
- Accepts date range parameters (`start`, `end`)
- Returns JSON response with formatted events

#### `storeSpecialSession(Request $request, Group $group)`
- Creates new special session for a group
- Validates date, start_time, end_time, and optional description
- Returns JSON response with success status

#### `updateSpecialSession(Request $request, Group $group, GroupSpecialSession $specialSession)`
- Updates existing special session
- Validates ownership (group belongs to authenticated user)
- Returns JSON response with updated session

#### `destroySpecialSession(Group $group, GroupSpecialSession $specialSession)`
- Deletes a special session
- Validates ownership before deletion
- Returns JSON response with success status

## Routes

### Calendar Routes
- `GET /groups/{group}/calendar` - Display calendar view
- `GET /groups/{group}/calendar-events` - Get calendar events API
- `POST /groups/{group}/special-sessions` - Create special session
- `PUT /groups/{group}/special-sessions/{specialSession}` - Update special session
- `DELETE /groups/{group}/special-sessions/{specialSession}` - Delete special session

All routes are protected by authentication and approval middleware.

## Frontend Implementation

### Calendar Component
Location: `resources/js/Pages/Groups/Calendar.jsx`

**Features:**
- Weekly/Monthly/Daily calendar views
- RTL (Right-to-Left) support for Arabic
- Interactive session creation by clicking/selecting dates
- Edit special sessions by clicking on them
- Delete special sessions
- Real-time calendar updates

**Event Types:**
- **Recurring Sessions** (Blue): Generated from `group_schedules` table
- **Special Sessions** (Green): One-time sessions from `group_special_sessions` table

### Integration with Groups
- Added "التقويم" (Calendar) button to group show page
- Calendar link appears in group header navigation

## Styling

### FullCalendar Customization
Location: `resources/css/app.css`

**Features:**
- RTL direction support
- Custom button styling matching application theme
- Event hover effects
- Responsive design
- Arabic day name formatting

## Dependencies

### NPM Packages Added
- `@fullcalendar/react` - React component for FullCalendar
- `@fullcalendar/daygrid` - Month view plugin
- `@fullcalendar/timegrid` - Week/day view plugin  
- `@fullcalendar/interaction` - Interactive features (clicking, selecting)

## Testing

### Manual Testing
A test command was created: `php artisan test:special-sessions`

This command verifies:
- Model relationships work correctly
- Special sessions can be created
- Group-session associations function properly

## Usage Instructions

### For Teachers:

1. **View Calendar:**
   - Navigate to any group
   - Click "التقويم" (Calendar) button
   - View weekly/monthly schedule with both regular and special sessions

2. **Add Special Session:**
   - Click "إضافة جلسة خاصة" button OR
   - Click and drag on calendar to select time slot
   - Fill in date, start time, end time, and optional description
   - Click "حفظ" to save

3. **Edit Special Session:**
   - Click on any green (special) session in calendar
   - Modify details in popup form
   - Click "تحديث" to save changes OR "حذف" to delete

4. **Calendar Navigation:**
   - Use prev/next arrows to navigate dates
   - Switch between month, week, and day views
   - Regular sessions appear in blue, special sessions in green

## Security

- All operations require user authentication
- Groups can only be accessed by their owners
- Special sessions can only be modified by group owners
- CSRF protection on all form submissions
- Input validation on all fields

## Future Enhancements

Potential improvements could include:
- Email notifications for special sessions
- Recurring special session templates
- Student notifications
- Integration with attendance tracking
- Export calendar to external calendar apps
- Bulk special session operations
