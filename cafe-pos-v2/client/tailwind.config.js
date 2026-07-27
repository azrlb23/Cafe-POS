/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        cafe: {
          base: '#FAF6F0',
          surface: '#FFFFFF',
          border: '#EBE5DC',
          main: '#2D1F18',
          secondary: '#5C4D46',
          muted: '#8E7D75',
          accent: '#8C6239',
          'accent-hover': '#704E2B',
        }
      }
    },
  },
  plugins: [],
}
