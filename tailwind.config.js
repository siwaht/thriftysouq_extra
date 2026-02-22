/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--brand-50, #f4f6f8)',
          100: 'var(--brand-100, #e4e9f0)',
          200: 'var(--brand-200, #cdd7e3)',
          300: 'var(--brand-300, #a7bcce)',
          400: 'var(--brand-400, #7b99b3)',
          500: 'var(--brand-500, #597b98)',
          600: 'var(--brand-600, #42617d)',
          700: 'var(--brand-700, #364f67)',
          800: 'var(--brand-800, #2e4456)',
          900: 'var(--brand-900, #2a3948)',
          950: 'var(--brand-950, #1b2632)',
        },
        accent: {
          50: 'var(--accent-50, #fbf8f1)',
          100: 'var(--accent-100, #f5eedc)',
          200: 'var(--accent-200, #e8d5b5)',
          300: 'var(--accent-300, #d6b885)',
          400: 'var(--accent-400, #c69f5e)',
          500: 'var(--accent-500, #b88a44)',
          600: 'var(--accent-600, #9e7335)',
          700: 'var(--accent-700, #7e582b)',
          800: 'var(--accent-800, #6a4928)',
          900: 'var(--accent-900, #573e23)',
          950: 'var(--accent-950, #332111)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 0 5px rgba(0,0,0,0.01)',
        'soft-lg': '0 20px 50px -15px rgba(0, 0, 0, 0.1), 0 0 15px -3px rgba(0,0,0,0.02)',
        'elegant': '0 15px 35px -5px rgba(42, 57, 72, 0.08), 0 5px 15px -3px rgba(42, 57, 72, 0.03)',
        'elegant-lg': '0 25px 50px -10px rgba(42, 57, 72, 0.12), 0 10px 20px -5px rgba(42, 57, 72, 0.04)',
        'inner-soft': 'inset 0 4px 6px 0 rgba(0, 0, 0, 0.03)',
        'glow': '0 0 25px rgba(184, 138, 68, 0.25)',
        'glow-lg': '0 0 50px rgba(184, 138, 68, 0.35)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
