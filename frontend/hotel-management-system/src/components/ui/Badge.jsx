import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    className,
    ...props
}) => {
    const variants = {
        default: 'bg-secondary text-text-secondary border-glass-border',
        primary: 'bg-accent/10 text-accent border-accent/20',
        gold: 'bg-accent text-primary border-accent',
        outline: 'bg-transparent text-accent border-accent',
        success: 'bg-green-500/10 text-green-500 border-green-500/20',
        danger: 'bg-red-500/10 text-red-500 border-red-500/20',
        warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    };

    const sizes = {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center justify-center font-medium rounded-full border transition-all duration-300',
                variants[variant] || variants.default,
                sizes[size] || sizes.md,
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

Badge.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['default', 'primary', 'gold', 'outline', 'success', 'danger', 'warning']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string,
};

export default Badge;
