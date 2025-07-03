import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, label, error, ...props },
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
            />
            {error && <p className="mt-1 text-sm text-red-600 text-right">{error}</p>}
        </div>
    );
});
