/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#13131a',
        primary: '#7c3aed',
        'primary-light': '#a78bfa',
        accent: '#f97316',
        highlight: '#e879f9',
        border: '#27272f',
        muted: '#71717a',
      },
      fontFamily: {
        display: ['Cabinet Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(124, 58, 237, 0.35)',
        'glow-accent': '0 0 40px rgba(249, 115, 22, 0.3)',
      },
    },
  },
  plugins: [],
}