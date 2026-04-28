import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Variantes de carte
const cardVariants = cva(
  "relative transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border",
        elevated: "bg-card text-card-foreground border-0 shadow-lg hover:shadow-xl",
        outline: "bg-transparent border-2",
        ghost: "bg-transparent border-0 shadow-none",
        gradient: "bg-gradient-to-br from-purple-50 via-white to-emerald-50 border-0",
        "gradient-dark": "bg-gradient-to-br from-purple-950 via-gray-900 to-emerald-950 border-0",
        glass: "bg-white/10 backdrop-blur-md border border-white/20",
        "glass-dark": "bg-black/10 backdrop-blur-md border border-white/10",
      },
      rounded: {
        default: "rounded-lg",
        sm: "rounded-md",
        lg: "rounded-xl",
        xl: "rounded-2xl",
        full: "rounded-3xl",
        none: "rounded-none",
      },
      padding: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-10",
        none: "p-0",
      },
      hover: {
        none: "",
        scale: "hover:scale-105",
        lift: "hover:-translate-y-1 hover:shadow-xl",
        glow: "hover:shadow-lg hover:shadow-purple-500/20",
        border: "hover:border-purple-500",
      },
    },
    defaultVariants: {
      variant: "default",
      rounded: "default",
      padding: "default",
      hover: "none",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
  interactive?: boolean
  loading?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    rounded, 
    padding, 
    hover, 
    interactive = false,
    loading = false,
    children, 
    ...props 
  }, ref) => {
    const Comp = "div"
    
    return (
      <Comp
        ref={ref}
        className={cn(
          cardVariants({ variant, rounded, padding, hover }),
          interactive && "cursor-pointer active:scale-95",
          loading && "animate-pulse",
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Card.displayName = "Card"

// CardHeader avec options
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  withBorder?: boolean
  withDivider?: boolean
  action?: React.ReactNode
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, withBorder = false, withDivider = false, action, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5",
        withBorder && "border-b pb-4",
        withDivider && "divide-y divide-gray-200 dark:divide-gray-800",
        className
      )}
      {...props}
    >
      {action && (
        <div className="flex items-center justify-between">
          <div className="flex-1">{children}</div>
          <div>{action}</div>
        </div>
      )}
      {!action && children}
    </div>
  )
)
CardHeader.displayName = "CardHeader"

// CardTitle avec options
export interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  withIcon?: boolean
  icon?: React.ReactNode
}

const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, as: Tag = "h3", withIcon = false, icon, children, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight flex items-center gap-2",
        Tag === "h1" && "text-3xl",
        Tag === "h2" && "text-2xl",
        Tag === "h3" && "text-xl",
        Tag === "h4" && "text-lg",
        Tag === "h5" && "text-base",
        Tag === "h6" && "text-sm",
        className
      )}
      {...props}
    >
      {withIcon && icon && <span className="text-purple-600">{icon}</span>}
      {children}
    </Tag>
  )
)
CardTitle.displayName = "CardTitle"

// CardDescription
const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// CardContent
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
CardContent.displayName = "CardContent"

// CardFooter avec options
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  withBorder?: boolean
  align?: "left" | "center" | "right" | "between"
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, withBorder = false, align = "left", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        align === "left" && "justify-start",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
        align === "between" && "justify-between",
        withBorder && "border-t pt-4",
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

// CardMedia pour les images
export interface CardMediaProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  height?: string | number
}

const CardMedia = React.forwardRef<HTMLImageElement, CardMediaProps>(
  ({ className, src, alt, height = "200px", ...props }, ref) => (
    <div className="relative overflow-hidden rounded-t-lg" style={{ height }}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn("w-full h-full object-cover", className)}
        {...props}
      />
    </div>
  )
)
CardMedia.displayName = "CardMedia"

// CardBadge pour les badges sur les cartes
export interface CardBadgeProps {
  children: React.ReactNode
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  variant?: "default" | "purple" | "emerald" | "destructive"
}

const CardBadge = React.forwardRef<HTMLDivElement, CardBadgeProps>(
  ({ children, position = "top-right", variant = "default", ...props }, ref) => {
    const positionClasses = {
      "top-left": "top-2 left-2",
      "top-right": "top-2 right-2",
      "bottom-left": "bottom-2 left-2",
      "bottom-right": "bottom-2 right-2",
    }
    
    const variantClasses = {
      default: "bg-gray-900 text-white",
      purple: "bg-purple-600 text-white",
      emerald: "bg-emerald-600 text-white",
      destructive: "bg-red-600 text-white",
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-10 px-2 py-1 text-xs font-semibold rounded-lg shadow-lg",
          positionClasses[position],
          variantClasses[variant]
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CardBadge.displayName = "CardBadge"

// CardGroup pour grouper plusieurs cartes
export interface CardGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4
  gap?: "sm" | "md" | "lg"
}

const CardGroup = React.forwardRef<HTMLDivElement, CardGroupProps>(
  ({ className, columns = 3, gap = "md", children, ...props }, ref) => {
    const columnsClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    }
    
    const gapClasses = {
      sm: "gap-3",
      md: "gap-4",
      lg: "gap-6",
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          columnsClasses[columns],
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CardGroup.displayName = "CardGroup"

// CardSkeleton pour le chargement
const CardSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card ref={ref} loading className={className} {...props}>
    <CardHeader>
      <CardTitle> </CardTitle>
      <CardDescription> </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
    </CardContent>
  </Card>
))
CardSkeleton.displayName = "CardSkeleton"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardMedia,
  CardBadge,
  CardGroup,
  CardSkeleton,
  cardVariants
}
