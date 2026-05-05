/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F4EC', 100: '#CDE7D4', 200: '#A5D0B0', 300: '#7DB98C',
          400: '#55A268', 500: '#2E7D32', 600: '#25662A', 700: '#1C4F21',
          800: '#143818', 900: '#0B2110'
        },
        secondary: {
          50: '#F2F9F6', 100: '#DBEFE5', 200: '#B7E0CB', 300: '#93D1B1',
          400: '#6FC298', 500: '#4BB37E', 600: '#3C9065', 700: '#2D6C4C',
          800: '#1E4833', 900: '#0F2419'
        },
        success: '#22C55E', warning: '#FACC15', danger: '#EF4444', info: '#3B82F6'
      }
    },
  },
  plugins: [],
}

