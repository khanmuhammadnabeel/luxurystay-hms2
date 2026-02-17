import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './Drawer.module.css';

const sizeMap = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[640px]',
  full: 'w-screen',
};

const positionClasses = {
  left: 'left-0 top-0 h-full',
  right: 'right-0 top-0 h-full',
  top: 'top-0 left-0 w-full',
  bottom: 'bottom-0 left-0 w-full',
};

const animationClasses = {
  left: styles.slideLeft,
  right: styles.slideRight,
  top: styles.slideTop,
  bottom: styles.slideBottom,
};

function Drawer({
  isOpen,
  onClose,
  position = 'right',
  size = 'md',
  closeOnClickOutside = true,
  closeOnEsc = true,
  children,
  className,
  ...props
}) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const previousActiveElement = useRef(null);

  const handleClose = useCallback(() => {
    previousActiveElement.current?.focus?.();
    onClose();
  }, [onClose]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, handleClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const container = contentRef.current;
    const focusables = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length) focusables[0].focus();

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      const list = Array.from(focusables);
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

    container.addEventListener('keydown', handleTab);
    return () => container.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Overlay click
  const handleOverlayClick = (e) => {
    if (closeOnClickOutside && e.target === overlayRef.current) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const isHorizontal = position === 'left' || position === 'right';
  const sizeClass = isHorizontal ? sizeMap[size] || sizeMap.md : 'w-full';
  const heightClass = position === 'top' || position === 'bottom' ? 'h-auto' : '';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]"
      onClick={handleOverlayClick}
    >
      <div
        ref={contentRef}
        className={clsx(
          'fixed bg-[var(--color-secondary)] text-[var(--color-text-primary)]',
          'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)]',
          'border-l border-[rgba(207,175,126,0.2)]',
          'overflow-hidden',
          positionClasses[position],
          sizeClass,
          heightClass,
          animationClasses[position],
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <div className="flex flex-col h-full">
          {/* Default Header with close button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(207,175,126,0.2)]">
            <h2 className="font-playfair text-lg font-medium">Menu</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-[rgba(207,175,126,0.1)] hover:text-accent transition-colors"
              aria-label="Close drawer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content area - child components can replace this with their own structure */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

Drawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  position: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'full']),
  closeOnClickOutside: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Drawer;