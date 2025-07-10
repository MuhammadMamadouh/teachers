import React, { forwardRef, useEffect, useRef } from 'react';

const TextInput = forwardRef(({
    type = 'text',
    className = '',
    label = '',
    error = null,
    ...props
}, ref) => {
    const input = useRef();
    const finalRef = ref || input;

    useEffect(() => {
        if (error) {
            finalRef.current.focus();
        }
    }, [error, finalRef]);

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 w-full ${error ? 'border-red-500' : ''} ${className}`}
                ref={finalRef}
                {...props}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
    );
});

TextInput.displayName = 'TextInput';

export default TextInput;
