import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const thicknessMap = {
  thin: 'border',
  medium: 'border-2',
  thick: 'border-4',
};

const Divider = ({
  variant = 'horizontal',
  color = 'default',
  thickness = 'thin',
  children,
  orientation = 'center',
  className,
  ...props
}) => {
  const baseClass = clsx(
    'border-current',
    thicknessMap[thickness] || thicknessMap.thin,
    color === 'gold' ? 'border-accent' : 'border-secondary',
    className
  );

  // Horizontal Divider
  if (variant === 'horizontal') {
    return <hr className={clsx(baseClass, 'w-full select-none')} {...props} />;
  }

  // Vertical Divider
  if (variant === 'vertical') {
    return (
      <div
        className={clsx(baseClass, 'h-full inline-block align-middle select-none')}
        {...props}
      />
    );
  }

  // Dashed Divider
  if (variant === 'dashed') {
    return (
      <hr
        className={clsx(
          baseClass,
          'w-full border-dashed select-none',
          thickness === 'thin' ? 'border' : thickness === 'medium' ? 'border-2' : 'border-4'
        )}
        {...props}
      />
    );
  }

  // With Text Divider
  if (variant === 'with-text') {
    const alignmentClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    };

    return (
      <div className={clsx('flex items-center w-full gap-4', alignmentClasses[orientation])}>
        <hr className={clsx(baseClass, 'flex-1')} />
        <span className={clsx(
          'text-sm font-medium whitespace-nowrap select-none',
          color === 'gold' ? 'text-accent' : 'text-text-secondary'
        )}>
          {children}
        </span>
        <hr className={clsx(baseClass, 'flex-1')} />
      </div>
    );
  }

  return null;
};

Divider.propTypes = {
  variant: PropTypes.oneOf(['horizontal', 'vertical', 'dashed', 'with-text']),
  color: PropTypes.oneOf(['default', 'gold']),
  thickness: PropTypes.oneOf(['thin', 'medium', 'thick']),
  children: PropTypes.node,
  orientation: PropTypes.oneOf(['left', 'center', 'right']),
  className: PropTypes.string,
};

export default Divider;