"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Types pour les variantes
type DialogSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full"
type DialogPosition = "center" | "top" | "bottom" | "left" | "right"

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: DialogSize
  position?: DialogPosition
  showClose?: boolean
  closeOnClickOutside?: boolean
  closeOnEsc?: boolean
  withAnimation?: boolean
}

// Configuration des tailles
const sizeClasses: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-[95vw] max-h-[95vh]",
}

// Configuration des positions
const positionClasses: Record<DialogPosition, string> = {
  center: "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
  top: "left-[50%] top-[4%] translate-x-[-50%]",
  bottom: "left-[50%] bottom-[4%] translate-x-[-50%]",
  left: "left-[4%] top-[50%] translate-y-[-50%]",
  right: "right-[4%] top-[50%] translate-y-[-50%]",
}

// Composant Dialog principal
const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// DialogOverlay amélioré
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    blur?: boolean
  }
>(({ className, blur = false, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      blur && "backdrop-blur-sm",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// DialogContent amélioré avec toutes les options
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ 
  className, 
  children, 
  size = "md",
  position = "center",
  showClose = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  withAnimation = true,
  ...props 
}, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 w-full bg-background shadow-xl duration-200",
        "border border-gray-200 dark:border-gray-800",
        sizeClasses[size],
        positionClasses[position],
        withAnimation && "data-[state=open]:animate-in data-[state=closed]:animate-out",
        withAnimation && "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        withAnimation && "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        withAnimation && "data-[state=closed]:slide-out-to-top-48 data-[state=open]:slide-in-from-top-48",
        size !== "full" && "rounded-lg",
        size === "full" && "rounded-none",
        className
      )}
      onPointerDownOutside={(e) => {
        if (!closeOnClickOutside) {
          e.preventDefault()
        }
      }}
      onEscapeKeyDown={(e) => {
        if (!closeOnEsc) {
          e.preventDefault()
        }
      }}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-all hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:scale-110 active:scale-95">
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

// DialogHeader amélioré
const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    withBorder?: boolean
  }
>(({ className, withBorder = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6 pb-0",
      withBorder && "border-b border-gray-200 dark:border-gray-800 pb-4",
      className
    )}
    {...props}
  />
))
DialogHeader.displayName = "DialogHeader"

// DialogFooter amélioré
const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    withBorder?: boolean
  }
>(({ className, withBorder = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0",
      withBorder && "border-t border-gray-200 dark:border-gray-800 pt-4 mt-4",
      className
    )}
    {...props}
  />
))
DialogFooter.displayName = "DialogFooter"

// DialogTitle amélioré
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
    withIcon?: boolean
    icon?: React.ReactNode
  }
>(({ className, withIcon = false, icon, children, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight flex items-center gap-2",
      className
    )}
    {...props}
  >
    {withIcon && icon && <span className="text-purple-600">{icon}</span>}
    {children}
  </DialogPrimitive.Title>
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

// DialogDescription améliorée
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Composant DialogBody (nouveau)
const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto p-6", className)}
    {...props}
  />
))
DialogBody.displayName = "DialogBody"

// Composant Dialog avec gestion d'état (nouveau)
interface DialogContainerProps {
  trigger: React.ReactNode
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  size?: DialogSize
  position?: DialogPosition
  title?: string
  description?: string
  icon?: React.ReactNode
  showClose?: boolean
  closeOnClickOutside?: boolean
  closeOnEsc?: boolean
}

function DialogContainer({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  size = "md",
  position = "center",
  title,
  description,
  icon,
  showClose = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
}: DialogContainerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = (value: boolean) => {
    if (!isControlled) setUncontrolledOpen(value)
    onOpenChange?.(value)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent
        size={size}
        position={position}
        showClose={showClose}
        closeOnClickOutside={closeOnClickOutside}
        closeOnEsc={closeOnEsc}
      >
        {(title || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle withIcon={!!icon} icon={icon}>
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        <DialogBody>
          {children}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

// Composant DialogFullscreen (nouveau)
function DialogFullscreen({
  children,
  open,
  onOpenChange,
  title,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
}) {
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="full" position="center" showClose={true}>
        <DialogHeader withBorder>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </DialogHeader>
        <DialogBody className={cn(isFullscreen && "h-[calc(100vh-200px)]")}>
          {children}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogContainer,
  DialogFullscreen,
}
export type { DialogSize, DialogPosition, DialogContentProps }
