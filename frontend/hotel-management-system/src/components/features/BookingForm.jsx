import React from 'react';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLocalization } from '../../contexts';
import { Button, Input } from '../ui';
import { cn } from '../../lib/utils';
import styles from './BookingForm.module.css';

const BookingForm = ({
    step,
    formData,
    updateFormData,
    toggleAddOn,
    onNext,
    onBack,
    addOnsData
}) => {
    const { t, language } = useLocalization();
    const isUrdu = language === 'Urdu';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateFormData({ [name]: value });
    };

    const renderStep1 = () => (
        <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>{t('booking.contactInfo')}</h2>
            <div className={styles.grid}>
                <Input
                    label={t('booking.firstName')}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                    clearable
                />
                <Input
                    label={t('booking.lastName')}
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                    clearable
                />
                <Input
                    label={t('booking.email')}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                    clearable
                />
                <Input
                    label={t('booking.phone')}
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 234 567 890"
                    required
                    clearable
                />
                <div className={styles.fullWidth}>
                    <label className="block text-sm font-semibold mb-2">
                        {t('booking.specialRequests')}
                        <span className="opacity-50 ml-2">({t('booking.requestsOptional')})</span>
                    </label>
                    <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        placeholder={t('booking.requestsPlaceholder')}
                        className="w-full bg-[var(--color-secondary)] border border-[var(--glass-border)] rounded-[var(--radius-lg)] p-4 focus:outline-none focus:border-[var(--color-accent)] min-h-[120px] transition-colors"
                    />
                </div>
            </div>

            <div className="mt-12">
                <h2 className={styles.sectionTitle}>{t('booking.addOns')}</h2>
                <div className={styles.addOnsGrid}>
                    {addOnsData.map(addon => (
                        <div
                            key={addon.id}
                            className={cn(
                                styles.addOnCard,
                                formData.addOns.includes(addon.id) && styles.addOnSelected
                            )}
                            onClick={() => toggleAddOn(addon.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={styles.checkbox}>
                                    {formData.addOns.includes(addon.id) && <Check size={14} />}
                                </div>
                                <div className={styles.addOnInfo}>
                                    <h4>{isUrdu ? addon.nameUr : addon.name}</h4>
                                    <p>{addon.description}</p>
                                </div>
                            </div>
                            <span className={styles.addOnPrice}>+${addon.price}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.actions}>
                <Button
                    rightIcon={isUrdu ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                    onClick={onNext}
                    className="px-8"
                    disabled={!formData.firstName || !formData.email}
                >
                    {t('booking.continueToPayment')}
                </Button>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            {renderStep1()}
        </div>
    );
};

export default BookingForm;
