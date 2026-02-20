import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as Icons from 'lucide-react';
import { useLocalization } from '../../contexts';
import { cn } from '../../lib/utils';
import styles from './RoomAmenities.module.css';

/**
 * RoomAmenities Component
 * Renders a grid of room amenities with icons and localized labels.
 */
const RoomAmenities = ({ amenities = [] }) => {
    const { language } = useLocalization();
    const [selectedIds, setSelectedIds] = useState(new Set());
    const isUrdu = language === 'Urdu';

    if (!amenities || amenities.length === 0) return null;

    const toggleSelection = (idx) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(idx)) {
            newSelected.delete(idx);
        } else {
            newSelected.add(idx);
        }
        setSelectedIds(newSelected);
    };

    return (
        <div className={styles.grid}>
            {amenities.map((item, idx) => {
                const IconComponent = Icons[item.icon] || Icons.Circle;
                const isActive = selectedIds.has(idx);

                return (
                    <div
                        key={idx}
                        className={cn(styles.card, isActive && styles.cardActive)}
                        onClick={() => toggleSelection(idx)}
                    >
                        <div className={styles.iconWrapper}>
                            <IconComponent size={24} strokeWidth={isActive ? 2 : 1.5} />
                        </div>
                        <span className={styles.label}>
                            {isUrdu ? item.labelUr || item.label : item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

RoomAmenities.propTypes = {
    amenities: PropTypes.arrayOf(PropTypes.shape({
        icon: PropTypes.string,
        label: PropTypes.string,
        labelUr: PropTypes.string
    }))
};

export default RoomAmenities;
