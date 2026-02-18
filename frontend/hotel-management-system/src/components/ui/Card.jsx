import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import styles from "./Card.module.css";

// ============================================================================
// VARIANTS - Each with distinct personality
// ============================================================================
const VARIANTS = {
  // Clean, subtle, professional
  default:
    "bg-[var(--color-secondary)] border border-[var(--glass-border)] shadow-none",

  // Floating luxury - subtle shadow
  elevated:
    "bg-[var(--color-secondary)] border border-[var(--glass-border)] shadow-lg transition-all duration-300 hover:shadow-[0_30px_60px_-12px_rgba(207,175,126,0.3)] hover:-translate-y-1",

  // Minimalist, clean lines
  outlined:
    "bg-transparent border border-[var(--glass-border)] shadow-none",

  // Crystal clear glass - premium feel
  glass:
    "bg-[rgba(33,31,31,0.9)] backdrop-blur-[50px] border border-[rgba(207,175,126,0.1)] shadow-[0_20px_40px_-12px_rgba(0,0,0,1)] transition-all duration-300 hover:border-[rgba(207,175,126,0.4)] hover:shadow-[0_30px_60px_-12px_rgba(207,175,126,0.15)] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/25 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",

  // Interactive with gold shimmer
  interactive:
    "bg-[var(--color-secondary)] border border-transparent shadow-[var(--shadow-md)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_30px_60px_-12px_rgba(207,175,126,0.4)] hover:border-[rgba(207,175,126,0.5)] focus-visible:border-[var(--color-accent)] focus-visible:shadow-[0_0_0_3px_rgba(207,175,126,0.3)] relative overflow-hidden",
};

// ============================================================================
// MAIN CARD COMPONENT
// ============================================================================
const CardRoot = forwardRef(
  (
    {
      as: Tag = "div",
      variant = "default",
      interactive = false,
      disabled = false,
      onClick,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const isInteractive = interactive || variant === "interactive";
    const isGlass = variant === "glass";

    // Base classes for all cards
    const baseClasses = clsx(
      "relative rounded-2xl overflow-hidden",
      "text-[var(--color-text-primary)]",
      "transition-all duration-300 ease-out",
      // Light theme adjustments
      isGlass && "light-theme:bg-[rgb(0, 0, 0)]"
    );

    // Interactive states
    const interactionClasses =
      isInteractive && !disabled
        ? "cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
        : "";

    const disabledClasses = disabled
      ? "opacity-50 pointer-events-none cursor-not-allowed"
      : "";

    // Accessibility for interactive cards
    const roleProps = isInteractive
      ? {
        role: "button",
        tabIndex: disabled ? -1 : 0,
        onKeyDown: (e) => {
          if (!onClick || disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(e);
          }
        },
      }
      : {};

    return (
      <Tag
        ref={ref}
        className={clsx(
          "group",
          baseClasses,
          VARIANTS[variant] || VARIANTS.default,
          interactionClasses,
          disabledClasses,
          className
        )}
        onClick={disabled ? undefined : onClick}
        {...roleProps}
        {...rest}
      >
        {/* Gold shimmer overlay for interactive cards */}
        {variant === "interactive" && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none overflow-hidden">
            <div className={styles.shimmerOverlay} />
          </div>
        )}
        {children}
      </Tag>
    );
  }
);

CardRoot.displayName = "Card";

CardRoot.propTypes = {
  as: PropTypes.elementType,
  variant: PropTypes.oneOf([
    "default",
    "elevated",
    "outlined",
    "glass",
    "interactive",
  ]),
  interactive: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
};

// ============================================================================
// CARD HEADER
// ============================================================================
const CardHeader = ({ className, children, ...rest }) => (
  <div
    className={clsx(
      "flex items-start justify-between gap-3 px-6 pt-5 pb-3",
      "border-b border-[var(--glass-border)]",
      className
    )}
    {...rest}
  >
    <span className="font-medium text-[var(--color-text-primary)]">
      {children}
    </span>
  </div>
);

CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

// ============================================================================
// CARD IMAGE
// ============================================================================
const CardImage = ({ src, alt, className, overlay = true, ...rest }) => (
  <div className="relative overflow-hidden">
    <img
      src={src}
      alt={alt || "Card image"}
      className={clsx(
        "w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110",
        className
      )}
      loading="lazy"
      {...rest}
    />
    {overlay && (
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
        aria-hidden="true"
      />
    )}
  </div>
);

CardImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  overlay: PropTypes.bool,
};

// ============================================================================
// CARD CONTENT
// ============================================================================
const CardContent = ({ className, children, ...rest }) => (
  <div
    className={clsx(
      "px-6 py-4",
      "space-y-2",
      "text-[var(--color-text-primary)]",
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

CardContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

// ============================================================================
// CARD FOOTER
// ============================================================================
const CardFooter = ({ className, children, ...rest }) => (
  <div
    className={clsx(
      "flex items-center justify-between gap-3 px-6 pb-5 pt-3",
      "border-t border-[var(--glass-border)]",
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

// ============================================================================
// CARD BADGE
// ============================================================================
const CardBadge = ({ children, variant = "default", className, ...rest }) => {
  const badgeVariants = {
    default: "bg-[rgba(207,175,126,0.1)] text-[var(--color-accent)] border border-[rgba(207,175,126,0.3)]",
    gold: "bg-[var(--color-accent)] text-[var(--color-primary)] border border-[var(--color-accent)]",
    outline: "bg-transparent text-[var(--color-accent)] border border-[var(--color-accent)]",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider",
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
};

CardBadge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(["default", "gold", "outline"]),
  className: PropTypes.string,
};

// ============================================================================
// EXPORTS
// ============================================================================
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Image: CardImage,
  Content: CardContent,
  Footer: CardFooter,
  Badge: CardBadge,
});

export default Card;