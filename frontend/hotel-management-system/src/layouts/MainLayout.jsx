import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Footer, PageTransition, ScrollToTop } from '../components/layout';
import { useAuth, useLocalization } from '../contexts';
import { cn } from '../lib/utils';

const MainLayout = () => {
    const { user } = useAuth() || { user: { role: 'public' } };
    const { t, isRTL } = useLocalization();

    return (
        <div className={cn(
            "min-h-screen flex flex-col bg-primary text-text-primary transition-colors duration-300",
            isRTL && "font-urdu"
        )}>
            {/* Scroll management */}
            <ScrollToTop smooth={true} />

            {/* Navigation */}
            <Navbar variant={user?.role || 'public'} />

            {/* Main Content Area with Transitions */}
            <main className="flex-1 flex flex-col pt-20 select-none cursor-default"> {/* pt-20 to offset fixed navbar */}
                <Suspense fallback={
                    <div className="flex-1 flex items-center justify-center p-20 text-accent font-display tracking-widest animate-pulse select-none cursor-default">
                        {t('common.loading')}
                    </div>
                }>
                    <PageTransition variant="fade" duration={0.4}>
                        <Outlet />
                    </PageTransition>
                </Suspense>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default MainLayout;
