/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        campo: {
          50: '#f1fbf4',
          100: '#ddf5e3',
          200: '#bdeaca',
          300: '#8dd9a6',
          400: '#56bf7b',
          500: '#31a35c',
          600: '#228348',
          700: '#1d683c',
          800: '#1b5332',
          900: '#17442b',
          950: '#072616',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
      },
      boxShadow: {
        carta: '0 10px 25px -10px rgba(0, 0, 0, 0.8)',
        neon: '0 0 18px rgba(86, 191, 123, 0.45)',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'pop-in': 'pop-in 180ms ease-out',
      },
    },
  },
  plugins: [],
};
