/** Semantic colors resolve through CSS variables so light/dark can swap at runtime. */
module.exports = {
  void: 'rgb(var(--mm-void) / <alpha-value>)',
  navy: 'rgb(var(--mm-navy) / <alpha-value>)',
  panel: 'rgb(var(--mm-panel) / <alpha-value>)',
  glass: 'rgb(var(--mm-glass) / <alpha-value>)',
  ice: 'rgb(var(--mm-ice) / <alpha-value>)',
  mute: 'rgb(var(--mm-mute) / <alpha-value>)',
  brand: {
    DEFAULT: 'rgb(var(--mm-brand) / <alpha-value>)',
    500: '#4C82FF',
    600: 'rgb(var(--mm-brand) / <alpha-value>)',
    700: '#1A4BD6',
  },
  signal: 'rgb(var(--mm-signal) / <alpha-value>)',
  glow: 'rgb(var(--mm-glow) / <alpha-value>)',
}
