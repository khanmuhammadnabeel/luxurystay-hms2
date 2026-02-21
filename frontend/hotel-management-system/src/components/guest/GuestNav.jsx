import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useLocalization } from '../../contexts/LocalizationContext';
import styles from './GuestNav.module.css';

const GuestNav = ({ onMenuClick }) => {
    const { isRTL } = useLocalization();

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <button className={styles.menuBtn} onClick={onMenuClick}>
                    <Menu size={24} />
                </button>
                <div className={styles.logo}>
                    <span className={styles.logoLuxury}>LUXURY</span>
                    <span className={styles.logoStay}>STAY</span>
                </div>
            </div>

            <div className={styles.right}>
                <button className={styles.notifBtn}>
                    <Bell size={20} />
                    <span className={styles.badge}></span>
                </button>
            </div>
        </header>
    );
};

export default GuestNav;
