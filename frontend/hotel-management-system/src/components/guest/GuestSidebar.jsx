import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarDays,
    Receipt,
    ConciergeBell,
    UserCircle,
    LogOut,
    X
} from 'lucide-react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useGuest } from '../../hooks/useGuest';
import Avatar from '../ui/Avatar';
import styles from './GuestSidebar.module.css';
import clsx from 'clsx';

const GuestSidebar = ({ onClose }) => {
    const { t, isRTL } = useLocalization();
    const { profile } = useGuest();
    const navigate = useNavigate();

    const navItems = [
        { icon: LayoutDashboard, label: t('dashboard.nav.overview'), path: '/dashboard' },
        { icon: CalendarDays, label: t('dashboard.nav.bookings'), path: '/dashboard/bookings' },
        { icon: Receipt, label: t('dashboard.nav.invoices'), path: '/dashboard/invoices' },
        { icon: ConciergeBell, label: t('dashboard.nav.services'), path: '/dashboard/services' },
        { icon: UserCircle, label: t('dashboard.nav.profile'), path: '/dashboard/profile' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <aside className={clsx(styles.sidebar, isRTL && styles.rtl)}>
            <div className={styles.header}>
                <div className={styles.logo}>
                    <span className={styles.logoLuxury}>LUXURY</span>
                    <span className={styles.logoStay}>STAY</span>
                </div>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            <div className={styles.profileSection}>
                <Avatar src={profile?.avatar} alt={profile?.name || 'User'} size="lg" />
                <div className={styles.profileInfo}>
                    <h3 className={styles.userName}>{profile?.name || 'Guest User'}</h3>
                    <p className={styles.userRole}>{t(`roles.${profile?.role || 'guest'}`)}</p>
                </div>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) => clsx(styles.navLink, isActive && styles.active)}
                        onClick={onClose}
                    >
                        <item.icon size={20} className={styles.icon} />
                        <span className={styles.label}>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className={styles.footer}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={20} className={styles.icon} />
                    <span className={styles.label}>{t('dashboard.logout')}</span>
                </button>
            </div>
        </aside>
    );
};

export default GuestSidebar;
