/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'shamrock': '#36c98a',
        'molten-orange': '#ff5a1f',
        'gold': '#ffd600',
        'sky': '#00c3f3',
        'deep-blue': '#003687',
        'magenta-bloom': '#fc0367',
        'cream': '#f9f6f2',
        'charcoal': '#23272a',
      },
      fontFamily: {
        'sans': ['Open Sans', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
