import { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function AutoDirectionInput({ className = '', isFocused = false, ...props }, ref) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

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
        const inputElement = e.target;

        if (value.trim() === '') {
            // Empty input, set to RTL (Arabic default)
            inputElement.style.direction = 'rtl';
            inputElement.style.textAlign = 'right';
        } else if (containsEnglish(value) && !containsArabic(value)) {
            // Only English characters, set to LTR
            inputElement.style.direction = 'ltr';
            inputElement.style.textAlign = 'left';
        } else {
            // Contains Arabic or mixed content, set to RTL
            inputElement.style.direction = 'rtl';
            inputElement.style.textAlign = 'right';
        }

        // Call the original onChange if provided
        if (props.onChange) {
            props.onChange(e);
        }
    };

    return (
        <input
            {...props}
            className={
                'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ' +
                className
            }
            ref={input}
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
