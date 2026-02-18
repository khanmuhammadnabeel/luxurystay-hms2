import React, { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../ui';
import styles from './TimePicker.module.css';

const TimePicker = ({
    value,
    onChange,
    label,
    placeholder = "Select time",
    minTime, // "09:00"
    maxTime, // "22:00"
    minuteStep = 30,
    format = '12h', // '12h' | '24h'
    disabled = false,
    className,
    error,
    helperText,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [is12Hour, setIs12Hour] = useState(format === '12h');
    const containerRef = useRef(null);

    // Generate times
    const timeOptions = useMemo(() => {
        const times = [];
        const start = 0; // 00:00
        const end = 24 * 60; // 24:00

        for (let i = start; i < end; i += minuteStep) {
            const h = Math.floor(i / 60);
            const m = i % 60;
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

            // Check limits
            if (minTime && timeStr < minTime) continue;
            if (maxTime && timeStr > maxTime) continue;

            times.push(timeStr);
        }
        return times;
    }, [minuteStep, minTime, maxTime]);

    // Format display
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        if (!is12Hour) return timeStr;

        const [h, m] = timeStr.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    // Click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={cn(styles.container, className)} ref={containerRef}>
            <div onClick={() => !disabled && setIsOpen(!isOpen)}>
                <Input
                    label={label}
                    value={formatTime(value)}
                    placeholder={placeholder}
                    readOnly
                    disabled={disabled}
                    error={error}
                    helperText={helperText}
                    leftIcon={<Clock size={16} />}
                    className="cursor-pointer"
                />
            </div>

            {isOpen && !disabled && (
                <div className={styles.dropdown}>
                    {/* Header for 12h/24h toggle */}
                    <div className={styles.header}>
                        <span className="text-xs text-text-secondary">Format</span>
                        <div className={styles.toggleContainer}>
                            <button
                                className={cn(styles.toggleBtn, is12Hour && styles.active)}
                                onClick={() => setIs12Hour(true)}
                            >
                                12h
                            </button>
                            <button
                                className={cn(styles.toggleBtn, !is12Hour && styles.active)}
                                onClick={() => setIs12Hour(false)}
                            >
                                24h
                            </button>
                        </div>
                    </div>

                    <ul className={styles.timeList}>
                        {timeOptions.map((time) => (
                            <li
                                key={time}
                                className={cn(
                                    styles.timeOption,
                                    value === time && styles.selected
                                )}
                                onClick={() => {
                                    onChange(time);
                                    setIsOpen(false);
                                }}
                            >
                                <span>{formatTime(time)}</span>
                                {value === time && <span className="text-accent">✓</span>}
                            </li>
                        ))}
                        {timeOptions.length === 0 && (
                            <li className="p-4 text-center text-sm text-text-secondary">No times available</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

TimePicker.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    minTime: PropTypes.string,
    maxTime: PropTypes.string,
    minuteStep: PropTypes.number,
    format: PropTypes.oneOf(['12h', '24h']),
    disabled: PropTypes.bool,
    className: PropTypes.string,
    error: PropTypes.string,
    helperText: PropTypes.string,
};

export default TimePicker;
