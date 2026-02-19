import Hero from '../../components/features/Hero';
import { motion } from 'framer-motion';
import { useLocalization } from '../../contexts';

const Home = () => {
  const { t } = useLocalization();

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Simplified Hero Section */}
      <Hero />

      {/* Showcase Section to show the transition */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-[var(--color-text-primary)] tracking-tight">
            {t('nav.rooms')}
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Experience world-class luxury in our meticulously designed spaces.
          </p>
        </motion.div>

        {/* Visual indicator that page continues */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] bg-[var(--color-secondary)]/20 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
