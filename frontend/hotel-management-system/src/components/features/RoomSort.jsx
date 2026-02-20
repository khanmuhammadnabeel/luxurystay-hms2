import React from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';
import { Dropdown, Button } from '../ui';
import { useLocalization } from '../../contexts';
import { cn } from '../../lib/utils';

const RoomSort = ({ value, onChange, className }) => {
    const { t } = useLocalization();

    const sortOptions = [
        { value: 'price-asc', label: t('rooms_listing.sort.priceLowToHigh') },
        { value: 'price-desc', label: t('rooms_listing.sort.priceHighToLow') },
        { value: 'rating-desc', label: t('rooms_listing.sort.topRated') },
        { value: 'popularity', label: t('rooms_listing.sort.mostPopular') },
        { value: 'newest', label: t('rooms_listing.sort.newest') }
    ];

    const currentOption = sortOptions.find(o => o.value === value) || sortOptions[0];

    return (
        <Dropdown
            trigger={
                <Button
                    variant="outline"
                    className={cn(
                        "h-10 px-3.5 border-[var(--glass-border)] hover:border-[#CFAF7E]/40 bg-glass/20 backdrop-blur-sm transition-all duration-300 group whitespace-nowrap w-auto",
                        className
                    )}
                    rightIcon={<ChevronDown size={14} className="text-[#CFAF7E] transition-transform duration-300 group-aria-expanded:rotate-180" />}
                >
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-serif font-bold">
                            {t('rooms_listing.sort.label')}
                        </span>
                        <span className="text-[12px] font-bold text-[var(--color-text-primary)]">
                            {currentOption.label}
                        </span>
                    </div>
                </Button>
            }
        >
            {sortOptions.map(option => (
                <Dropdown.Item
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={cn(
                        "py-2.5 hover:text-[#CFAF7E] transition-colors",
                        value === option.value ? 'text-[#CFAF7E] font-bold bg-[#CFAF7E]/5' : 'text-[var(--color-text-primary)]'
                    )}
                >
                    {option.label}
                </Dropdown.Item>
            ))}
        </Dropdown>
    );
};

RoomSort.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string
};

export default RoomSort;
