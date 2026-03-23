/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    // Red accent — force JIT to always compile these
    'bg-red-500',
    'bg-red-600',
    'bg-red-700',
    'text-red-400',
    'text-red-500',
    'border-red-600',
    'from-red-600',
    'to-red-700',
    'from-red-900',
    'to-red-700',
    { pattern: /bg-red-(400|500|600|700|800|900)/ },
    { pattern: /text-red-(300|400|500|600)/ },
    { pattern: /border-red-(500|600|700)/ },
    { pattern: /shadow-red-(800|900)/ },
    { pattern: /from-red-(600|700|800|900)/ },
    { pattern: /to-red-(600|700|800|900)/ },
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#09090B',
        'bg-surface': '#111114',
        'bg-card': '#18181B',
        'bg-elevated': '#1F1F23',
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}
