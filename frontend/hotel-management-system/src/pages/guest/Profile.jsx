import React, { useState, useEffect } from 'react';
import { useGuest } from '../../hooks/useGuest';
import { useLocalization } from '../../contexts/LocalizationContext';
import { Card, Input, Button, SectionHeader, Avatar, PhoneInput } from '../../components/ui';
import { Camera, Mail, Phone, User, ShieldCheck } from 'lucide-react';
import styles from './Profile.module.css';

const Profile = () => {
  const { t } = useLocalization();
  const { profile, updateProfile, loading } = useGuest();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <SectionHeader
          title={t('dashboard.profile.title')}
          subtitle={t('dashboard.profile.subtitle')}
        />
      </header>

      <div className={styles.layout}>
        {/* Profile Card */}
        <div className={styles.leftCol}>
          <Card className={styles.profileCard}>
            <div className={styles.avatarWrapper}>
              <Avatar src={profile?.avatar} alt={profile?.name} size="xl" />
              <button className={styles.avatarEditBtn} title={t('dashboard.profile.change_avatar')}>
                <Camera size={16} />
              </button>
            </div>
            <div className={styles.profileHeaderInfo}>
              <h2 className={styles.name}>{profile?.name}</h2>
              <Badge variant="accent">{t(`roles.${profile?.role || 'guest'}`)}</Badge>
            </div>
            <div className={styles.accountStats}>
              <div className={styles.stat}>
                <span className={styles.statVal}>{profile?.bookingsCount || 0}</span>
                <span className={styles.statLabel}>{t('dashboard.profile.stays')}</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.stat}>
                <span className={styles.statVal}>Gold</span>
                <span className={styles.statLabel}>{t('dashboard.profile.status')}</span>
              </div>
            </div>
          </Card>

          <Card className={styles.securityCard}>
            <div className={styles.securityHeader}>
              <ShieldCheck size={20} className={styles.securityIcon} />
              <h3>{t('dashboard.profile.security')}</h3>
            </div>
            <p>{t('dashboard.profile.password_msg')}</p>
            <Button variant="outline" size="sm" fullWidth>
              {t('dashboard.profile.change_password')}
            </Button>
          </Card>
        </div>

        {/* Form Col */}
        <div className={styles.rightCol}>
          <Card className={styles.formCard}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <Input
                  label={t('dashboard.profile.full_name')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={<User size={18} />}
                  required
                />
                <Input
                  label={t('dashboard.profile.email_address')}
                  name="email"
                  value={formData.email}
                  disabled
                  icon={<Mail size={18} />}
                />
                <PhoneInput
                  label={t('dashboard.profile.phone_number')}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formFooter}>
                <Button
                  type="submit"
                  variant="accent"
                  loading={loading.profileUpdate}
                  className={styles.saveBtn}
                >
                  {t('dashboard.profile.save_changes')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ children, variant }) => (
  <span className={clsx(styles.badge, styles[variant])}>
    {children}
  </span>
);

const clsx = (...args) => args.filter(Boolean).join(' ');

export default Profile;
