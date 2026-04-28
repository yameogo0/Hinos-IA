import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, AlertCircle, CheckCircle, X } from "lucide-react"

const inputVariants = cva(
  "flex w-full rounded-lg border bg-background px-3 py-2 text-base ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:ring-purple-500",
        error: "border-red-500 focus-visible:ring-red-500 bg-red-50/50",
        success: "border-green-500 focus-visible:ring-green-500 bg-green-50/50",
        warning: "border-yellow-500 focus-visible:ring-yellow-500 bg-yellow-50/50",
        info: "border-blue-500 focus-visible:ring-blue-500 bg-blue-50/50",
        ghost: "border-transparent bg-gray-100 focus-visible:ring-purple-500",
      },
      size: {
        sm: "h-8 text-sm px-2",
        default: "h-10 px-3",
        lg: "h-12 text-lg px-4",
        xl: "h-14 text-xl px-5",
      },
      rounded: {
        default: "rounded-lg",
        sm: "rounded-md",
        lg: "rounded-xl",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  clearable?: boolean
  onClear?: () => void
  showPasswordToggle?: boolean
  label?: string
  helperText?: string
  errorMessage?: string
  successMessage?: string
  required?: boolean
  loading?: boolean
  counter?: boolean
  maxLength?: number
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = "text", 
    variant,
    size,
    rounded,
    icon,
    iconPosition = "left",
    clearable = false,
    onClear,
    showPasswordToggle = false,
    label,
    helperText,
    errorMessage,
    successMessage,
    required = false,
    loading = false,
    counter = false,
    maxLength,
    value,
    defaultValue,
    disabled,
    onChange,
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [inputValue, setInputValue] = React.useState<string | number | readonly string[] | undefined>(defaultValue || "")
    const [isFocused, setIsFocused] = React.useState(false)
    
    // ✅ Correction 1 : useRef avec null
    const inputRef = React.useRef<HTMLInputElement>(null)
    
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)
    
    const finalVariant = errorMessage ? "error" : successMessage ? "success" : variant
    const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      onChange?.(e)
    }
    
    const handleClear = () => {
      setInputValue("")
      if (inputRef.current) {
        inputRef.current.value = ""
        const event = new Event("input", { bubbles: true })
        inputRef.current.dispatchEvent(event)
      }
      onClear?.()
    }
    
    const validationIcon = errorMessage ? (
      <AlertCircle className="h-4 w-4 text-red-500" />
    ) : successMessage ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : null
    
    const loadingIcon = loading && (
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent" />
    )
    
    const currentLength = typeof value === "string" ? value.length : typeof inputValue === "string" ? inputValue.length : 0
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            ref={inputRef}
            type={inputType}
            className={cn(
              inputVariants({ variant: finalVariant, size, rounded }),
              icon && iconPosition === "left" && "pl-10",
              (iconPosition === "right" || clearable || showPasswordToggle || validationIcon || loading) && "pr-10",
              className
            )}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              onBlur?.(e)
            }}
            disabled={disabled || loading}
            maxLength={maxLength}
            aria-invalid={!!errorMessage}
            aria-describedby={errorMessage ? "input-error" : helperText ? "input-helper" : undefined}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {icon && iconPosition === "right" && !clearable && !showPasswordToggle && !validationIcon && !loading && (
              <span className="text-gray-400">{icon}</span>
            )}
            {validationIcon && !clearable && !showPasswordToggle && <span>{validationIcon}</span>}
            {loading && loadingIcon}
            {showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
            {clearable && inputValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        {errorMessage && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errorMessage}
          </p>
        )}
        
        {successMessage && !errorMessage && (
          <p className="mt-1.5 text-xs text-green-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {successMessage}
          </p>
        )}
        
        {helperText && !errorMessage && !successMessage && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}
        
        {counter && maxLength && (
          <div className="mt-1.5 flex justify-end">
            <span className="text-xs text-gray-400">{currentLength}/{maxLength}</span>
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  spacing?: "sm" | "md" | "lg"
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, orientation = "vertical", spacing = "md", children, ...props }, ref) => {
    const spacingClasses = {
      sm: orientation === "horizontal" ? "space-x-2" : "space-y-2",
      md: orientation === "horizontal" ? "space-x-3" : "space-y-3",
      lg: orientation === "horizontal" ? "space-x-4" : "space-y-4",
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          orientation === "horizontal" ? "flex" : "flex flex-col",
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
InputGroup.displayName = "InputGroup"

export interface SearchInputProps extends InputProps {
  onSearch?: (value: string) => void
  debounce?: number
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, debounce = 300, onChange, ...props }, ref) => {
    const [value, setValue] = React.useState("")
    
    // ✅ Correction 2 : useRef avec undefined
    const debounceTimeout = React.useRef<NodeJS.Timeout | undefined>(undefined)
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)
      onChange?.(e)
      
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
      debounceTimeout.current = setTimeout(() => {
        onSearch?.(newValue)
      }, debounce)
    }
    
    return (
      <Input
        ref={ref}
        type="search"
        icon={
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        iconPosition="left"
        value={value}
        onChange={handleChange}
        clearable
        {...props}
      />
    )
  }
)
SearchInput.displayName = "SearchInput"

export { Input, InputGroup, SearchInput }
