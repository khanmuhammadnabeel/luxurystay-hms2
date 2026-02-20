import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../ui';
import { useLocalization } from '../../contexts';

const EmptyState = ({ onClear }) => {
    const { t } = useLocalization();

    return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-[var(--color-secondary)]/30 rounded-2xl border border-dashed border-[var(--glass-border)]">
            <div className="text-8xl mb-6 select-none opacity-80">🏨</div>
            <h3 className="text-[1.75rem] font-serif font-bold text-[var(--color-text-primary)] mb-3">
                {t('rooms_listing.noRooms')}
            </h3>
            <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-md">
                {t('rooms_listing.tryAdjusting')}
            </p>
            <Button
                variant="primary"
                size="lg"
                onClick={onClear}
                className="px-8"
            >
                {t('rooms_listing.clearAll')}
            </Button>
        </div>
    );
};

EmptyState.propTypes = {
    onClear: PropTypes.func.isRequired
};

export default EmptyState;
