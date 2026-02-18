import React, { forwardRef, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import styles from './Checkbox.module.css';

const Checkbox = forwardRef(({
    className,
    checked = false,
    defaultChecked,
    onChange,
    disabled = false,
    required = false,
    indeterminate = false,
    label,
    helperText,
    error,
    id,
    variant = 'default', // default, rounded, card
    size = 'md', // sm, md, lg
    ...props
}, ref) => {
    const inputRef = useRef(null);
    const resolvedId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    // Handle indeterminate state manually since it's a visual-only prop on input
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    const handleChange = (e) => {
        if (disabled) return;
        onChange?.(e.target.checked);
    };

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const checkboxBaseClasses = cn(
        "peer appearance-none border transition-all duration-200 flex items-center justify-center bg-transparent cursor-pointer",
        "focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        variant === 'rounded' ? "rounded-full" : "rounded",
        error ? "border-red-500" : "border-glass-border hover:border-accent",
        checked || indeterminate ? "bg-accent border-accent" : "",
        sizeClasses[size],
        styles.checkboxControl
    );

    return (
        <label className={cn("inline-flex flex-col cursor-pointer select-none group", className)}>
            <div className={cn(
                "flex items-start gap-3 select-none",
                variant === 'card' && "p-4 border border-glass-border rounded-lg bg-glass hover:bg-accent/5 transition-colors"
            )}>
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        id={resolvedId}
                        ref={(node) => {
                            inputRef.current = node;
                            if (typeof ref === 'function') ref(node);
                            else if (ref) ref.current = node;
                        }}
                        className="absolute opacity-0 w-0 h-0 peer"
                        checked={checked}
                        disabled={disabled}
                        onChange={handleChange}
                        required={required}
                        {...props}
                    />

                    <div className={checkboxBaseClasses} aria-hidden="true">
                        {checked && !indeterminate && (
                            <svg
                                className={cn("text-primary pointer-events-none", styles.checkmarkPath)}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                        {indeterminate && (
                            <svg
                                className={cn("text-primary pointer-events-none", styles.indeterminateLine)}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                            >
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        )}
                    </div>
                </div>

                {(label || helperText) && (
                    <div
                        className={cn(
                            "flex flex-col select-none",
                            disabled && "opacity-50"
                        )}
                    >
                        {label && (
                            <span className={cn(
                                "text-sm font-medium text-text-primary leading-none mt-0.5 select-none group-hover:text-accent transition-colors",
                                size === 'lg' && "text-base",
                                size === 'sm' && "text-xs"
                            )}>
                                {label} {required && <span className="text-red-500 ml-0.5 select-none">*</span>}
                            </span>
                        )}
                        {helperText && (
                            <span className={cn(
                                "text-xs text-text-secondary mt-1 select-none",
                                error && "text-red-500"
                            )}>
                                {helperText}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </label>
    );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;
