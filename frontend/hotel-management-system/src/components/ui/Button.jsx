import { forwardRef } from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Variant style maps -- each key returns a Tailwind class string
 * that references our CSS-variable-backed design tokens.
 */
const variantStyles = {
  primary:
    "bg-primary text-primary-foreground hover:bg-[var(--color-accent)] active:bg-[var(--color-accent)]",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-[var(--color-bg-elevated)] active:bg-[var(--color-bg-elevated)]",

  outline:
    "border border-[rgba(207,175,126,0.4)] text-[var(--color-accent)] bg-transparent hover:bg-[rgba(207,175,126,0.15)] hover:border-[rgba(196, 207, 126, 0.8)] hover:text-[var(--color-accent)] hover:shadow-[0_0_15px_rgba(207,175,126,0.3)] transition-all duration-200",

  ghost:
    "bg-transparent text-foreground hover:bg-secondary active:bg-secondary",
  destructive:
    "bg-[#B22222] text-white hover:bg-[#8B0000] active:bg-[#8B0000]",
};

const sizeStyles = {
  sm: "h-8 px-3 text-[var(--text-sm)] gap-1.5 rounded-[var(--radius-sm)]",
  md: "h-10 px-4 text-[var(--text-sm)] gap-2 rounded-[var(--radius-md)]",
  lg: "h-12 px-6 text-[var(--text-base)] gap-2.5 rounded-[var(--radius-lg)]",
  icon: "h-10 w-10 rounded-[var(--radius-md)]",
};

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    type = "button",
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center font-sans",
        "font-[var(--font-medium)] tracking-[var(--tracking-wide)]",
        "transition-colors duration-150 ease-in-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "cursor-pointer",
        "select-none",
        // Disabled
        isDisabled && "pointer-events-none opacity-50",
        // Full width
        fullWidth && "w-full",
        // Variant + size
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {loading && (
        <Loader2
          className="animate-spin shrink-0"
          size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
          aria-hidden="true"
        />
      )}
      {!loading && leftIcon && (
        <span className="shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      {size !== "icon" && <span>{children}</span>}
      {size === "icon" && children}
      {!loading && rightIcon && (
        <span className="shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = "Button";

Button.propTypes = {
  /** Button contents */
  children: PropTypes.node.isRequired,
  /** Visual style variant */
  variant: PropTypes.oneOf(["primary", "secondary", "outline", "ghost", "destructive"]),
  /** Size preset */
  size: PropTypes.oneOf(["sm", "md", "lg", "icon"]),
  /** Disable interactions */
  disabled: PropTypes.bool,
  /** Show loading spinner and disable interactions */
  loading: PropTypes.bool,
  /** Stretch to fill parent width */
  fullWidth: PropTypes.bool,
  /** Icon element rendered before label */
  leftIcon: PropTypes.node,
  /** Icon element rendered after label */
  rightIcon: PropTypes.node,
  /** Additional Tailwind classes */
  className: PropTypes.string,
  /** HTML button type */
  type: PropTypes.oneOf(["button", "submit", "reset"]),
};

export default Button;
