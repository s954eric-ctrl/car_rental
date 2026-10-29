/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        obsidian: {
          950: '#0a0d0f',
          900: '#0f1417',
          850: '#12191d',
          800: '#1b2327',
          700: '#242d32',
          600: '#2d3740',
          500: '#3a4750',
        },
        emerald: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
          glow: '#10b98133',
        },
        gold: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 12px #10b98155' },
          '50%': { boxShadow: '0 0 24px #10b98188' },
        },
      },
    },
  },
  plugins: [],
};
