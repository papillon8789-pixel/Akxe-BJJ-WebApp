/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRIMO BJJ Brand Colors
        'primo-black': '#000000',
        'primo-red': '#e63946',
        'primo-gold': '#d4af37',
        'primo-white': '#ffffff',
        
        // App Theme
        'app-bg': '#0a0a0a',
        'card-bg': '#1a1a1a',
        'card-hover': '#252525',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
