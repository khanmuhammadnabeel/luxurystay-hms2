import { forwardRef, useState } from "react";
import PropTypes from "prop-types";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

const Label = forwardRef(function Label(
  {
    children,
    htmlFor,
    required = false,
    error = false,
    disabled = false,
    tooltip,
    className,
    ...props
  },
  ref
) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="inline-flex items-center gap-1.5 relative">
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={cn(
          "text-[var(--text-sm)] font-[var(--font-medium)] leading-none",
          "select-none font-sans tracking-[var(--tracking-wide)]",
          "transition-colors duration-150",
          // Default color
          "text-foreground",
          // Error state
          error && "text-[#B22222]",
          // Disabled state
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span
            className="text-[var(--color-error-light)] ml-0.5"
            aria-hidden="true"
          >
            *
          </span>
        )}
        {required && <span className="sr-only">(required)</span>}
      </label>

      {tooltip && (
        <span className="relative inline-flex">
          <button
            type="button"
            className={cn(
              "text-muted-foreground hover:text-foreground",
              "transition-colors duration-150 cursor-help",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              "rounded-full"
            )}
            aria-label={`More info: ${tooltip}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
          >
            <Info size={14} aria-hidden="true" />
          </button>

          {showTooltip && (
            <span
              role="tooltip"
              className={cn(
                "absolute left-1/2 -translate-x-1/2 bottom-full mb-2",
                "px-3 py-1.5 rounded-[var(--radius-md)]",
                "bg-card text-card-foreground",
                "text-[var(--text-xs)] font-sans",
                "whitespace-nowrap shadow-lg",
                "border border-border",
                "animate-in fade-in-0 zoom-in-95 duration-150",
                "z-50"
              )}
            >
              {tooltip}
            </span>
          )}
        </span>
      )}
    </div>
  );
});

Label.displayName = "Label";

Label.propTypes = {
  /** Label text content */
  children: PropTypes.node.isRequired,
  /** ID of the associated form control */
  htmlFor: PropTypes.string,
  /** Show required asterisk indicator */
  required: PropTypes.bool,
  /** Apply error styling */
  error: PropTypes.bool,
  /** Apply disabled styling */
  disabled: PropTypes.bool,
  /** Tooltip text shown on hover / focus of info icon */
  tooltip: PropTypes.string,
  /** Additional Tailwind classes */
  className: PropTypes.string,
};

export default Label;
