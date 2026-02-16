import { forwardRef, useState, useId } from "react";
import PropTypes from "prop-types";
import { Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ErrorMessage from "./ErrorMessage";

const variantStyles = {
  default:
    "border border-border bg-transparent",
  filled:
    "border border-transparent bg-input",
  flushed:
    "border-0 border-b-2 border-border rounded-none bg-transparent px-0",
  unstyled:
    "border-0 bg-transparent px-0",
};

const sizeStyles = {
  sm: "h-8 text-[var(--text-sm)] px-2.5",
  md: "h-10 text-[var(--text-sm)] px-3",
  lg: "h-12 text-[var(--text-base)] px-4",
};

const Input = forwardRef(function Input(
  {
    id: idProp,
    variant = "default",
    size = "md",
    type = "text",
    label,
    error,
    disabled = false,
    clearable = false,
    maxLength,
    leftIcon,
    rightIcon,
    value,
    defaultValue,
    onChange,
    className,
    wrapperClassName,
    ...props
  },
  ref
) {
  const autoId = useId();
  const inputId = idProp || autoId;
  const errorId = `${inputId}-error`;

  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || "");

  // Controlled vs uncontrolled
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
  };

  const handleClear = () => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    const input = document.getElementById(inputId);
    if (input) {
      nativeInputValueSetter.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (!isControlled) setInternalValue("");
    onChange?.({ target: { value: "", id: inputId, name: props.name } });
  };

  const hasError = !!error;
  const showCharCount = maxLength !== undefined;
  const charCount = String(currentValue).length;
  const isOverLimit = maxLength !== undefined && charCount > maxLength;
  const showClear = clearable && String(currentValue).length > 0 && !disabled;

  // Determine effective input type
  const effectiveType = isPassword ? (showPassword ? "text" : "password") : type;

  // Compute right-side accessories
  const hasRightAccessories = isPassword || showClear || rightIcon;

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", wrapperClassName)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "text-[var(--text-sm)] font-[var(--font-medium)] font-sans",
            "tracking-[var(--tracking-wide)] leading-none select-none",
            "text-foreground",
            hasError && "text-[#B22222]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <span
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2",
              "text-muted-foreground pointer-events-none",
              size === "sm" && "left-2.5",
              size === "lg" && "left-4"
            )}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          disabled={disabled}
          aria-disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          maxLength={maxLength}
          value={isControlled ? value : undefined}
          defaultValue={!isControlled ? defaultValue : undefined}
          onChange={handleChange}
          className={cn(
            // Base
            "w-full font-sans text-foreground placeholder:text-muted-foreground",
            "transition-colors duration-150",
            "focus-visible:outline-none",
            // Variant
            variantStyles[variant],
            // Size (padding adjusted if icons present)
            sizeStyles[size],
            // Rounded (skip for flushed)
            variant !== "flushed" && variant !== "unstyled" && "rounded-[var(--radius-md)]",
            // Focus ring
            variant === "flushed"
              ? "focus-visible:border-primary"
              : variant !== "unstyled" &&
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
            // Error state
            hasError && variant !== "unstyled" && "border-[var(--color-error-light)] focus-visible:ring-[var(--color-error-light)]",
            // Disabled
            disabled && "opacity-50 cursor-not-allowed",
            // Left icon padding
            leftIcon && (size === "sm" ? "pl-8" : size === "lg" ? "pl-11" : "pl-9"),
            // Right accessories padding
            hasRightAccessories && (size === "sm" ? "pr-8" : size === "lg" ? "pr-11" : "pr-9"),
            className
          )}
          {...props}
        />

        {/* Right accessories */}
        {hasRightAccessories && (
          <span
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2",
              "flex items-center gap-1",
              size === "sm" ? "pr-2" : size === "lg" ? "pr-3.5" : "pr-3"
            )}
          >
            {showClear && (
              <button
                type="button"
                onClick={handleClear}
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  "transition-colors duration-150 p-0.5 rounded-full",
                  "focus-visible:outline-2 focus-visible:outline-ring"
                )}
                aria-label="Clear input"
                tabIndex={-1}
              >
                <X size={size === "sm" ? 12 : 14} aria-hidden="true" />
              </button>
            )}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  "transition-colors duration-150 p-0.5 rounded-full",
                  "focus-visible:outline-2 focus-visible:outline-ring"
                )}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff size={size === "sm" ? 14 : 16} aria-hidden="true" />
                ) : (
                  <Eye size={size === "sm" ? 14 : 16} aria-hidden="true" />
                )}
              </button>
            )}
            {!isPassword && !showClear && rightIcon && (
              <span className="text-muted-foreground pointer-events-none" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </span>
        )}
      </div>

      {/* Footer row: error + char count */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {hasError && (
            <ErrorMessage
              id={errorId}
              message={typeof error === "string" ? error : undefined}
              messages={Array.isArray(error) ? error : undefined}
              mode="inline"
            />
          )}
        </div>
        {showCharCount && (
          <span
            className={cn(
              "text-[var(--text-xs)] font-sans tabular-nums shrink-0",
              isOverLimit ? "text-[#B22222]" : "text-muted-foreground"
            )}
            aria-live="polite"
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

Input.displayName = "Input";

Input.propTypes = {
  /** Explicit id; auto-generated if omitted */
  id: PropTypes.string,
  /** Visual variant */
  variant: PropTypes.oneOf(["default", "filled", "flushed", "unstyled"]),
  /** Size preset */
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  /** HTML input type */
  type: PropTypes.string,
  /** Optional label rendered above the input */
  label: PropTypes.string,
  /** Error string, or array of strings -- renders ErrorMessage inline */
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  /** Disable the input */
  disabled: PropTypes.bool,
  /** Show a clear (X) button when the field has a value */
  clearable: PropTypes.bool,
  /** Character limit; shows counter below input */
  maxLength: PropTypes.number,
  /** Icon element rendered inside the left of the input */
  leftIcon: PropTypes.node,
  /** Icon element rendered inside the right of the input */
  rightIcon: PropTypes.node,
  /** Controlled value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Uncontrolled default value */
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Change handler */
  onChange: PropTypes.func,
  /** Additional classes on the input element */
  className: PropTypes.string,
  /** Additional classes on the outer wrapper */
  wrapperClassName: PropTypes.string,
};

export default Input;
