import React from 'react';
import { Check } from 'lucide-react';
import { useLocalization } from '../../contexts';
import { cn } from '../../lib/utils';
import styles from './BookingStepper.module.css';

const BookingStepper = ({ currentStep }) => {
    const { t } = useLocalization();

    return (
        <div className={styles.stepper}>
            <div className={styles.stepWrapper}>
                <div className={cn(
                    styles.stepCircle,
                    currentStep === 1 && styles.activeCircle,
                    currentStep > 1 && styles.completedCircle
                )}>
                    {currentStep > 1 ? <Check size={18} /> : 1}
                </div>
                <span className={cn(styles.stepLabel, currentStep === 1 && styles.activeLabel)}>
                    {t('booking.guestDetails')}
                </span>
            </div>

            <div className={cn(styles.stepLine, currentStep > 1 && styles.activeLine)} />

            <div className={styles.stepWrapper}>
                <div className={cn(
                    styles.stepCircle,
                    currentStep === 2 && styles.activeCircle
                )}>
                    2
                </div>
                <span className={cn(styles.stepLabel, currentStep === 2 && styles.activeLabel)}>
                    {t('booking.payment')}
                </span>
            </div>
        </div>
    );
};

export default BookingStepper;
