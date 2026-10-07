/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#facc15',
          400: '#e8ff33',
          500: '#DFFF00', // Primary DAYOS Electric Yellow / Neon Lime (Logitech Inspired)
          600: '#c8ea00',
          700: '#a3c200',
          800: '#7e9600',
          900: '#5c6e00',
          950: '#343f00',
          yellow: '#DFFF00',
          lime: '#DFFF00',
          cyan: '#00F0FF',
          violet: '#B026FF',
          green: '#00FF88',
          orange: '#FF8A00',
          pink: '#FF2BD6',
        },
        surface: {
          light: '#f6f8fb',
          dark: '#050505',
          darkCard: '#080808',
          darkSubtle: '#0B0D0F',
          darkElevated: '#101214',
        },
        slate: {
          750: '#181b22',
          850: '#0b0d10',
          950: '#050505',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
        'sheet': '0 -8px 32px -4px rgba(0, 0, 0, 0.8)',
        'neon': '0 0 20px -2px rgba(223, 255, 0, 0.45), 0 0 8px rgba(223, 255, 0, 0.3)',
        'glow-yellow': '0 0 20px -2px rgba(223, 255, 0, 0.5), 0 0 8px rgba(223, 255, 0, 0.35)',
        'glow-pill': '0 0 12px rgba(223, 255, 0, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2s infinite',
        'pulse-yellow': 'pulseYellow 2.5s ease-in-out infinite',
        'gel-float': 'gelFloat 18s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        pulseYellow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 6px rgba(223, 255, 0, 0.7))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 2px rgba(223, 255, 0, 0.25))' },
        },
        gelFloat: {
          '0%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          '50%': { transform: 'translate3d(var(--drift-x, 6px), var(--drift-y, -8px), 0) rotate(2deg)' },
          '100%': { transform: 'translate3d(calc(var(--drift-x, 6px) * -0.7), calc(var(--drift-y, -8px) * -0.7), 0) rotate(-1.5deg)' },
        },
      }
    },
  },
  plugins: [],
}
