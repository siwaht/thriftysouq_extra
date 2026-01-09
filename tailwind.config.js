/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f9f6',
          100: '#e1f3ec',
          200: '#c5e8d9',
          300: '#9cd5c0',
          400: '#6bbea4',
          500: '#46a188',
          600: '#34836e',
          700: '#2a6959',
          800: '#265549',
          900: '#23463e',
          950: '#112925',
        },
        gold: {
          50: '#fbf9f1',
          100: '#f6f1de',
          200: '#ede0bba',
          300: '#e1c888',
          400: '#d5af5c',
          500: '#ce973e',
          600: '#b1762e',
          700: '#8d5727',
          800: '#754726',
          900: '#643d26',
          950: '#392011',
        },
        'rich-black': '#0a0a0a',
        'off-white': '#fafafa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 40px -4px rgba(0, 0, 0, 0.08)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'inner-glow': 'inset 0 0 20px rgba(70, 161, 136, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #112925 0%, #1f423d 50%, #2a6959 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d5af5c 0%, #ce973e 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale': 'scale 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scale: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
