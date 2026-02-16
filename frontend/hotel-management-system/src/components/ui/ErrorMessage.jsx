import { forwardRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * mode
 *  - "inline"  : rendered below a form control (default)
 *  - "tooltip" : absolutely positioned above/below a parent
 *  - "toast"   : fixed to top-right, auto-dismisses
 */

const ErrorMessage = forwardRef(function ErrorMessage(
  {
    message,
    messages,
    mode = "inline",
    visible = true,
    duration = 5000,
    onDismiss,
    className,
    ...props
  },
  ref
) {
  const [show, setShow] = useState(visible);

  // Sync with external visible prop
  useEffect(() => {
    setShow(visible);
  }, [visible]);

  // Auto-dismiss for toast mode
  useEffect(() => {
    if (mode !== "toast" || !show) return;
    const timer = setTimeout(() => {
      setShow(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [mode, show, duration, onDismiss]);

  const allMessages = messages || (message ? [message] : []);
  if (allMessages.length === 0 || !show) return null;

  /* ---- Inline mode ---- */
  if (mode === "inline") {
    return (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        className={cn(
          "flex items-start gap-1.5 mt-1.5",
          "animate-in fade-in-0 slide-in-from-top-1 duration-200",
          className
        )}
        {...props}
      >
        <AlertCircle
          size={14}
          className="text-[#B22222] shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-0.5">
          {allMessages.map((msg, i) => (
            <p
              key={i}
              className="text-[var(--text-sm)] text-[#B22222] font-sans leading-snug"
            >
              {msg}
            </p>
          ))}
        </div>
      </div>
    );
  }

  /* ---- Tooltip mode ---- */
  if (mode === "tooltip") {
    return (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        className={cn(
          "absolute left-0 top-full mt-1 z-50",
          "px-3 py-2 rounded-[var(--radius-md)]",
          "bg-[var(--color-error)] text-destructive-foreground",
          "text-[var(--text-xs)] font-sans",
          "shadow-lg border border-[var(--color-error-light)]",
          "animate-in fade-in-0 zoom-in-95 duration-150",
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-1.5">
          <AlertCircle size={12} className="shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            {allMessages.map((msg, i) => (
              <p key={i} className="leading-snug">
                {msg}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---- Toast mode ---- */
  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      className={cn(
        "fixed top-4 right-4 z-[100]",
        "flex items-start gap-3",
        "px-4 py-3 rounded-[var(--radius-lg)]",
        "bg-[var(--color-error)] text-destructive-foreground",
        "text-[var(--text-sm)] font-sans",
        "shadow-xl border border-[var(--color-error-light)]",
        "min-w-[280px] max-w-[420px]",
        "animate-in fade-in-0 slide-in-from-top-2 duration-300",
        className
      )}
      {...props}
    >
      <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex flex-col gap-0.5 flex-1">
        {allMessages.map((msg, i) => (
          <p key={i} className="leading-snug">
            {msg}
          </p>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          setShow(false);
          onDismiss?.();
        }}
        className={cn(
          "shrink-0 p-0.5 rounded-[var(--radius-sm)]",
          "hover:bg-[var(--color-error-light)] transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive-foreground"
        )}
        aria-label="Dismiss error"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
});

ErrorMessage.displayName = "ErrorMessage";

ErrorMessage.propTypes = {
  /** Single error message string */
  message: PropTypes.string,
  /** Array of error message strings (takes precedence over message) */
  messages: PropTypes.arrayOf(PropTypes.string),
  /** Display mode */
  mode: PropTypes.oneOf(["inline", "tooltip", "toast"]),
  /** Control visibility externally */
  visible: PropTypes.bool,
  /** Auto-dismiss duration in ms (toast mode only) */
  duration: PropTypes.number,
  /** Callback fired when the error is dismissed */
  onDismiss: PropTypes.func,
  /** Additional Tailwind classes */
  className: PropTypes.string,
};

export default ErrorMessage;
