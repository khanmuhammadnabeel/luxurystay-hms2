import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Menu,
  X,
  Bell,
  User as UserIcon,
  Moon,
  Sun,
  Search,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import { Button, Dropdown, Badge, Drawer, Modal } from '../ui';
import { SearchBar } from '../composite';
import { useTheme, useLocalization, useAuth } from '../../contexts';
import styles from './Navbar.module.css';

const Navbar = ({ variant = 'public' }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, isRTL } = useLocalization();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout, authActionLoading } = useAuth();

  // Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Background change
      if (currentScrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Hide/Show on scroll
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = {
    public: [
      { label: t('nav.home') || 'Home', path: '/' },
      { label: t('nav.rooms'), path: '/rooms' },
      { label: t('nav.gallery'), path: '/composite' },
      { label: t('nav.contact'), path: '/contact' },
    ],
    guest: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'My Bookings', path: '/bookings' },
      { label: 'Profile', path: '/profile' },
    ],
    staff: [
      { label: 'Reception', path: '/receptionist' },
      { label: 'Housekeeping', path: '/housekeeping' },
    ],
    admin: [
      { label: 'Admin Panel', path: '/admin' },
      { label: 'Users', path: '/admin/users' },
      { label: 'Rooms', path: '/admin/rooms' },
    ],
    auth: [] // Minimal logo only
  };

  const links = navLinks[variant] || navLinks.public;

  if (variant === 'auth') {
    return (
      <nav className={clsx(styles.navbar, styles.navbarTransparent, 'py-6 px-4 md:px-8')}>
        <div className="max-w-7xl mx-auto flex justify-center">
          <Logo />
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className={clsx(
        styles.navbar,
        scrolled ? styles.navbarScrolled : styles.navbarTransparent,
        hidden && styles.navbarHidden,
        'py-4 px-4 md:px-8 flex items-center'
      )}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Left: Logo */}
          <Logo />

          {/* Center: Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => clsx(
                  styles.navLink,
                  isActive && styles.navLinkActive,
                  'text-sm font-medium tracking-wide uppercase'
                )}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-text-secondary hover:text-accent transition-colors hidden lg:block"
            >
              <Search size={20} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-text-secondary hover:text-accent transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-text-secondary hover:text-accent transition-colors">
                <Bell size={20} />
              </button>
              <Badge
                variant="gold"
                size="sm"
                className={clsx("absolute top-1 right-1 px-1 min-w-[16px] h-4", styles.notificationBadge)}
              >
                3
              </Badge>
            </div>

            {/* User Profile Dropdown */}
            <div className="hidden lg:block">
              <Dropdown
                trigger={
                  <button className="flex items-center gap-2 p-1 pl-2 rounded-full border border-glass-border hover:border-accent/40 transition-all bg-secondary/30">
                    <div className={clsx("text-right hidden xl:block", isRTL && "text-left")}>
                      <p className="text-[10px] font-bold text-text-primary leading-tight">{t('nav.guestAccount')}</p>
                      <p className="text-[8px] text-text-secondary leading-tight">{t('nav.profile')}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                      <UserIcon size={18} />
                    </div>
                    <ChevronDown size={14} className="text-text-secondary mr-1" />
                  </button>
                }
              >
                <Dropdown.Header>{t('nav.guestAccount')}</Dropdown.Header>
                <Dropdown.Item onClick={() => navigate('/profile')}>
                  <UserIcon size={14} className={clsx(isRTL ? "ml-2" : "mr-2")} /> {t('nav.profile')}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/dashboard')}>
                  <Settings size={14} className="mr-2" /> Dashboard
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item destructive onClick={() => setShowLogoutConfirm(true)}>
                  <LogOut size={14} className="mr-2" /> {t('dashboard.logout') || 'Sign Out'}
                </Dropdown.Item>
              </Dropdown>
            </div>

            {/* CTA: Book Now (Desktop only) */}
            <div className="hidden xl:block">
              <Button variant="primary" size="md" className="rounded-full shadow-lg shadow-accent/20">
                {t('nav.bookNow')}
              </Button>
            </div>

            {/* Mobile Menu Trigger */}
            <button
              className="lg:hidden p-2 text-text-secondary hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        position="right"
        size="md"
      >
        <div className={styles.mobileDrawer}>
          <div className="flex justify-between items-center mb-8">
            <Logo />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-text-secondary">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => clsx(
                  styles.drawerItem,
                  isActive && 'text-accent'
                )}
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="mt-auto space-y-4">
            <Button variant="primary" className="w-full py-4 text-lg">{t('nav.bookNow')}</Button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
                className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-xl text-text-secondary hover:text-accent transition-all"
              >
                <Search size={20} />
                <span className="text-[10px] mt-1 font-medium uppercase tracking-widest">{t('nav.search')}</span>
              </button>
              <div className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-xl text-text-secondary">
                <button onClick={toggleTheme} className="p-2 bg-primary rounded-lg text-accent">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <span className="text-[10px] mt-1 font-medium uppercase tracking-widest">{t('nav.theme')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center gap-4 p-4 bg-secondary/50 rounded-xl text-text-primary hover:bg-accent/10 transition-all border border-glass-border"
            >
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <UserIcon size={20} />
              </div>
              <div className={clsx("text-left", isRTL && "text-right flex-1")}>
                <p className="text-sm font-bold">{t('nav.guestAccount')}</p>
                <p className="text-[10px] text-text-secondary">{t('nav.profile')}</p>
              </div>
            </button>
          </div>
        </div>
      </Drawer>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-[15vh] px-4 select-none">
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setSearchOpen(false)}
          />
          <div
            className="relative w-full max-w-3xl bg-secondary/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-glass-border cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-primary">
                  <Search size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white select-none">Search LuxuryStay</h3>
                  <p className="text-xs text-text-secondary select-none">Find your perfect stay</p>
                </div>
              </div>
              <button
                className="w-10 h-10 rounded-full bg-primary/40 border border-glass-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-all cursor-pointer"
                onClick={() => setSearchOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(term) => {
                if (!term?.trim()) return;
                navigate(`/rooms?search=${encodeURIComponent(term)}`);
                setSearchOpen(false);
              }}
              placeholder="Search rooms, suites, amenities..."
              variant="default"
              autoFocus
            />

            <div className="mt-6 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-text-secondary mr-2 select-none">Quick Search:</span>
              {['Deluxe Suite', 'Ocean View', 'Spa & Wellness', 'Presidential'].map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    navigate(`/rooms?search=${encodeURIComponent(tag)}`);
                    setSearchOpen(false);
                  }}
                  className="text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-primary/20 border border-glass-border text-text-secondary hover:text-accent hover:border-accent transition-all cursor-pointer select-none"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        size="sm"
      >
        <Modal.Header title={t('common.logout_confirm_title')} />
        <Modal.Body className="py-6">
          <p className="text-text-secondary text-center">
            {t('common.logout_confirm_msg')}
          </p>
          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowLogoutConfirm(false)}
              disabled={authActionLoading}
            >
              {t('common.logout_stay')}
            </Button>
            <Button
              variant="primary"
              fullWidth
              disabled={authActionLoading}
              onClick={async () => {
                await logout();
                setShowLogoutConfirm(false);
                navigate('/login');
              }}
            >
              {authActionLoading ? (
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                t('dashboard.logout')
              )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

const Logo = () => (
  <NavLink to="/" className="flex items-center gap-2 group select-none">
    <div className="w-10 h-10 bg-accent flex items-center justify-center rounded-lg shadow-lg group-hover:scale-110 transition-transform">
      <span className="text-primary font-bold text-xl">L</span>
    </div>
    <span className="text-xl font-bold tracking-[0.2em] text-text-primary hidden xs:block">
      LUXURY<span className="text-accent">STAY</span>
    </span>
  </NavLink>
);

Navbar.propTypes = {
  variant: PropTypes.oneOf(['public', 'auth', 'guest', 'staff', 'admin']),
};

export default Navbar;