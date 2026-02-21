import React, { Suspense } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useLocalization } from '../contexts/LocalizationContext';
import styles from './AuthLayout.module.css';

const AuthLayout = () => {
    const { t } = useLocalization();

    return (
        <div className={styles.layout}>
            {/* Left Side: Luxury Image & Branding */}
            <div className={styles.visualSection}>
                <div className={styles.overlay} />
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070"
                    alt="Luxury Hotel"
                    className={styles.bgImage}
                />

                <div className={styles.content}>
                    <NavLink to="/" className={styles.logo}>
                        <div className={styles.logoBadge}>L</div>
                        <span className={styles.logoText}>LUXURYSTAY</span>
                    </NavLink>

                    <div className={styles.heroText}>
                        <h1 className={styles.title}>Refining the Art of Hospitality</h1>
                        <p className={styles.subtitle}>Join our exclusive circle of travelers and experience unparalleled elegance.</p>
                    </div>

                    <div className={styles.footer}>
                        <p>© {new Date().getFullYear()} LuxuryStay Group. All rights reserved.</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <main className={styles.formSection}>
                <div className={styles.formWrapper}>
                    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
                        <Outlet />
                    </Suspense>
                </div>
            </main>
        </div>
    );
};

export default AuthLayout;
