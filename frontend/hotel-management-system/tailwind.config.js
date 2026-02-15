/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          gold: '#CFAF7E',
          charcoal: '#0A0A0A',
          ivory: '#F5F5F5',
        }
      }
    },
  },
  plugins: [],
}