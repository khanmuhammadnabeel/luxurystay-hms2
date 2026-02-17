import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  createContext,
  useContext,
} from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import styles from "./Modal.module.css";

// ============================================================================
// CONTEXT (so Header can use onClose from root)
// ============================================================================
const ModalContext = createContext({ onClose: null, showCloseButton: true });

// ============================================================================
// SIZES
// ============================================================================
const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "w-full",
};

const VARIANT_OVERLAY = {
  center: "items-center justify-center p-4",
  top: "items-start justify-center pt-0 p-4",
  bottom: "items-end justify-center pb-0 p-4",
  fullscreen: "items-center justify-center p-0",
};

const OVERLAY_BASE =
  "fixed inset-0 z-50 flex transition-opacity duration-300 ease-out";
const MODAL_BASE =
  "relative z-50 w-full overflow-hidden rounded-xl border border-[rgba(207,175,126,0.2)] bg-[var(--color-secondary)] text-[var(--color-text-primary)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out";

// ============================================================================
// FOCUS TRAP HELPERS
// ============================================================================
function getFocusableElements(container) {
  if (!container) return [];
  const selector =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll(selector)).filter(
    (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
  );
}

// ============================================================================
// MODAL ROOT
// ============================================================================
function ModalRoot({
  isOpen,
  onClose,
  variant = "center",
  size = "md",
  closeOnClickOutside = true,
  closeOnEsc = true,
  showCloseButton = true,
  children,
  className,
}) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const previousActiveElement = useRef(null);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const exitTimeoutRef = useRef(null);

  const handleClose = useCallback(() => {
    if (exitTimeoutRef.current) return;
    setExiting(true);
    exitTimeoutRef.current = setTimeout(() => {
      exitTimeoutRef.current = null;
      if (previousActiveElement.current?.focus) {
        previousActiveElement.current.focus();
      }
      onClose();
      setExiting(false);
    }, 300);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  const handleOverlayClick = (e) => {
    if (!closeOnClickOutside || e.target !== overlayRef.current) return;
    handleClose();
  };

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || exiting) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, exiting]);

  useEffect(() => {
    if (!isOpen && !exiting) return;
    if (!closeOnEsc) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, exiting, closeOnEsc, handleClose]);

  useEffect(() => {
    if ((!isOpen && !exiting) || !contentRef.current) return;
    const el = contentRef.current;
    const focusables = getFocusableElements(el);
    if (focusables.length) focusables[0].focus();
    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const list = getFocusableElements(el);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [isOpen, exiting]);

  const show = isOpen || exiting;
  if (!isOpen && !exiting) return null;

  const sizeClass =
    variant === "fullscreen" ? "h-full max-h-screen w-full" : SIZES[size];
  const overlayVisible = show && !exiting;

  return (
    <ModalContext.Provider value={{ onClose: handleClose, showCloseButton }}>
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        className={clsx(
          OVERLAY_BASE,
          overlayVisible ? "opacity-100" : "opacity-0 pointer-events-none",
          "bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]",
          VARIANT_OVERLAY[variant]
        )}
        onClick={handleOverlayClick}
      >
        <div
          ref={contentRef}
          className={clsx(
            MODAL_BASE,
            variant === "fullscreen" && "rounded-none",
            variant === "fullscreen" ? "max-h-screen rounded-none" : sizeClass,
            "max-h-[calc(100vh-2rem)]",
            variant === "bottom" && "max-h-[90vh] rounded-b-none",
            variant === "top" && "max-h-[90vh] rounded-t-none",
            // CSS module animations
            variant === "center" && styles.centerEnter,
            variant === "top" && styles.topEnter,
            variant === "bottom" && styles.bottomEnter,
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

ModalRoot.displayName = "Modal";

ModalRoot.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["center", "top", "bottom", "fullscreen"]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "full"]),
  closeOnClickOutside: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

// ============================================================================
// MODAL HEADER
// ============================================================================
function ModalHeader({ title, onClose: onCloseProp, className, children, ...rest }) {
  const { onClose: ctxOnClose, showCloseButton } = useContext(ModalContext);
  const onClose = onCloseProp ?? ctxOnClose;
  const showButton = showCloseButton && onClose;

  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-3 px-6 py-4",
        "border-b border-[rgba(207,175,126,0.4)] bg-gradient-to-r from-transparent via-[rgba(207,175,126,0.15)] to-transparent",
        className
      )}
      {...rest}
    >
      {title && (
        <h2 className="font-playfair text-h4 font-medium text-[var(--color-text-primary)]">
          {title}
        </h2>
      )}
      {children}
      {showButton && (
        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[rgba(207,175,126,0.15)] hover:text-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-secondary)]"
          aria-label="Close"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

ModalHeader.propTypes = {
  title: PropTypes.string,
  onClose: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
};

// ============================================================================
// MODAL BODY
// ============================================================================
function ModalBody({ className, children, ...rest }) {
  return (
    <div
      className={clsx(
        "flex-1 overflow-y-auto px-6 py-4 text-[var(--color-text-primary)]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

ModalBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

// ============================================================================
// MODAL FOOTER
// ============================================================================
function ModalFooter({ className, children, ...rest }) {
  return (
    <div
      className={clsx(
        "flex flex-shrink-0 items-center justify-end gap-3 px-6 py-4",
        "border-t border-[rgba(207,175,126,0.15)]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

ModalFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

// ============================================================================
// EXPORT COMPOUND COMPONENT
// ============================================================================
const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});

export default Modal;
export { Modal };