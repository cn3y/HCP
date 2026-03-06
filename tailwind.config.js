/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'golf-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        'golf-gold': {
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'golf-sand': {
          100: '#fffbeb',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#fadb14',
          500: '#facc15',
          600: '#eab308',
          700: '#a16207',
          800: '#854d0e',
        },
        'golf-blue': {
          500: '#3b82f6',
          600: '#2563eb',
        }
      },
      backgroundImage: {
        'golf-green-gradient': 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
        'golf-forest': 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #064e3b 100%)',
        'golf-gold-accent': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.3), transparent)',
        'green-gradient': 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
        'fairway-gradient': 'linear-gradient(180deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
        'sand-accent': 'linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #d97706 100%)',
      }
    },
  },
  plugins: [],
}
