import React, { forwardRef, useState } from 'react';
import { cn } from '../../lib/utils';
import styles from './Toggle.module.css';

const Toggle = forwardRef(({
    className,
    checked = false,
    defaultChecked,
    onChange,
    disabled = false,
    label,
    helperText,
    required = false,
    id,
    variant = 'default', // default, with-icon, with-text
    size = 'md', // sm, md, lg
    ...props
}, ref) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked || false);
    const isChecked = onChange ? checked : internalChecked;
    const resolvedId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e) => {
        if (disabled) return;
        if (!onChange) {
            setInternalChecked(e.target.checked);
        }
        onChange?.(e.target.checked);
    };

    const sizeClasses = {
        sm: {
            container: 'w-[36px] h-[20px]',
            thumb: 'w-[16px] h-[16px]',
            translate: 'translate-x-[16px]' // manual calc for CSS module fallback if needed
        },
        md: {
            container: 'w-[44px] h-[24px]',
            thumb: 'w-[20px] h-[20px]',
            translate: 'translate-x-[20px]'
        },
        lg: {
            container: 'w-[52px] h-[28px]',
            thumb: 'w-[24px] h-[24px]',
            translate: 'translate-x-[24px]'
        }
    };

    const currentSize = sizeClasses[size];

    return (
        <label className={cn("inline-flex flex-col cursor-pointer select-none group", className)}>
            <div className="flex items-center justify-between gap-3">
                {(label || helperText) && (
                    <div
                        className={cn(
                            "flex flex-col select-none flex-1 mr-4",
                            disabled && "opacity-50"
                        )}
                    >
                        {label && (
                            <span className={cn(
                                "font-medium text-text-primary group-hover:text-accent transition-colors",
                                size === 'sm' && "text-xs",
                                size === 'lg' && "text-lg"
                            )}>
                                {label} {required && <span className="text-red-500">*</span>}
                            </span>
                        )}
                        {helperText && (
                            <span className="text-xs text-text-secondary mt-0.5">
                                {helperText}
                            </span>
                        )}
                    </div>
                )}

                <div className="relative inline-flex items-center">
                    <input
                        type="checkbox"
                        id={resolvedId}
                        ref={ref}
                        className={cn("sr-only peer", styles.toggleInput)}
                        checked={isChecked}
                        onChange={handleChange}
                        disabled={disabled}
                        required={required}
                        {...props}
                    />

                    <div className={cn(
                        "rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-primary bg-secondary group-hover:bg-secondary/80",
                        currentSize.container,
                        disabled ? "opacity-50" : "",
                        styles.toggleControl
                    )}>
                        <span
                            className={cn(
                                "pointer-events-none inline-block rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center",
                                currentSize.thumb,
                                styles.toggleThumb
                            )}
                        >
                            {variant === 'with-icon' && (
                                <span className="text-[10px] leading-none select-none pointer-events-none">
                                    {isChecked ? '☀️' : '🌙'}
                                </span>
                            )}
                            {variant === 'with-text' && (
                                <span className="text-[8px] font-bold text-gray-400 uppercase leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[40px] select-none pointer-events-none">
                                    {isChecked ? 'On' : 'Off'}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </label>
    );
});

Toggle.displayName = "Toggle";

export default Toggle;
