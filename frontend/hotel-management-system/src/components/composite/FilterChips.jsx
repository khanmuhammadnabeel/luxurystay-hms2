import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Save, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button, Dropdown, Input } from '../ui';
import styles from './FilterChips.module.css';

const FilterChips = ({
    filters = [],
    onRemove,
    onClear,
    onAdd,
    onSavePreset,
    presets = [],
    onLoadPreset,
    className,
    variant = 'default', // default, outline, solid
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newFilterName, setNewFilterName] = useState('');

    // Handle removing a filter
    const handleRemove = (filterId) => {
        onRemove && onRemove(filterId);
    };

    return (
        <div className={cn(styles.container, className)}>
            {/* Active Filters */}
            {filters.map((filter) => (
                <div
    key={filter.id}
    className={cn(
        styles.chip,
        styles.enter,
        styles[variant],
        "animate-in fade-in zoom-in-95 duration-200 select-none"
    )}
>
    {filter.icon && <span className="w-4 h-4 select-none">{filter.icon}</span>}
    <span className="select-none">{filter.label}: <strong className="select-none">{filter.value}</strong></span>
    <button
        onClick={() => handleRemove(filter.id)}
        className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 ml-1"
        aria-label={`Remove ${filter.label} filter`}
    >
        <X size={14} />
    </button>
</div>
            ))}

            {/* Add Filter Button */}
            {onAdd && (
                <Dropdown
                    trigger={
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Plus size={14} />}
                            className="rounded-full border-dashed"
                        >
                            Filter
                        </Button>
                    }
                >
                    <div className="p-2 w-64">
                        <p className="text-xs text-text-secondary mb-2 font-medium px-2">ADD FILTER</p>
                        {/* This would typically map over available filter fields passed via props */}
                        {/* For showcase, we'll just show a placeholder demo */}
                        <div className="space-y-1">
                            {['Status', 'Type', 'Price Range', 'Date'].map(field => (
                                <Dropdown.Item key={field} onClick={() => onAdd(field)}>
                                    {field}
                                </Dropdown.Item>
                            ))}
                        </div>
                    </div>
                </Dropdown>
            )}

            {/* Clear All */}
            {filters.length > 0 && onClear && (
                <button
    onClick={onClear}
    className="text-sm text-text-secondary hover:text-red-500 transition-colors ml-2 select-none"
>
    Clear all
</button>
            )}

            {/* Presets Management (Optional) */}
            {(onSavePreset || presets.length > 0) && (
                <div className="ml-auto flex items-center gap-2 border-l border-border pl-2 border-accent/20">
                    {onSavePreset && (
                        <Button variant="ghost" size="sm" onClick={onSavePreset} title="Save current filters">
                            <Save size={14} />
                        </Button>
                    )}
                    {presets.length > 0 && (
                        <Dropdown
                            trigger={
                                <Button variant="ghost" size="sm">
                                    Presets
                                </Button>
                            }
                        >
                            {presets.map(preset => (
                                <Dropdown.Item key={preset.id} onClick={() => onLoadPreset(preset)}>
                                    <div className="flex justify-between items-center w-full min-w-[150px]">
                                        <span>{preset.name}</span>
                                        <span className="text-xs text-text-secondary bg-secondary px-1.5 rounded">
                                            {preset.count}
                                        </span>
                                    </div>
                                </Dropdown.Item>
                            ))}
                        </Dropdown>
                    )}
                </div>
            )}
        </div>
    );
};

FilterChips.propTypes = {
    filters: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        icon: PropTypes.node,
    })),
    onRemove: PropTypes.func,
    onClear: PropTypes.func,
    onAdd: PropTypes.func,
    onSavePreset: PropTypes.func,
    onLoadPreset: PropTypes.func,
    presets: PropTypes.array,
    className: PropTypes.string,
    variant: PropTypes.oneOf(['default', 'outline', 'solid']),
};

export default FilterChips;
