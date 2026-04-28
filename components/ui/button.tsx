import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        // Variantes principales
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        // Nouvelles variantes Hinos IA
        purple: "bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow-md",
        emerald: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md",
        gradient: "bg-gradient-to-r from-purple-600 to-emerald-600 text-white hover:from-purple-700 hover:to-emerald-700 shadow-md hover:shadow-lg",
        "gradient-hover": "bg-white text-gray-800 border-2 border-purple-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-emerald-600 hover:text-white hover:border-transparent",
        
        // Variantes sociales
        google: "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 shadow-sm",
        facebook: "bg-[#1877F2] text-white hover:bg-[#1877F2]/90 shadow-sm",
        twitter: "bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90 shadow-sm",
        
        // Variantes feedback
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm hover:shadow-md",
        info: "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md",
        
        // Variantes spéciales
        "glass": "bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30",
        "outline-white": "border border-white text-white hover:bg-white/10",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      fullWidth: {
        true: "w-full",
      },
      rounded: {
        default: "rounded-lg",
        sm: "rounded-md",
        lg: "rounded-xl",
        full: "rounded-full",
        none: "rounded-none",
      },
      loading: {
        true: "cursor-not-allowed",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    rounded,
    loading = false,
    leftIcon,
    rightIcon,
    loadingText = "Chargement...",
    children, 
    disabled,
    asChild = false, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading
    
    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant, 
            size, 
            fullWidth, 
            rounded, 
            loading,
            className 
          })
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {loading && loadingText ? loadingText : children}
        {!loading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </Comp>
    )
  }
)
Button.displayName = "Button"

// Composant ButtonGroup pour grouper des boutons
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  spacing?: "sm" | "md" | "lg"
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", spacing = "md", children, ...props }, ref) => {
    const spacingClasses = {
      sm: orientation === "horizontal" ? "space-x-1" : "space-y-1",
      md: orientation === "horizontal" ? "space-x-2" : "space-y-2",
      lg: orientation === "horizontal" ? "space-x-3" : "space-y-3",
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex",
          orientation === "vertical" && "flex-col",
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
ButtonGroup.displayName = "ButtonGroup"

// Bouton Icon seulement
export interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode
  label: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, size = "icon", ...props }, ref) => {
    return (
      <Button ref={ref} size={size} aria-label={label} {...props}>
        {icon}
        <span className="sr-only">{label}</span>
      </Button>
    )
  }
)
IconButton.displayName = "IconButton"

// Bouton de chargement
export interface LoadingButtonProps extends ButtonProps {
  loading: boolean
  loadingText?: string
  defaultText: string
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, loadingText = "Chargement...", defaultText, ...props }, ref) => {
    return (
      <Button ref={ref} loading={loading} loadingText={loadingText} {...props}>
        {defaultText}
      </Button>
    )
  }
)
LoadingButton.displayName = "LoadingButton"

export { Button, ButtonGroup, IconButton, LoadingButton, buttonVariants }
