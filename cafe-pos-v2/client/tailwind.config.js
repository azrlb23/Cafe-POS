/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          base: '#FAFAF9',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          main: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
          accent: '#B45309',
          'accent-hover': '#92400E',
        }
      }
    },
  },
  plugins: [],
}
