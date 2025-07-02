import * as React from "react"

const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")
  const [selectedLabel, setSelectedLabel] = React.useState("")

  React.useEffect(() => {
    setSelectedValue(value || "")
  }, [value])

  const handleSelect = (newValue, label) => {
    setSelectedValue(newValue)
    setSelectedLabel(label)
    setIsOpen(false)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  const contextValue = {
    isOpen,
    setIsOpen,
    selectedValue,
    selectedLabel,
    handleSelect,
  }

  return (
    <div className="relative">
      <SelectContext.Provider value={contextValue}>
        {children}
      </SelectContext.Provider>
    </div>
  )
}

const SelectContext = React.createContext()

const SelectTrigger = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext)
  
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      ref={ref}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder = "Select..." }) => {
  const { selectedLabel, selectedValue } = React.useContext(SelectContext)
  return (
    <span className={selectedValue ? "text-gray-900" : "text-gray-500"}>
      {selectedLabel || placeholder}
    </span>
  )
}

const SelectContent = ({ children }) => {
  const { isOpen } = React.useContext(SelectContext)
  
  if (!isOpen) return null
  
  return (
    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
      {children}
    </div>
  )
}

const SelectItem = ({ value, children }) => {
  const { handleSelect, selectedValue } = React.useContext(SelectContext)
  const isSelected = selectedValue === value
  
  return (
    <div
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${
        isSelected ? "bg-blue-100 text-blue-900" : ""
      }`}
      onClick={() => handleSelect(value, children)}
    >
      {children}
    </div>
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
