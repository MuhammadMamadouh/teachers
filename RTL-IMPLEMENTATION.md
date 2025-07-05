# RTL (Right-to-Left) Implementation

This Laravel application has been configured to support Arabic language with full RTL layout and automatic input direction detection.

## Features

### 1. Global RTL Layout
- HTML document is set to `dir="rtl"`
- Arabic font (Cairo) is loaded from Google Fonts
- All layouts and components are RTL-aligned by default

### 2. Automatic Input Direction Detection
- Text inputs automatically detect Arabic vs English content
- Arabic text: displays RTL with right alignment
- English text: displays LTR with left alignment
- Mixed content: defaults to RTL
- Empty inputs: default to RTL (Arabic interface)

### 3. Components with RTL Support
- `TextInput` - Auto-direction support
- `AutoDirectionInput` - Specialized auto-direction input
- `AutoDirectionTextarea` - Specialized auto-direction textarea
- UI components (`Input`, `Textarea`, `Label`) - RTL-enabled
- SweetAlert2 dialogs - RTL configuration with Arabic defaults

### 4. Navigation & Layout
- Navigation menus are right-aligned
- Dropdowns open from right side
- Flex layouts use `flex-row-reverse` where appropriate
- Spacing utilities use `space-x-reverse` for RTL

### 5. CSS Utilities
- Custom RTL utility classes in `app.css`
- Cairo font family integration
- SweetAlert RTL styling
- Table and form RTL support

## Usage

### Basic Input with Auto-Direction
```jsx
import TextInput from '@/Components/TextInput';

<TextInput 
    value={data.name} 
    onChange={(e) => setData('name', e.target.value)}
    autoDirection={true} // default is true
/>
```

### Disable Auto-Direction
```jsx
<TextInput 
    value={data.email} 
    onChange={(e) => setData('email', e.target.value)}
    autoDirection={false} // keeps RTL but no auto-switching
/>
```

### Using Utility Functions
```jsx
import { getTextDirection, containsArabic, containsEnglish } from '@/utils/textDirection';

const direction = getTextDirection(someText);
const hasArabic = containsArabic(someText);
const hasEnglish = containsEnglish(someText);
```

### SweetAlert with RTL
```jsx
import { successAlert, errorAlert, confirmDialog } from '@/utils/sweetAlert';

// Automatically configured for RTL and Arabic
successAlert({
    title: 'تم بنجاح',
    text: 'تم حفظ البيانات بنجاح'
});
```

## Technical Details

### Font Configuration
- Primary font: Cairo (Arabic)
- Fallback: Figtree, system fonts
- Loaded via Google Fonts CDN

### Direction Detection Algorithm
1. Check if text contains Arabic characters (Unicode range \u0600-\u06FF)
2. Check if text contains English characters (a-zA-Z)
3. Default to RTL for Arabic interface consistency

### CSS Classes
- `.rtl-flex` - RTL flex container
- `.rtl-space-x` - RTL spacing
- `.form-error`, `.form-success` - RTL form messages
- `.swal2-rtl` - SweetAlert RTL styling

## Browser Support
- All modern browsers that support CSS `direction` property
- Automatic fallback for older browsers
- Progressive enhancement approach
