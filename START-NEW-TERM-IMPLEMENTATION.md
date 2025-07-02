# Start New Term Feature - Implementation Guide

## Overview
This feature allows teachers to completely reset their data when starting a new academic term while preserving their user account and subscription.

## Features Implemented

### 1. Backend Implementation
- **Route**: `POST /dashboard/reset-term`
- **Controller**: `DashboardController@resetTerm`
- **Middleware**: `auth`, `verified`, `approved`, `not-admin`

### 2. Frontend Implementation
- **Component**: `StartNewTermModal.jsx`
- **Integration**: Added to Dashboard with red "بدء فصل جديد" button

### 3. Data Reset Process
When a teacher confirms the reset, the following data is permanently deleted:

1. **Group Special Sessions** (`group_special_sessions`)
2. **Group Schedules** (`group_schedules`)
3. **Attendance Records** (`attendances`)
4. **Group-Student Relationships** (`group_student` pivot table)
5. **Payment Records** (`payments`)
6. **Students** (`students`)
7. **Groups** (`groups`)

**Preserved Data:**
- User account and authentication
- Subscription details and plan
- Profile information

### 4. Security Features
- Requires exact confirmation text: "CONFIRM RESET"
- Admin users cannot perform reset
- Transaction-based deletion for data integrity
- Comprehensive error handling and logging

### 5. User Experience
- Large warning modal with clear instructions
- Detailed list of data that will be deleted
- Confirmation input field requirement
- Loading states and error messages
- Arabic RTL interface

## Usage Instructions

### For Teachers:
1. Navigate to Dashboard
2. Click "بدء فصل جديد" (Start New Term) in quick actions
3. Read the warning carefully
4. Type "CONFIRM RESET" exactly as shown
5. Click "بدء فصل جديد" button to confirm

### For Developers:

#### Testing the Feature:
```bash
# Create test data first
php artisan db:seed

# Test the reset endpoint
curl -X POST http://localhost/dashboard/reset-term \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: your-token" \
  -d '{"confirmation": "CONFIRM RESET"}'
```

#### Frontend Integration:
```jsx
import StartNewTermModal from '@/Components/StartNewTermModal';

const [showTermResetModal, setShowTermResetModal] = useState(false);

// Button to trigger modal
<button onClick={() => setShowTermResetModal(true)}>
  Start New Term
</button>

// Modal component
<StartNewTermModal 
  isOpen={showTermResetModal} 
  onClose={() => setShowTermResetModal(false)} 
/>
```

## Technical Details

### Database Operations Order:
The reset follows a specific order to avoid foreign key constraint violations:

1. Special sessions (no foreign dependencies)
2. Group schedules (references groups)
3. Attendances (references groups and students)
4. Group-student pivot (references both)
5. Payments (references students)
6. Students (main entity)
7. Groups (main entity)

### Error Handling:
- Database transaction ensures atomicity
- Detailed error logging for debugging
- User-friendly error messages in Arabic
- Graceful handling of edge cases (no data to delete)

### Security Considerations:
- Input validation for confirmation text
- Admin user restriction
- Authentication and authorization checks
- CSRF protection
- Audit logging

## Files Modified/Created

### Backend:
- `app/Http/Controllers/DashboardController.php` - Added `resetTerm()` method
- `routes/web.php` - Added reset route

### Frontend:
- `resources/js/Components/StartNewTermModal.jsx` - New modal component
- `resources/js/Pages/Dashboard.jsx` - Added button and modal integration

### Assets:
- Rebuild required: `npm run build` or `npm run dev`

## Future Enhancements

1. **Backup Feature**: Option to export data before reset
2. **Selective Reset**: Choose specific types of data to reset
3. **Confirmation Email**: Send notification after successful reset
4. **Admin Overview**: Allow admins to see reset activity
5. **Restore Feature**: Ability to restore from backup within a time window

## Testing Checklist

- [ ] Modal opens when button clicked
- [ ] Warning message displays correctly
- [ ] Confirmation input validation works
- [ ] Reset executes successfully with valid confirmation
- [ ] Error handling for invalid confirmation
- [ ] Database transaction rollback on error
- [ ] Admin users cannot access reset
- [ ] Page refresh after successful reset
- [ ] All foreign key constraints handled properly
- [ ] Arabic text displays correctly (RTL)

## Notes

- This is a destructive operation that cannot be undone
- Always test in development environment first
- Consider database backups before production deployment
- Monitor error logs for any constraint violations
- Ensure proper authorization checks are in place
