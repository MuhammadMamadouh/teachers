import * as React from "react"

const Label = React.forwardRef(({ className = "", children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 text-right ${className}`}
      {...props}
      style={{ 
        fontFamily: "'Cairo', sans-serif",
        ...props.style 
      }}
    >
      {children}
    </label>
  )
})
Label.displayName = "Label"

export { Label }
