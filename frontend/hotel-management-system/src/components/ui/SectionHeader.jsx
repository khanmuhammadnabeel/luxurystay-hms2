import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * SectionHeader - Reusable heading block for homepage sections.
 * Renders a pre-title label, a main title, and an optional subtitle.
 */
const SectionHeader = ({
    preTitle,
    title,
    subtitle,
    align = 'center',
    className,
}) => {
    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }[align] || 'text-center';

    return (
        <div className={clsx('mb-12 md:mb-16', alignClass, className)}>
            {preTitle && (
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3 select-none">
                    {preTitle}
                </p>
            )}
            <h2 className="font-serif text-[2rem] sm:text-[2.5rem] lg:text-[3rem] text-[var(--color-text-primary)] leading-tight">
                {title}
            </h2>
            {subtitle && (
                <p className="mt-4 text-[15px] sm:text-[16px] text-[var(--color-text-secondary)] font-light max-w-2xl mx-auto leading-relaxed">
                    {subtitle}
                </p>
            )}
            {/* Gold decorative divider */}
            <div className="mt-6 flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-[var(--color-accent)] opacity-40" />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                <div className="h-px w-12 bg-[var(--color-accent)] opacity-40" />
            </div>
        </div>
    );
};

SectionHeader.propTypes = {
    preTitle: PropTypes.string,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    align: PropTypes.oneOf(['left', 'center', 'right']),
    className: PropTypes.string,
};

export default SectionHeader;
