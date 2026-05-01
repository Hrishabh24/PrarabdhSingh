/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        darkBg: '#090A0F',
        darkCard: '#12141D',
        lightBg: '#F3F4F8',
        lightCard: '#FFFFFF',
        accentCyan: '#00F0FF',
        accentPurple: '#570861',
        accentCoral: '#FF4D4D',
        accentGold: '#FFB800',
      }
    },
  },
  plugins: [],
}

