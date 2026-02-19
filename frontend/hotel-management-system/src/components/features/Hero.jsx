import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalization } from '../../contexts';
import GoldParticles from './GoldParticles';
import { Button } from '../ui';
import { RangePicker } from '../composite';
import styles from './Hero.module.css';
import buttonStyles from '../ui/Button.module.css';
import { ChevronDown, Users, Search } from 'lucide-react';

const Hero = () => {
    const { t, isRTL, activeLanguage } = useLocalization();
    const [isMobile, setIsMobile] = useState(false);
    const [isGuestSelectOpen, setIsGuestSelectOpen] = useState(false);
    const [guests, setGuests] = useState({ adults: 2, children: 0 });
    const [scrollY, setScrollY] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        const handleScroll = () => setScrollY(window.scrollY);
        const handleMouseMove = (e) => {
            setMousePosition({
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Local progress for particles (assumes hero is 100vh)
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
    const scrollProgress = Math.min(Math.max(scrollY / viewportHeight, 0), 1);

    const particleCount = isMobile ? 0 : 500;

    return (
        <section className={styles.heroContainer}>
            {/* Background Image */}
            <img
                src="/images/layers/lobby1.jpg"
                alt="LuxuryStay Lobby"
                className={styles.heroImage}
            />

            {/* Overlay */}
            <div className={styles.overlay} />

            {/* WebGL Particles */}
            {!isMobile && (
                <div className={styles.particlesContainer}>
                    <Canvas
                        key={`hero-canvas-${activeLanguage.code}`}
                        camera={{ position: [0, 0, 10], fov: 35 }}
                        gl={{ antialias: false, powerPreference: "high-performance" }}
                        style={{ pointerEvents: 'none' }}
                    >
                        <Suspense fallback={null}>
                            <GoldParticles
                                count={particleCount}
                                scrollProgress={scrollProgress}
                                mousePosition={mousePosition}
                            />
                        </Suspense>
                    </Canvas>
                </div>
            )}

            {/* Content Overlay */}
            <div className={styles.contentOverlay}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center w-full"
                >
                    <h1 className="text-white tracking-tight select-none">
                        <div className="text-[24px] xs:text-[28px] sm:text-[32px] md:text-[36px] font-light tracking-widest text-white/70 mb-2">
                            {t('hero.welcome')}
                        </div>
                        <div className="text-[40px] xs:text-[48px] sm:text-[56px] md:text-[64px] lg:text-[72px] font-serif text-accent leading-tight">
                            {t('hero.stay')}
                        </div>
                    </h1>
                    <p className="text-[16px] xs:text-[18px] sm:text-[20px] md:text-[22px] text-white/80 font-light max-w-2xl mx-auto px-4 select-none mt-4">
                        {t('hero.subtitle')}
                    </p>
                </motion.div>

                {/* Search Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className={styles.searchCard}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em] select-none">
                                {t('booking.rangePicker')}
                            </label>
                            <RangePicker
                                value={dateRange}
                                onChange={setDateRange}
                                minDate={new Date()}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em] select-none">
                                {t('hero.guests')}
                            </label>
                            <div
                                className="relative bg-white/5 border border-white/10 rounded-lg px-4 h-[48px] flex items-center justify-between text-white cursor-pointer hover:bg-white/10 transition-colors"
                                onClick={() => setIsGuestSelectOpen(!isGuestSelectOpen)}
                            >
                                <span className="flex items-center gap-2 text-[14px]">
                                    <Users size={18} className="text-accent" />
                                    {guests.adults} {t('hero.adults')}, {guests.children} {t('hero.children')}
                                </span>
                                <ChevronDown size={16} className="text-white/40" />

                                <AnimatePresence>
                                    {isGuestSelectOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-lg p-4 z-[1100] shadow-2xl space-y-4"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-[15px] font-medium">{t('hero.adults')}</span>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={(e) => { e.stopPropagation(); setGuests(g => ({ ...g, adults: Math.max(1, g.adults - 1) })); }} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors">-</button>
                                                    <span className="w-6 text-center font-medium text-[15px]">{guests.adults}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); setGuests(g => ({ ...g, adults: g.adults + 1 })); }} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors">+</button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                <span className="text-[15px] font-medium">{t('hero.children')}</span>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={(e) => { e.stopPropagation(); setGuests(g => ({ ...g, children: Math.max(0, g.children - 1) })); }} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors">-</button>
                                                    <span className="w-6 text-center font-medium text-[15px]">{guests.children}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); setGuests(g => ({ ...g, children: g.children + 1 })); }} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors">+</button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-transparent uppercase tracking-[0.15em] select-none">
                                spacer
                            </label>
                            <Button
                                variant="primary"
                                className={`w-full h-[48px] text-[15px] ${buttonStyles.shimmer}`}
                                leftIcon={<Search size={18} />}
                            >
                                {t('hero.checkAvailability')}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;