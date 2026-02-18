import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import styles from './Calendar.module.css';

const VIEW_MODES = {
    DAYS: 'days',
    MONTHS: 'months',
    YEARS: 'years',
    DECADES: 'decades'
};

const Calendar = ({
    value,
    onChange,
    variant = 'single', // single, range, multiple
    minDate,
    maxDate,
    disabledDates = [],
    className,
    weekStartsOn = 0, // 0 = Sunday, 1 = Monday
}) => {
    // Determine initial view date
    const initialDate = useMemo(() => {
        if (value instanceof Date) return value;
        if (Array.isArray(value) && value[0] instanceof Date) return value[0];
        if (typeof value === 'object' && value?.start instanceof Date) return value.start;
        return new Date();
    }, [value]);

    const [viewDate, setViewDate] = useState(initialDate);
    const [viewMode, setViewMode] = useState(VIEW_MODES.DAYS);
    const [hoverDate, setHoverDate] = useState(null);

    // Helpers
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const isSameDay = (d1, d2) => {
        if (!d1 || !d2) return false;
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const isDateDisabled = (date) => {
        if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
        if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) return true;
        return disabledDates.some(d => isSameDay(d, date));
    };

    const isSelected = (date) => {
        if (variant === 'single') return isSameDay(date, value);
        if (variant === 'multiple') return Array.isArray(value) && value.some(d => isSameDay(d, date));
        if (variant === 'range') {
            if (!value || (!value.start && !value.end)) return false;
            if (value.start && isSameDay(date, value.start)) return true;
            if (value.end && isSameDay(date, value.end)) return true;
            return false;
        }
        return false;
    };

    const isInRange = (date) => {
        if (variant !== 'range' || !value || !value.start) return false;
        const start = value.start;
        const end = value.end || hoverDate;
        if (!end) return false;

        return (date > start && date < end) || (date > end && date < start);
    };

    // Navigation
    const handlePrev = () => {
        const newDate = new Date(viewDate);
        if (viewMode === VIEW_MODES.DAYS) newDate.setMonth(newDate.getMonth() - 1);
        else if (viewMode === VIEW_MODES.MONTHS) newDate.setFullYear(newDate.getFullYear() - 1);
        else if (viewMode === VIEW_MODES.YEARS) newDate.setFullYear(newDate.getFullYear() - 10);
        else if (viewMode === VIEW_MODES.DECADES) newDate.setFullYear(newDate.getFullYear() - 100);
        setViewDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(viewDate);
        if (viewMode === VIEW_MODES.DAYS) newDate.setMonth(newDate.getMonth() + 1);
        else if (viewMode === VIEW_MODES.MONTHS) newDate.setFullYear(newDate.getFullYear() + 1);
        else if (viewMode === VIEW_MODES.YEARS) newDate.setFullYear(newDate.getFullYear() + 10);
        else if (viewMode === VIEW_MODES.DECADES) newDate.setFullYear(newDate.getFullYear() + 100);
        setViewDate(newDate);
    };

    const handleTitleClick = () => {
        if (viewMode === VIEW_MODES.DAYS) setViewMode(VIEW_MODES.MONTHS);
        else if (viewMode === VIEW_MODES.MONTHS) setViewMode(VIEW_MODES.YEARS);
        else if (viewMode === VIEW_MODES.YEARS) setViewMode(VIEW_MODES.DECADES);
    };

    // Date Selection
    const handleDateClick = (date) => {
        if (isDateDisabled(date)) return;

        if (variant === 'single') {
            onChange(date);
        } else if (variant === 'multiple') {
            const newValue = Array.isArray(value) ? [...value] : [];
            const exists = newValue.findIndex(d => isSameDay(d, date));
            if (exists >= 0) newValue.splice(exists, 1);
            else newValue.push(date);
            onChange(newValue);
        } else if (variant === 'range') {
            if (!value || (value.start && value.end) || !value.start) {
                // Start a new range
                onChange({ start: date, end: null });
            } else {
                // Complete the range
                let start = value.start;
                let end = date;
                if (end < start) [start, end] = [end, start];
                onChange({ start, end });
            }
        }
    };

    // Render Logic
    const renderHeader = () => {
        let title = '';
        if (viewMode === VIEW_MODES.DAYS) {
            title = viewDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });
        } else if (viewMode === VIEW_MODES.MONTHS) {
            title = viewDate.getFullYear();
        } else if (viewMode === VIEW_MODES.YEARS) {
            const startYear = Math.floor(viewDate.getFullYear() / 10) * 10;
            title = `${startYear} - ${startYear + 9}`;
        } else if (viewMode === VIEW_MODES.DECADES) {
            const startYear = Math.floor(viewDate.getFullYear() / 100) * 100;
            title = `${startYear} - ${startYear + 99}`;
        }

        return (
            <div className={styles.header}>
                <button onClick={handlePrev} className={styles.navButton} aria-label="Previous">
                    <ChevronLeft size={20} />
                </button>
                <div onClick={handleTitleClick} className={styles.monthYear}>
                    {title}
                </div>
                <button onClick={handleNext} className={styles.navButton} aria-label="Next">
                    <ChevronRight size={20} />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        // Adjust for week start
        const startOffset = (firstDay - weekStartsOn + 7) % 7;

        const days = [];
        const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        // Header Row
        const weekHeaders = daysOfWeek.map((d, i) => (
            <div key={`head-${i}`} className={styles.dayHeader}>
                {daysOfWeek[(i + weekStartsOn) % 7]}
            </div>
        ));

        // Empty Cells
        for (let i = 0; i < startOffset; i++) {
            days.push(<div key={`empty-${i}`} />);
        }

        // Days
        const today = new Date();
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const disabled = isDateDisabled(date);
            const selected = isSelected(date);
            const isRangeStart = variant === 'range' && value?.start && isSameDay(date, value.start);
            const isRangeEnd = variant === 'range' && value?.end && isSameDay(date, value.end);
            const inRange = isInRange(date);
            const isToday = isSameDay(date, today);

            days.push(
                <div
                    key={d}
                    className={cn(
                        styles.cell,
                        selected && styles.selected,
                        isRangeStart && styles.rangeStart,
                        isRangeEnd && styles.rangeEnd,
                        inRange && styles.inRange,
                        disabled && styles.disabled,
                        isToday && styles.today
                    )}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => variant === 'range' && !value?.end && value?.start && setHoverDate(date)}
                    onMouseLeave={() => setHoverDate(null)}
                >
                    {d}
                </div>
            );
        }

        return (
            <div className={cn(styles.grid, styles.daysGrid)}>
                {weekHeaders}
                {days}
            </div>
        );
    };

    const renderMonths = () => {
        const months = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date(viewDate.getFullYear(), i, 1);
            const isCurrentMonth = new Date().getMonth() === i && new Date().getFullYear() === viewDate.getFullYear();

            months.push(
                <div
                    key={i}
                    className={cn(
                        styles.largeCell,
                        isCurrentMonth && "text-accent font-bold"
                    )}
                    onClick={() => {
                        const newDate = new Date(viewDate);
                        newDate.setMonth(i);
                        setViewDate(newDate);
                        setViewMode(VIEW_MODES.DAYS);
                    }}
                >
                    {date.toLocaleDateString('default', { month: 'short' })}
                </div>
            );
        }
        return <div className={cn(styles.grid, styles.monthsGrid)}>{months}</div>;
    };

    const renderYears = () => {
        const startYear = Math.floor(viewDate.getFullYear() / 10) * 10;
        const years = [];
        for (let i = 0; i < 10; i++) { // 10 years per decade view
            const year = startYear + i;
            const isCurrentYear = new Date().getFullYear() === year;

            years.push(
                <div
                    key={year}
                    className={cn(
                        styles.largeCell,
                        isCurrentYear && "text-accent font-bold"
                    )}
                    onClick={() => {
                        const newDate = new Date(viewDate);
                        newDate.setFullYear(year);
                        setViewDate(newDate);
                        setViewMode(VIEW_MODES.MONTHS);
                    }}
                >
                    {year}
                </div>
            );
        }
        return <div className={cn(styles.grid, styles.yearsGrid)}>{years}</div>;
    };

    // Decades view - optional but nice for deep navigation
    const renderDecades = () => {
        const startYear = Math.floor(viewDate.getFullYear() / 100) * 100;
        const decades = [];
        for (let i = 0; i < 10; i++) {
            const year = startYear + (i * 10);
            decades.push(
                <div
                    key={year}
                    className={styles.largeCell}
                    onClick={() => {
                        const newDate = new Date(viewDate);
                        newDate.setFullYear(year);
                        setViewDate(newDate);
                        setViewMode(VIEW_MODES.YEARS);
                    }}
                >
                    {year}-{year + 9}
                </div>
            )
        }
        return <div className={cn(styles.grid, styles.decadesGrid)}>{decades}</div>;
    }

    return (
        <div className={cn(styles.calendar, className)}>
            {renderHeader()}
            {viewMode === VIEW_MODES.DAYS && renderDays()}
            {viewMode === VIEW_MODES.MONTHS && renderMonths()}
            {viewMode === VIEW_MODES.YEARS && renderYears()}
            {viewMode === VIEW_MODES.DECADES && renderDecades()}
        </div>
    );
};

Calendar.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.instanceOf(Date),
        PropTypes.arrayOf(PropTypes.instanceOf(Date)),
        PropTypes.shape({
            start: PropTypes.instanceOf(Date),
            end: PropTypes.instanceOf(Date)
        })
    ]),
    onChange: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(['single', 'range', 'multiple']),
    minDate: PropTypes.instanceOf(Date),
    maxDate: PropTypes.instanceOf(Date),
    disabledDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
    className: PropTypes.string,
    weekStartsOn: PropTypes.number,
};

export default Calendar;
