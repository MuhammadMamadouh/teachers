import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, label, error, autoDirection = true, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

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
        if (autoDirection) {
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
        }

        // Call the original onChange if provided
        if (props.onChange) {
            props.onChange(e);
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    {label}
                </label>
            )}
            <input
                {...props}
                type={type}
                className={
                    'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-full text-right ' +
                    (error ? 'border-red-500 ' : '') +
                    className
                }
                ref={localRef}
                dir="rtl"
                onChange={handleInput}
                style={{ 
                    direction: 'rtl', 
                    textAlign: 'right',
                    fontFamily: "'Cairo', sans-serif",
                    ...props.style 
                }}
            />
            {error && <p className="mt-1 text-sm text-red-600 text-right">{error}</p>}
        </div>
    );
});
