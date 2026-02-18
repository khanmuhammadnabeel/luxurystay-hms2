import React, { createContext, useContext, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import styles from './Radio.module.css';

const RadioContext = createContext(null);

const RadioGroup = ({ children, value, onChange, name, className, ...props }) => {
    return (
        <RadioContext.Provider value={{ value, onChange, name }}>
            <div className={cn("flex flex-col gap-2", className)} role="radiogroup" {...props}>
                {children}
            </div>
        </RadioContext.Provider>
    );
};

const Radio = forwardRef(({
    className,
    value,
    label,
    helperText,
    disabled = false,
    variant = 'default', // default, button, card
    size = 'md', // sm, md, lg
    ...props
}, ref) => {
    const context = useContext(RadioContext);
    const isChecked = context ? context.value === value : props.checked;
    const name = context ? context.name : props.name;

    const handleChange = (e) => {
        if (disabled) return;
        if (context) {
            context.onChange(e.target.value);
        } else {
            props.onChange?.(e);
        }
    };

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const innerSizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3'
    };

    const radioControlClasses = cn(
        "rounded-full border flex items-center justify-center transition-all duration-200",
        "focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-primary",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        isChecked ? "border-accent" : "border-glass-border hover:border-accent",
        sizeClasses[size],
        styles.radioControl
    );

    return (
        <label className={cn(
            "inline-flex select-none group cursor-pointer",
            variant === 'card'
                ? "p-4 border border-glass-border rounded-lg bg-glass hover:bg-accent/5 transition-colors w-full"
                : "items-start",
            disabled && "opacity-50 cursor-not-allowed",
            className
        )}>
            <div className="relative flex items-center h-full">
                <input
                    type="radio"
                    className={cn("absolute opacity-0 w-0 h-0 peer", styles.radioInput)}
                    name={name}
                    value={value}
                    checked={isChecked}
                    onChange={handleChange}
                    disabled={disabled}
                    ref={ref}
                    {...props}
                />
                <div className={radioControlClasses}>
                    <div className={cn(
                        "rounded-full bg-accent",
                        innerSizeClasses[size],
                        styles.radioInner
                    )} />
                </div>
            </div>

            {(label || helperText) && (
                <div className="ml-3 flex flex-col select-none">
                    {label && (
                        <span className={cn(
                            "font-medium text-text-primary group-hover:text-accent transition-colors",
                            size === 'sm' && "text-xs",
                            size === 'md' && "text-sm",
                            size === 'lg' && "text-base"
                        )}>
                            {label}
                        </span>
                    )}
                    {helperText && (
                        <span className="text-xs text-text-secondary mt-0.5">
                            {helperText}
                        </span>
                    )}
                </div>
            )}
        </label>
    );
});

Radio.displayName = "Radio";
Radio.Group = RadioGroup;

export default Radio;
