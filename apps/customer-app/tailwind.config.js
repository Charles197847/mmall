const colors = require('../../packages/config/tailwind/tokens')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
