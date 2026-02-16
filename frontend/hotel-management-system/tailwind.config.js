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
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['36px', { lineHeight: '1.2', fontWeight: '600' }],
        'h3': ['30px', { lineHeight: '1.3', fontWeight: '500' }],
        'h4': ['24px', { lineHeight: '1.4', fontWeight: '500' }],
        'h5': ['20px', { lineHeight: '1.5', fontWeight: '500' }],
        'h6': ['18px', { lineHeight: '1.5', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '300' }],
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