const colors = require('./tokens')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    '../../packages/shared-ui/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors,
      borderColor: {
        DEFAULT: 'rgb(var(--mm-glow) / 0.16)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(47, 107, 255, 0.25)',
        signal: '0 0 28px rgba(255, 45, 74, 0.35)',
      },
      backgroundImage: {
        grid: 'var(--mm-grid)',
      },
    },
  },
  plugins: [],
}
