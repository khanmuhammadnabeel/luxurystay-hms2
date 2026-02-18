import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input, Button } from '../ui';
import Calendar from './Calendar';
import styles from './DatePicker.module.css';

const DatePicker = ({
    value,
    onChange,
    label,
    placeholder = "Select date",
    format = 'date', // 'date' | 'local'
    variant = 'input', // input, button, inline
    position = 'bottom-left', // bottom-left, bottom-right, top-left, top-right
    minDate,
    maxDate,
    disabled = false,
    className,
    error,
    helperText,
    showQuickSelects = true,
}) => {
    const [isOpen, setIsOpen] = useState(variant === 'inline');
    const containerRef = useRef(null);

    // Format display value
    const displayValue = value ? new Date(value).toLocaleDateString() : '';

    // Click outside handler
    useEffect(() => {
        if (variant === 'inline') return;

        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [variant]);

    const handleDateSelect = (date) => {
        onChange(date);
        if (variant !== 'inline') {
            setIsOpen(false);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange(null);
    };

    // Quick Selects
    const quickSelects = [
        { label: 'Today', getValue: () => new Date() },
        { label: 'Tomorrow', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
        { label: 'Next Week', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; } },
    ];

    const renderInputTrigger = () => (
        <div className="relative" onClick={() => !disabled && setIsOpen(!isOpen)}>
            <Input
                label={label}
                value={displayValue}
                placeholder={placeholder}
                readOnly
                disabled={disabled}
                error={error}
                helperText={helperText}
                leftIcon={<CalendarIcon size={16} className={styles.inputIcon} />}
                rightIcon={value && !disabled ? (
                    <X
                        size={16}
                        className="cursor-pointer hover:text-red-500 transition-colors"
                        onClick={handleClear}
                    />
                ) : null}
                className={cn("cursor-pointer", className)}
            />
        </div>
    );

    const renderButtonTrigger = () => (
        <Button
            variant="outline"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn("justify-start font-normal", !value && "text-muted-foreground", className)}
            leftIcon={<CalendarIcon size={16} />}
        >
            {displayValue || placeholder}
        </Button>
    );

    return (
        <div className={cn(styles.container, className)} ref={containerRef}>
            {variant === 'input' && renderInputTrigger()}
            {variant === 'button' && renderButtonTrigger()}

            {(isOpen || variant === 'inline') && (
                <div className={cn(
                    variant !== 'inline' ? styles.popover : "relative border rounded-xl",
                    variant !== 'inline' && styles[position]
                )}>
                    {showQuickSelects && !disabled && (
                        <div className={styles.quickSelects}>
                            {quickSelects.map((qs, idx) => (
                                <div
                                    key={idx}
                                    className={styles.quickChip}
                                    onClick={() => handleDateSelect(qs.getValue())}
                                >
                                    {qs.label}
                                </div>
                            ))}
                        </div>
                    )}

                    <Calendar
                        value={value ? new Date(value) : undefined}
                        onChange={handleDateSelect}
                        variant="single"
                        minDate={minDate ? new Date(minDate) : undefined}
                        maxDate={maxDate ? new Date(maxDate) : undefined}
                        className="border-none shadow-none max-w-full"
                    />

                    {variant !== 'inline' && (
                        <div className={styles.footer}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDateSelect(new Date())}
                                className="text-xs h-7"
                            >
                                Today
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="text-xs h-7"
                            >
                                Done
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

DatePicker.propTypes = {
    value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    variant: PropTypes.oneOf(['input', 'button', 'inline']),
    position: PropTypes.oneOf(['bottom-left', 'bottom-right', 'top-left', 'top-right']),
    minDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    maxDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    disabled: PropTypes.bool,
    className: PropTypes.string,
    error: PropTypes.string,
    helperText: PropTypes.string,
    showQuickSelects: PropTypes.bool,
};

export default DatePicker;
