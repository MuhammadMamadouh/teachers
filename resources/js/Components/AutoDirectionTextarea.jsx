import { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function AutoDirectionTextarea({ className = '', isFocused = false, ...props }, ref) {
    const textarea = useRef();
    const finalRef = ref || textarea;

    useEffect(() => {
        if (isFocused) {
            finalRef.current.focus();
        }
    }, [isFocused, finalRef]);

    // Function to detect if text contains Arabic characters
    const containsArabic = (text) => {
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
        return arabicRegex.test(text);
    };

    // Function to detect if text contains English characters
    const containsEnglish = (text) => {
        const englishRegex = /[a-zA-Z]/;
        return englishRegex.test(text);
    };

    const handleInput = (e) => {
        const value = e.target.value;
        const textareaElement = e.target;

        if (value.trim() === '') {
            // Empty input, set to RTL (Arabic default)
            textareaElement.style.direction = 'rtl';
            textareaElement.style.textAlign = 'right';
        } else if (containsEnglish(value) && !containsArabic(value)) {
            // Only English characters, set to LTR
            textareaElement.style.direction = 'ltr';
            textareaElement.style.textAlign = 'left';
        } else {
            // Contains Arabic or mixed content, set to RTL
            textareaElement.style.direction = 'rtl';
            textareaElement.style.textAlign = 'right';
        }

        // Call the original onChange if provided
        if (props.onChange) {
            props.onChange(e);
        }
    };

    return (
        <textarea
            {...props}
            className={
                'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ' +
                className
            }
            ref={finalRef}
            onChange={handleInput}
            style={{ 
                direction: 'rtl', 
                textAlign: 'right',
                fontFamily: "'Cairo', sans-serif",
                ...props.style 
            }}
        />
    );
});
