/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark': '#0F172A',
        'darker': '#0B1228',
        'purple': '#6D28D9',
        'purple-dark': '#5521B5',
        'cyan': '#06B6D4',
        'cyan-dark': '#0891B2',
      },
    },
  },
  plugins: [],
}
