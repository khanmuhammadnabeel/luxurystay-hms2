import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import {
    Facebook,
    Instagram,
    Twitter,
    Mail,
    Phone,
    MapPin,
    ArrowUp,
    Send,
    Globe,
    DollarSign
} from 'lucide-react';
import { Button, Input, Dropdown } from '../ui';
import { useLocalization } from '../../contexts';
import styles from './Footer.module.css';

const Footer = () => {
    const {
        language, setLanguage,
        currency, setCurrency,
        activeLanguage, activeCurrency,
        t, isRTL
    } = useLocalization();
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNewsletter = (e) => {
        e.preventDefault();
        alert('Thank you for subscribing!');
        setEmail('');
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.grid}>
                {/* 1. Hotel Info */}
                <div className="space-y-6">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-lg">
                            <span className="text-primary font-bold text-lg">L</span>
                        </div>
                        <span className="text-lg font-bold tracking-[0.2em] text-text-primary">
                            LUXURY<span className="text-accent">STAY</span>
                        </span>
                    </Link>
                    <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
                        {t('footer.description')}
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-text-secondary text-sm">
                            <MapPin size={16} className="text-accent" />
                            <span>123 Elite Avenue, Luxury District</span>
                        </div>
                        <div className="flex items-center gap-3 text-text-secondary text-sm">
                            <Phone size={16} className="text-accent" />
                            <span>+1 (234) 567-890</span>
                        </div>
                        <div className="flex items-center gap-3 text-text-secondary text-sm">
                            <Mail size={16} className="text-accent" />
                            <span>hello@luxurystay.com</span>
                        </div>
                    </div>
                </div>

                {/* 2. Quick Links */}
                <div>
                    <h4 className="text-text-primary font-bold mb-6 tracking-wider uppercase text-sm">{t('footer.experience')}</h4>
                    <nav className="flex flex-col">
                        <Link to="/rooms" className={styles.link}>Rooms & Suites</Link>
                        <Link to="/composite" className={styles.link}>Photo Gallery</Link>
                        <Link to="/about" className={styles.link}>About Our Hotel</Link>
                        <Link to="/contact" className={styles.link}>Contact Us</Link>
                        <Link to="/components" className={styles.link}>Style Guide</Link>
                    </nav>
                </div>

                {/* 3. Support */}
                <div>
                    <h4 className="text-text-primary font-bold mb-6 tracking-wider uppercase text-sm">{t('footer.support')}</h4>
                    <nav className="flex flex-col">
                        <Link to="/faq" className={styles.link}>Frequently Asked Questions</Link>
                        <Link to="/terms" className={styles.link}>Terms of Service</Link>
                        <Link to="/privacy" className={styles.link}>Privacy Policy</Link>
                        <Link to="/cancellation" className={styles.link}>Cancellation Policy</Link>
                    </nav>
                </div>

                {/* 4. Newsletter & Social */}
                <div className="space-y-6">
                    <h4 className="text-text-primary font-bold mb-6 tracking-wider uppercase text-sm">{t('footer.newsletter')}</h4>
                    <div className={styles.newsletter}>
                        <p className="text-xs text-text-secondary mb-3">{t('footer.subscribe')}</p>
                        <form onSubmit={handleNewsletter} className="relative">
                            <input
                                type="email"
                                placeholder={t('footer.emailPlaceholder')}
                                className="w-full bg-primary border border-glass-border px-4 py-2.5 rounded-lg text-sm text-text-primary focus:border-accent outline-none transition-all pr-12"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-accent text-primary rounded-md hover:brightness-110 transition-all flex items-center justify-center"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </div>

                    <div className="pt-4">
                        <h5 className="text-xs font-bold text-text-secondary uppercase mb-4 tracking-widest text-center md:text-left">{t('footer.followUs')}</h5>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <a href="#" className={styles.socialIcon} aria-label="Facebook"><Facebook size={18} /></a>
                            <a href="#" className={styles.socialIcon} aria-label="Instagram"><Instagram size={18} /></a>
                            <a href="#" className={styles.socialIcon} aria-label="Twitter"><Twitter size={18} /></a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-glass-border flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-text-secondary text-xs">
                    &copy; {new Date().getFullYear()} LuxuryStay Hotel Management System. {t('footer.rights')}
                </p>
                <div className="flex gap-4 items-center">
                    <Dropdown
                        variant="click"
                        align="top-right"
                        trigger={
                            <button className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent transition-colors min-w-[70px] justify-end">
                                <Globe size={14} /> {activeLanguage.flag} {language} <ChevronDown size={12} />
                            </button>
                        }
                    >
                        <Dropdown.Item onClick={() => setLanguage('English')}>🇺🇸 English</Dropdown.Item>
                        <Dropdown.Item onClick={() => setLanguage('Urdu')}>🇵🇰 اردو</Dropdown.Item>
                        <Dropdown.Item onClick={() => setLanguage('French')}>🇫🇷 French</Dropdown.Item>
                        <Dropdown.Item onClick={() => setLanguage('Spanish')}>🇪🇸 Spanish</Dropdown.Item>
                    </Dropdown>

                    <Dropdown
                        variant="click"
                        align="top-right"
                        trigger={
                            <button className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent transition-colors min-w-[60px] justify-end">
                                <DollarSign size={14} /> {activeCurrency.code} <ChevronDown size={12} />
                            </button>
                        }
                    >
                        <Dropdown.Item onClick={() => setCurrency('USD')}>$ USD</Dropdown.Item>
                        <Dropdown.Item onClick={() => setCurrency('PKR')}>₨ PKR</Dropdown.Item>
                        <Dropdown.Item onClick={() => setCurrency('EUR')}>€ EUR</Dropdown.Item>
                        <Dropdown.Item onClick={() => setCurrency('GBP')}>£ GBP</Dropdown.Item>
                    </Dropdown>
                </div>
            </div>

            {/* Back to Top */}
            <button
                className={clsx(
                    styles.backToTop,
                    showBackToTop ? styles.backToTopVisible : styles.backToTopHidden
                )}
                onClick={scrollToTop}
                aria-label={t('footer.goTop')}
            >
                <ArrowUp size={20} />
            </button>
        </footer>
    );
};

const ChevronDown = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export default Footer;
