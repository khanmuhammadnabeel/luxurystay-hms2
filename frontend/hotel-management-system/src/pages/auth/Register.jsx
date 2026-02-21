import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../contexts/LocalizationContext';
import { Button, Input, ErrorMessage, PhoneInput } from '../../components/ui';
import { User, Mail, Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';
import styles from './Auth.module.css';

const Register = () => {
  const { t, isRTL } = useLocalization();
  const { register, authActionLoading, error } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'guest'
      });
      navigate('/dashboard');
    } catch (err) {
      // Context error handles visual feedback
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t('dashboard.register.title')}</h2>
        <p className={styles.subtitle}>{t('dashboard.register.subtitle')}</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {(error || localError) && <ErrorMessage message={error || localError} className="mb-6" />}

        <div className={styles.inputGroup}>
          <Input
            label={t('dashboard.register.fullname')}
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            icon={<User size={18} />}
            fullWidth
          />
        </div>

        <div className={styles.inputGrid}>
          <Input
            label={t('dashboard.register.email')}
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            icon={<Mail size={18} />}
            fullWidth
          />
          <PhoneInput
            label={t('dashboard.register.phone')}
            type="tel"
            placeholder="300 1234567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            fullWidth
          />
        </div>

        <div className={styles.inputGrid}>
          <Input
            label={t('dashboard.register.password')}
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            icon={<Lock size={18} />}
            fullWidth
          />
          <Input
            label={t('dashboard.register.confirm_password')}
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
          {t('dashboard.register.submit')}
        </Button>
      </form>

      <footer className={styles.footer}>
        <p>
          {t('dashboard.register.already_account')}{' '}
          <NavLink to="/login" className={styles.switchLink}>
            {t('dashboard.register.login_here')}
          </NavLink>
        </p>
      </footer>
    </div>
  );
};

export default Register;
