import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../contexts/LocalizationContext';
import { Button, Input, ErrorMessage } from '../../components/ui';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import styles from './Auth.module.css';

const Login = () => {
  const { t, isRTL } = useLocalization();
  const { login, authActionLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by context state
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t('dashboard.login.title')}</h2>
        <p className={styles.subtitle}>{t('dashboard.login.subtitle')}</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} className="mb-6" />}

        <div className={styles.inputGroup}>
          <Input
            label={t('dashboard.login.email')}
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            icon={<Mail size={18} />}
            fullWidth
          />
        </div>

        <div className={styles.inputGroup}>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-text-secondary uppercase tracking-widest font-semibold">
              {t('dashboard.login.password')}
            </label>
            <NavLink to="/forgot-password" className={styles.forgotLink}>
              {t('dashboard.login.forgot_password')}
            </NavLink>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          loading={authActionLoading}
          className={styles.submitBtn}
          rightIcon={<ArrowRight size={18} className={isRTL ? "rotate-180" : ""} />}
        >
          {t('dashboard.login.submit')}
        </Button>
      </form>

      <footer className={styles.footer}>
        <p>
          {t('dashboard.login.no_account')}{' '}
          <NavLink to="/register" className={styles.switchLink}>
            {t('dashboard.login.register_here')}
          </NavLink>
        </p>
      </footer>
    </div>
  );
};

export default Login;
