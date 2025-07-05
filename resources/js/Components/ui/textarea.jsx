import * as React from "react"
import { applyAutoDirection } from "@/utils/textDirection"

const Textarea = React.forwardRef(({ className = "", autoDirection = true, ...props }, ref) => {
  const textareaRef = React.useRef(null);
  const actualRef = ref || textareaRef;

  const handleInput = (e) => {
    if (autoDirection) {
      applyAutoDirection(e.target, e.target.value);
    }
    
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 text-right ${className}`}
      ref={actualRef}
      {...props}
      onChange={handleInput}
      dir="rtl"
      style={{ 
        direction: 'rtl', 
        textAlign: 'right',
        fontFamily: "'Cairo', sans-serif",
        ...props.style 
      }}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
