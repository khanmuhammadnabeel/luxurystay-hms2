// src/components/features/FilterSection.jsx
import React from 'react';
import Divider from '../ui/Divider';

const FilterSection = ({ title, children, className = '' }) => {
    return (
        <div className={`mb-6 ${className}`}>
            <h4 className="font-serif text-[1.1rem] font-semibold text-[var(--color-text-primary)] mb-3">
                {title}
            </h4>
            {children}
            <Divider className="mt-6 opacity-50" />
        </div>
    );
};

export default FilterSection;
