/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
      },
      fontFamily: {
        'body': ['Inter', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
      },
      backgroundColor: {
        glass: 'var(--glass-bg)',
      },
      backdropBlur: {
        glass: 'var(--glass-blur)',
      },
      borderColor: {
        glass: 'var(--glass-border)',
      },
      boxShadow: {
        'gold-sm': 'var(--shadow-sm)',
        'gold-md': 'var(--shadow-md)',
        'gold-lg': 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
}