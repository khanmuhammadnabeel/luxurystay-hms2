import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import GuestSidebar from '../../components/guest/GuestSidebar';
import GuestNav from '../../components/guest/GuestNav';
import { Drawer } from '../../components/ui';
import { useGuest } from '../../hooks/useGuest';
import styles from './GuestLayout.module.css';
import { useLocalization } from '../../contexts/LocalizationContext';

const GuestLayout = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { fetchProfile } = useGuest();
    const { pathname } = useLocation();
    const { isRTL } = useLocalization();

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Close drawer on route change
    useEffect(() => {
        setIsDrawerOpen(false);
    }, [pathname]);

    return (
        <div className={styles.layout}>
            {/* Desktop Sidebar */}
            <div className={styles.sidebarWrapper}>
                <GuestSidebar />
            </div>

            {/* Mobile Nav */}
            <GuestNav onMenuClick={() => setIsDrawerOpen(true)} />

            {/* Mobile Drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                side={isRTL ? 'right' : 'left'}
            >
                <GuestSidebar onClose={() => setIsDrawerOpen(false)} />
            </Drawer>

            <main className={styles.main}>
                <div className={styles.content}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default GuestLayout;
