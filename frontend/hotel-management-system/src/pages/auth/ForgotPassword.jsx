import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../contexts/LocalizationContext';
import { Button, Input, ErrorMessage } from '../../components/ui';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import styles from './Auth.module.css';

const ForgotPassword = () => {
    const { t, isRTL } = useLocalization();
    const { forgotPassword, authActionLoading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ok = await forgotPassword(email);
        if (ok) setSuccess(true);
    };

    if (success) {
        return (
            <div className={styles.container}>
                <div className="text-center py-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center">
                            <CheckCircle size={32} />
                        </div>
                    </div>
                    <h2 className={styles.title}>{t('dashboard.forgot.success_title')}</h2>
                    <p className={styles.subtitle}>
                        {t('dashboard.forgot.success_subtitle')} <strong>{email}</strong>
                    </p>
                    <div className="mt-8">
                        <NavLink to="/login" className={styles.switchLink}>
                            {t('dashboard.forgot.back_to_login')}
                        </NavLink>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.title}>{t('dashboard.forgot.title')}</h2>
                <p className={styles.subtitle}>{t('dashboard.forgot.subtitle')}</p>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
                {error && <ErrorMessage message={error} className="mb-6" />}

                <div className={styles.inputGroup}>
                    <Input
                        label={t('dashboard.forgot.email')}
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        icon={<Mail size={18} />}
                        fullWidth
                    />
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    disabled={authActionLoading}
                    className={styles.submitBtn}
                >
                    {authActionLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        t('dashboard.forgot.submit')
                    )}
                </Button>
            </form>

            <footer className={styles.footer}>
                <NavLink to="/login" className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors">
                    <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
                    {t('dashboard.forgot.back_to_login')}
                </NavLink>
            </footer>
        </div>
    );
};

export default ForgotPassword;
