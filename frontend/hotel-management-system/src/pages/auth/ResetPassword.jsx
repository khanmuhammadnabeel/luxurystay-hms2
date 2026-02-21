import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../contexts/LocalizationContext';
import { Button, Input, ErrorMessage } from '../../components/ui';
import { Lock, Loader2 } from 'lucide-react';
import styles from './Auth.module.css';

const ResetPassword = () => {
    const { t } = useLocalization();
    const { resetPassword, authActionLoading, error } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);

        if (!token) {
            setLocalError("Invalid or missing reset token.");
            return;
        }

        if (password !== confirmPassword) {
            setLocalError("Passwords do not match.");
            return;
        }

        const ok = await resetPassword(token, password);
        if (ok) {
            // Show success alert or toast would be nice, but simple redirect for now
            alert(t('dashboard.reset.success_msg'));
            navigate('/login');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.title}>{t('dashboard.reset.title')}</h2>
                <p className={styles.subtitle}>{t('dashboard.reset.subtitle')}</p>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
                {(error || localError) && <ErrorMessage message={error || localError} className="mb-6" />}

                <div className={styles.inputGroup}>
                    <Input
                        label={t('dashboard.reset.new_password')}
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        icon={<Lock size={18} />}
                        fullWidth
                    />
                </div>

                <div className={styles.inputGroup}>
                    <Input
                        label={t('dashboard.reset.confirm_password')}
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        icon={<Lock size={18} />}
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
                        t('dashboard.reset.submit')
                    )}
                </Button>
            </form>
        </div>
    );
};

export default ResetPassword;
