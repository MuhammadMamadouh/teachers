import React, { forwardRef, useEffect, useRef } from 'react';

const TextInput = forwardRef(({
    type = 'text',
    className = '',
    label = '',
    error = null,
    ...props
}, ref) => {
    const input = ref || useRef();

    useEffect(() => {
        if (error) {
            input.current.focus();
        }
    }, [error]);

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
                ref={input}
                {...props}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
    );
});

export default TextInput;
