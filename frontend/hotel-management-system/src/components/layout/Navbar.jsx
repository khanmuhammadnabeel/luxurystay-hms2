import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/index';

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <nav className="fixed top-0 w-full bg-luxury-charcoal/80 backdrop-blur-sm border-b border-luxury-gold/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-luxury-gold text-xl font-light tracking-widest">
            LUXURYSTAY
          </Link>
          <div className="flex items-center space-x-8">
            <Link to="/rooms" className="text-white/70 hover:text-luxury-gold transition">Rooms</Link>
            <Link to="/contact" className="text-white/70 hover:text-luxury-gold transition">Contact</Link>
            <button 
              onClick={toggleTheme}
              className="px-3 py-1 border border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold/10 transition"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;