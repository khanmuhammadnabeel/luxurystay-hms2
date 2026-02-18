import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import styles from './Dropdown.module.css';

const Dropdown = forwardRef(({
  trigger,
  children,
  align = 'bottom-left',
  variant = 'click', // click, hover, context
  className,
  onOpenChange,
  disabled = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Handle open state changes
  const handleOpenChange = (open) => {
    if (disabled) return;
    setIsOpen(open);
    onOpenChange?.(open);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        handleOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle keyboard navigation (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleOpenChange(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-positioning logic
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const pos = {};

      // Basic alignment logic
      if (align.includes('bottom')) pos.top = rect.bottom + 8;
      if (align.includes('top')) pos.bottom = window.innerHeight - rect.top + 8;
      if (align.includes('left')) pos.left = rect.left;
      if (align.includes('right')) pos.right = window.innerWidth - rect.right;

      // Viewport boundary check (simplistic auto-adjustment)
      if (pos.left + 200 > window.innerWidth) {
        delete pos.left;
        pos.right = 16;
      }

      setPosition(pos);
    }
  }, [isOpen, align]);

  // Event handlers based on variant
  const triggerProps = {
    ref: triggerRef,
    onClick: variant === 'click' ? () => handleOpenChange(!isOpen) : undefined,
    onMouseEnter: variant === 'hover' ? () => handleOpenChange(true) : undefined,
    onMouseLeave: variant === 'hover' ? () => handleOpenChange(false) : undefined,
    onContextMenu: variant === 'context' ? (e) => {
      e.preventDefault();
      handleOpenChange(true);
      setPosition({ top: e.clientY, left: e.clientX });
    } : undefined,
    'aria-expanded': isOpen,
    'aria-haspopup': 'menu',
    className: 'cursor-pointer inline-flex', // Ensure trigger handles events
  };

  return (
    <div className={cn("relative inline-block text-left select-none", className)} ref={ref} {...props}>
      <div {...triggerProps}>
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            "fixed z-50 min-w-[200px] rounded-lg p-1",
            styles.glassMenu,
            styles.dropdownMenu,
            "text-text-primary text-sm focus:outline-none"
          )}
          style={position}
          role="menu"
          aria-orientation="vertical"
          onMouseEnter={variant === 'hover' ? () => handleOpenChange(true) : undefined}
          onMouseLeave={variant === 'hover' ? () => handleOpenChange(false) : undefined}
        >
          {children}
        </div>
      )}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

// Subcomponents
const Item = forwardRef(({
  children,
  onClick,
  disabled,
  icon,
  className,
  destructive = false,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      role="menuitem"
      className={cn(
        "group flex w-full cursor-pointer items-center rounded-md px-3 py-2 transition-colors select-none",
        "hover:bg-accent/10 focus:bg-accent/10 focus:outline-none",
        disabled && "pointer-events-none opacity-50",
        destructive ? "text-red-500 hover:text-red-600" : "text-text-primary",
        className
      )}
      onClick={!disabled ? onClick : undefined}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {icon && <span className="mr-2 h-4 w-4 opacity-70 group-hover:opacity-100">{icon}</span>}
      {children}
    </div>
  );
});

Item.displayName = 'Dropdown.Item';

const Header = ({ children, className }) => (
  <div className={cn("px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary select-none", className)}>
    {children}
  </div>
);

const Divider = ({ className }) => (
  <div className={cn("my-1 h-px bg-glass-border", className)} />
);

// Exports
Dropdown.Item = Item;
Dropdown.Header = Header;
Dropdown.Divider = Divider;

export default Dropdown;
