# Center Type Enum Implementation

## Overview
This document describes the implementation of the `CenterType` enum to replace hardcoded string values throughout the application.

## Files Modified

### 1. `app/Enums/CenterType.php` (New)
- **Purpose**: Defines center types as a PHP enum
- **Values**: 
  - `INDIVIDUAL` = 'individual'
  - `ORGANIZATION` = 'organization'
- **Methods**:
  - `label()`: Returns Arabic label for the type
  - `description()`: Returns Arabic description
  - `toArray()`: Returns array of value => label pairs
  - `options()`: Returns array of options for select dropdowns
  - `isIndividual()`: Checks if type is individual
  - `isOrganization()`: Checks if type is organization

### 2. `app/Models/Center.php` (Updated)
- **Added**: `CenterType` enum import
- **Updated**: Cast `type` field to `CenterType::class`
- **Updated**: `isIndividual()` and `isOrganization()` methods to use enum
- **Added**: `getTypeLabel()` method to get Arabic label

### 3. `app/Http/Controllers/GroupController.php` (Updated)
- **Added**: `CenterType` enum import
- **Updated**: All center type comparisons to use `CenterType::INDIVIDUAL` instead of `'individual'`
- **Locations**: index(), create(), store(), edit() methods

### 4. `app/Http/Controllers/Auth/RegisteredUserController.php` (Updated)
- **Added**: `CenterType` enum import
- **Updated**: Validation rule to use enum values dynamically
- **Updated**: Role assignment logic to use enum
- **Added**: `centerTypes` to registration form data

### 5. `resources/js/Pages/Auth/Register.jsx` (Updated)
- **Updated**: Component to accept `centerTypes` prop
- **Updated**: Select dropdown to use dynamic options from backend
- **Maintains**: Existing conditional logic for center type hints

### 6. `tests/Feature/Center/RegistrationWorkflowTest.php` (Updated)
- **Added**: `CenterType` enum import
- **Updated**: Test data to use `CenterType::INDIVIDUAL->value` and `CenterType::ORGANIZATION->value`
- **Fixed**: Role creation using `firstOrCreate` instead of `create`

## Benefits

1. **Type Safety**: Enum provides compile-time type checking
2. **Maintainability**: Centralized definition of center types
3. **Internationalization**: Built-in Arabic labels and descriptions
4. **IDE Support**: Better autocomplete and refactoring support
5. **Consistency**: Single source of truth for center types

## Usage Examples

```php
// Check center type
if ($center->type === CenterType::INDIVIDUAL) {
    // Handle individual center
}

// Get Arabic label
echo $center->type->label(); // "فردي" or "مؤسسة"

// Get description
echo $center->type->description(); // "مركز فردي لمعلم واحد"

// For select dropdowns
$options = CenterType::options();
```

## Migration Notes

- All existing `'individual'` and `'organization'` string comparisons have been updated
- Database values remain unchanged (still stored as strings)
- Frontend components now receive options from backend instead of hardcoded values
- Tests updated to use enum values

## Testing

The enum implementation has been tested and verified to work correctly with:
- Value retrieval (`individual`, `organization`)
- Label methods (Arabic text)
- Description methods (Arabic text)
- Boolean methods (`isIndividual()`, `isOrganization()`)
- Array conversion methods (`toArray()`, `options()`)
