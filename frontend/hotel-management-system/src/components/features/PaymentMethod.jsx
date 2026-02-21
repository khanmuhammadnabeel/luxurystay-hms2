import React from 'react';
import { CreditCard, Wallet, Hotel, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import { useLocalization } from '../../contexts';
import { Button, Input } from '../ui';
import { cn } from '../../lib/utils';
import styles from './PaymentMethod.module.css';

const PaymentMethod = ({
    paymentData,
    updatePaymentData,
    onBack,
    onConfirm,
    loading,
    totalPrice
}) => {
    const { t, activeCurrency } = useLocalization();

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: activeCurrency.code,
        }).format(amount);
    };

    const methods = [
        { id: 'card', label: t('payment.card'), icon: <CreditCard size={24} /> },
        { id: 'paypal', label: 'PayPal', icon: <Wallet size={24} /> },
        { id: 'hotel', label: t('payment.payAtHotel'), icon: <Hotel size={24} /> }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updatePaymentData({ [name]: value });
    };

    return (
        <div className={styles.container}>
            <h2 className="text-xl font-semibold mb-6">{t('payment.selectMethod')}</h2>

            <div className={styles.methodsGrid}>
                {methods.map(method => (
                    <div
                        key={method.id}
                        className={cn(
                            styles.methodCard,
                            paymentData.method === method.id && styles.methodSelected
                        )}
                        onClick={() => updatePaymentData({ method: method.id })}
                    >
                        <div className={styles.methodIcon}>{method.icon}</div>
                        <span className={styles.methodLabel}>{method.label}</span>
                    </div>
                ))}
            </div>

            {paymentData.method === 'card' && (
                <div className={styles.cardForm}>
                    <div className={styles.formGrid}>
                        <Input
                            label={t('payment.cardName')}
                            name="cardName"
                            value={paymentData.cardName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className={styles.fullWidth}
                            required
                        />
                        <Input
                            label={t('payment.cardNumber')}
                            name="cardNumber"
                            value={paymentData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="0000 0000 0000 0000"
                            className={styles.fullWidth}
                            required
                        />
                        <Input
                            label={t('payment.expiry')}
                            name="expiry"
                            value={paymentData.expiry}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            required
                        />
                        <Input
                            label={t('payment.cvv')}
                            name="cvv"
                            type="password"
                            value={paymentData.cvv}
                            onChange={handleInputChange}
                            placeholder="***"
                            required
                        />
                    </div>
                    <div className={styles.securityNote}>
                        <Lock size={14} className="text-green-500" />
                        <span>{t('booking.securePayment')}</span>
                    </div>
                </div>
            )}

            {paymentData.method === 'paypal' && (
                <div className="p-8 text-center bg-[var(--color-bg-secondary)] border border-[var(--glass-border)] rounded-[var(--radius-xl)]">
                    <p className="opacity-70 mb-4">You will be redirected to PayPal to complete your payment.</p>
                    <Wallet size={48} className="mx-auto text-[var(--color-accent)] opacity-40" />
                </div>
            )}

            {paymentData.method === 'hotel' && (
                <div className="p-8 text-center bg-[var(--color-bg-secondary)] border border-[var(--glass-border)] rounded-[var(--radius-xl)]">
                    <p className="opacity-70 mb-4">No payment required now. You can pay at the reception upon arrival.</p>
                    <Hotel size={48} className="mx-auto text-[var(--color-accent)] opacity-40" />
                </div>
            )}

            <div className={styles.actions}>
                <Button
                    variant="ghost"
                    leftIcon={<ArrowLeft size={18} />}
                    onClick={onBack}
                    disabled={loading}
                >
                    Back
                </Button>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <span className="block text-xs uppercase font-bold opacity-50">Total to pay</span>
                        <span className="text-xl font-bold text-[var(--color-accent)]">{formatPrice(totalPrice)}</span>
                    </div>
                    <Button
                        className={styles.confirmBtn}
                        onClick={onConfirm}
                        loading={loading}
                        disabled={paymentData.method === 'card' && (!paymentData.cardNumber || !paymentData.cardName)}
                    >
                        {t('booking.confirmAndPay')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethod;
