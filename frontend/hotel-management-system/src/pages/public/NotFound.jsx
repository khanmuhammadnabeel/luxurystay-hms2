import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl text-luxury-gold font-light mb-4">404</h1>
      <p className="text-white/60 mb-8">Page not found</p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-luxury-gold/10 border border-luxury-gold/30 
                   text-luxury-gold hover:bg-luxury-gold/20 transition-all"
      >
        Return Home
      </Link>
    </div>
  );
}

export default NotFound;