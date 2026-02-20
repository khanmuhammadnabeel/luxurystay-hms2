import Hero from '../../components/features/Hero';
import FeaturedRooms from '../../components/features/FeaturedRooms';
import AmenitiesGrid from '../../components/features/AmenitiesGrid';
import TestimonialsCarousel from '../../components/features/TestimonialsCarousel';
import CallToAction from '../../components/features/CallToAction';

const Home = () => {
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Hero Section */}
      <Hero />

      {/* Featured Rooms Section */}
      <FeaturedRooms />

      {/* Amenities Section */}
      <AmenitiesGrid />

      {/* Testimonials Section */}
      <TestimonialsCarousel />

      {/* Call to Action */}
      <CallToAction />
    </main>
  );
};

export default Home;
