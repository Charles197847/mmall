const colors = require('./tokens')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    '../../packages/shared-ui/components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      borderColor: {
        DEFAULT: 'rgb(var(--mm-glow) / 0.16)',
      },
    },
  },
  plugins: [],
}
