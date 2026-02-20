// src/components/ui/Rating.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Rating Component
 * Renders a 5-star rating system with support for fractional fills (e.g., 4.7 stars).
 */
const Rating = ({
    value = 0,
    max = 5,
    size = 14,
    className = '',
    showValue = false
}) => {
    // Ensure value is within bounds
    const validatedValue = Math.min(Math.max(value, 0), max);

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex gap-0.5" aria-label={`Rating: ${validatedValue} out of ${max} stars`}>
                {Array.from({ length: max }).map((_, i) => {
                    const fillAmount = Math.min(Math.max(validatedValue - i, 0), 1);
                    const starId = `star-grad-${i}-${validatedValue}`.replace('.', '-');

                    return (
                        <div key={i} className="relative text-[var(--color-accent)]">
                            {/* Background Star (Gray/Dashed) */}
                            <Star size={size} className="text-[#CFAF7E] opacity-20" strokeWidth={1.5} />

                            {/* Foreground Star (Gold) with Clip Path or Gradient */}
                            <div
                                className="absolute inset-0 overflow-hidden text-[var(--color-accent)]"
                                style={{ width: `${fillAmount * 100}%` }}
                            >
                                <Star size={size} fill="currentColor" strokeWidth={1.5} />
                            </div>
                        </div>
                    );
                })}
            </div>
            {showValue && (
                <span className="font-bold text-[var(--color-text-primary)]">
                    {validatedValue.toFixed(1)}
                </span>
            )}
        </div>
    );
};

Rating.propTypes = {
    value: PropTypes.number,
    max: PropTypes.number,
    size: PropTypes.number,
    className: PropTypes.string,
    showValue: PropTypes.bool
};

export default Rating;
