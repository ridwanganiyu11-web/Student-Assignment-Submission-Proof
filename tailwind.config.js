/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        botchain: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdbff',
          300: '#8ec3ff',
          400: '#59a0ff',
          500: '#327cff',
          600: '#1b5ff5',
          700: '#1449e1',
          800: '#173cb6',
          900: '#18368f',
          950: '#122257',
        },
      },
    },
  },
  plugins: [],
}

