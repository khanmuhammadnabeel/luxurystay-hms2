import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils';
import styles from './Select.module.css';

const Select = ({
    options = [],
    value,
    onChange,
    placeholder = "Select an option...",
    label,
    error,
    helperText,
    disabled = false,
    multiple = false,
    searchable = false,
    loading = false,
    size = 'md', // sm, md, lg
    className,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options
    const filteredOptions = useMemo(() => {
        if (!searchable || !searchTerm) return options;
        return options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm, searchable]);

    const handleSelect = (option) => {
        if (multiple) {
            const isSelected = Array.isArray(value) && value.some(v => v === option.value);
            const newValue = isSelected
                ? value.filter(v => v !== option.value)
                : [...(value || []), option.value];
            onChange(newValue);
        } else {
            onChange(option.value);
            setIsOpen(false);
        }
    };

    const removeValue = (valToRemove, e) => {
        e.stopPropagation();
        const newValue = value.filter(v => v !== valToRemove);
        onChange(newValue);
    };

    const isSelected = (optionValue) => {
        if (multiple) return Array.isArray(value) && value.includes(optionValue);
        return value === optionValue;
    };

    // Get display label(s) for trigger
    const getDisplayValue = () => {
        if (multiple) {
            if (!value || value.length === 0) return null;
            return (
                <div className="flex flex-wrap gap-1">
                    {value.map(val => {
                        const opt = options.find(o => o.value === val);
                        return (
                            <span key={val} className="bg-accent/10 border border-accent/20 text-accent text-xs px-2 py-0.5 rounded-full flex items-center gap-1 select-none">
                                {opt?.label || val}
                                <button
                                    onClick={(e) => removeValue(val, e)}
                                    className="hover:text-text-primary focus:outline-none"
                                >
                                    &times;
                                </button>
                            </span>
                        );
                    })}
                </div>
            );
        }
        const selectedOpt = options.find(o => o.value === value);
        return selectedOpt ? selectedOpt.label : null;
    };

    const sizeClasses = {
        sm: 'h-8 text-sm px-2',
        md: 'h-10 text-base px-3',
        lg: 'h-12 text-lg px-4'
    };

    return (
        <div className={cn("w-full flex flex-col gap-1.5", className)} ref={containerRef}>
            {label && (
                <label className="text-sm font-medium text-text-secondary flex justify-between select-none">
                    {label}
                    {props.required && <span className="text-red-500 ml-1 select-none">*</span>}
                </label>
            )}

            <div className="relative">
                <div
                    className={cn(
                        "flex items-center justify-between w-full border rounded-md transition-all duration-200 cursor-pointer bg-glass select-none", // Using glass bg
                        "hover:border-accent/50 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-primary",
                        disabled ? "opacity-50 cursor-not-allowed" : "",
                        error ? "border-red-500" : "border-glass-border", // Using glass border
                        sizeClasses[size]
                    )}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    tabIndex={disabled ? -1 : 0}
                >
                    <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-text-primary">
                        {getDisplayValue() || <span className="text-text-secondary opacity-70 select-none">{placeholder}</span>}
                    </div>

                    <div className="flex items-center gap-2 ml-2 shrink-0">
                        {loading && <div className={cn(styles.spinner, "select-none")} />}
                        <svg
                            className={cn("w-4 h-4 text-text-secondary transition-transform select-none", isOpen && "rotate-180")}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {isOpen && !disabled && (
                    <div className={cn(
                        "absolute z-50 w-full mt-1 bg-glass backdrop-blur-md border border-glass-border rounded-md shadow-gold-lg overflow-hidden",
                        styles.selectDropdown
                    )}>
                        {searchable && (
                            <div className="p-2 border-b border-glass-border">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="w-full bg-secondary/50 border-none rounded p-1.5 text-sm text-text-primary focus:ring-1 focus:ring-accent outline-none"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                        )}

                        <ul className={cn("max-h-60 overflow-y-auto py-1", styles.optionsList)}>
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <li
                                        key={option.value}
                                        className={cn(
                                            "px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors select-none",
                                            "hover:bg-accent/10",
                                            isSelected(option.value) && "bg-accent/5 text-accent font-medium"
                                        )}
                                        onClick={() => handleSelect(option)}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected(option.value) && (
                                            <span className="text-accent">✓</span>
                                        )}
                                    </li>
                                ))
                            ) : (
                                <li className="px-3 py-4 text-center text-sm text-text-secondary">
                                    No options found
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <p className={cn("text-xs select-none", error ? "text-red-500" : "text-text-secondary")}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

export default Select;
