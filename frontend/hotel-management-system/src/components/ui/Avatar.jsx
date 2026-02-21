import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const Avatar = ({ src, alt, size = 'md', className, ...rest }) => {
    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl',
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div
            className={clsx(
                'relative inline-flex items-center justify-center overflow-hidden rounded-full',
                'bg-[var(--color-secondary)] border border-[rgba(207,175,126,0.3)]',
                'text-[var(--color-accent)] font-semibold',
                sizeClasses[size] || sizeClasses.md,
                className
            )}
            {...rest}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            ) : (
                <span>{getInitials(alt)}</span>
            )}
        </div>
    );
};

Avatar.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    className: PropTypes.string,
};

export default Avatar;
