import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-luxury-charcoal/80 backdrop-blur-sm border-b border-luxury-gold/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-luxury-gold text-xl font-light tracking-widest">
            LUXURYSTAY
          </Link>
          <div className="flex space-x-8">
            <Link to="/rooms" className="text-white/70 hover:text-luxury-gold transition">Rooms</Link>
            <Link to="/about" className="text-white/70 hover:text-luxury-gold transition">About</Link>
            <Link to="/contact" className="text-white/70 hover:text-luxury-gold transition">Contact</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
