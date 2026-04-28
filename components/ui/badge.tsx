import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Variantes de base
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background text-foreground",
        
        // Nouvelles variantes Hinos IA
        purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
        yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
        orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
        red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
        pink: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800",
        indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
        gray: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
        
        // Variantes de statut
        success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
        error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        
        // Badge gradient Hinos IA
        gradient: "bg-gradient-to-r from-purple-600 to-emerald-600 text-white border-transparent",
        "gradient-purple": "bg-gradient-to-r from-purple-600 to-purple-800 text-white border-transparent",
        "gradient-emerald": "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white border-transparent",
        
        // Variantes spéciales
        "glow": "bg-purple-600 text-white border-transparent shadow-lg shadow-purple-500/30",
        "glow-green": "bg-emerald-600 text-white border-transparent shadow-lg shadow-emerald-500/30",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[10px]",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base",
      },
      rounded: {
        default: "rounded-full",
        sm: "rounded",
        md: "rounded-md",
        lg: "rounded-lg",
        none: "rounded-none",
      },
      bordered: {
        true: "border-2",
        false: "border",
      },
      animated: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      bordered: false,
      animated: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
  count?: number
}

function Badge({ 
  className, 
  variant, 
  size, 
  rounded,
  bordered,
  animated,
  icon,
  removable = false,
  onRemove,
  count,
  children,
  ...props 
}: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size, rounded, bordered, animated }),
        removable && "pr-1",
        className
      )}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {count !== undefined && (
        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[10px] font-bold bg-black/20 rounded-full">
          {count}
        </span>
      )}
      <span>{children}</span>
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Supprimer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

// Composant BadgeGroup pour grouper plusieurs badges
export interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: "sm" | "md" | "lg"
  wrap?: boolean
}

function BadgeGroup({ 
  className, 
  spacing = "md", 
  wrap = true,
  children, 
  ...props 
}: BadgeGroupProps) {
  const spacingClasses = {
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3",
  }
  
  return (
    <div
      className={cn(
        "inline-flex",
        spacingClasses[spacing],
        wrap && "flex-wrap",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Composant BadgeCounter pour les notifications
export interface BadgeCounterProps {
  count: number
  max?: number
  variant?: BadgeProps["variant"]
  size?: BadgeProps["size"]
  showZero?: boolean
  className?: string
}

function BadgeCounter({ 
  count, 
  max = 99, 
  variant = "destructive",
  size = "sm",
  showZero = false,
  className 
}: BadgeCounterProps) {
  if (!showZero && count === 0) return null
  
  const displayCount = count > max ? `${max}+` : count
  
  return (
    <Badge 
      variant={variant} 
      size={size}
      className={cn(
        "absolute -top-2 -right-2 min-w-[20px] justify-center",
        className
      )}
    >
      {displayCount}
    </Badge>
  )
}

// Composant BadgeStatus pour les statuts en ligne
export interface BadgeStatusProps {
  status: "online" | "offline" | "away" | "busy"
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

function BadgeStatus({ status, showLabel = false, size = "md", className }: BadgeStatusProps) {
  const statusConfig = {
    online: { color: "bg-green-500", label: "En ligne" },
    offline: { color: "bg-gray-400", label: "Hors ligne" },
    away: { color: "bg-yellow-500", label: "Absent" },
    busy: { color: "bg-red-500", label: "Occupé" },
  }
  
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }
  
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className={cn(
        "rounded-full ring-2 ring-white dark:ring-gray-900",
        sizeClasses[size],
        statusConfig[status].color
      )} />
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {statusConfig[status].label}
        </span>
      )}
    </div>
  )
}

export { Badge, BadgeGroup, BadgeCounter, BadgeStatus, badgeVariants }
