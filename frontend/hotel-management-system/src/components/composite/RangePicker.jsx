import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Calendar as CalendarIcon, ArrowRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui';
import Calendar from './Calendar';
import styles from './RangePicker.module.css';
import { useLocalization } from '../../contexts';

const RangePicker = ({
    value = { start: null, end: null },
    onChange,
    minDate,
    maxDate,
    disabled = false,
    className,
    error,
}) => {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

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

    const handleDateSelect = (range) => {
        onChange(range);
    };

    const handlePreset = (days) => {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + days);
        onChange({ start, end });
    };

    const displayStart = value?.start ? value.start.toLocaleDateString() : '';
    const displayEnd = value?.end ? value.end.toLocaleDateString() : '';

    return (
        <div className={cn(styles.container, className)} ref={containerRef}>
            {/* Input Trigger */}
            <div
                className={cn(styles.inputs, error && "border-red-500")}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <CalendarIcon size={16} className="text-text-secondary" />
                <span
                    className={cn(styles.dateDisplay, !displayStart && styles.placeholder)}
                >
                    {displayStart || t('booking.checkIn')}
                </span>
                <ArrowRight size={14} className={styles.separator} />
                <span
                    className={cn(styles.dateDisplay, !displayEnd && styles.placeholder)}
                >
                    {displayEnd || t('booking.checkOut')}
                </span>
                {(value?.start || value?.end) && (
                    <X
                        size={16}
                        className="cursor-pointer text-text-secondary hover:text-red-500"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange({ start: null, end: null });
                        }}
                    />
                )}
            </div>

            {/* Popover */}
            {isOpen && !disabled && (
                <div className={styles.popover}>
                    <div className={styles.sidebar}>
                        <button className={styles.presetBtn} onClick={() => handlePreset(0)}>{t('booking.today')}</button>
                        <button className={styles.presetBtn} onClick={() => handlePreset(1)}>{t('booking.tomorrow')}</button>
                        <button className={styles.presetBtn} onClick={() => handlePreset(2)}>{t('showcase.specialOffer')}</button>
                        <button className={styles.presetBtn} onClick={() => handlePreset(7)}>{t('booking.pickDate')}</button>
                    </div>

                    <div className={styles.calendars}>
                        <Calendar
                            value={value}
                            onChange={handleDateSelect}
                            variant="range"
                            minDate={minDate}
                            maxDate={maxDate}
                            className="border-none shadow-none"
                        />
                    </div>

                </div>
            )}
        </div>
    );
};

RangePicker.propTypes = {
    value: PropTypes.shape({
        start: PropTypes.instanceOf(Date),
        end: PropTypes.instanceOf(Date)
    }),
    onChange: PropTypes.func.isRequired,
    minDate: PropTypes.instanceOf(Date),
    maxDate: PropTypes.instanceOf(Date),
    disabled: PropTypes.bool,
    className: PropTypes.string,
    error: PropTypes.string,
};

export default RangePicker;