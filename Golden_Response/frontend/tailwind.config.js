/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Support sleek toggles
  theme: {
    extend: {
      colors: {
        darkBg: '#0f172a',
        darkCard: '#1e293b',
        indigoPrimary: '#4f46e5',
        violetAccent: '#7c3aed',
        emeraldAccent: '#10b981',
        roseAccent: '#f43f5e'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'neon-indigo': '0 0 15px rgba(79, 70, 229, 0.4)',
        'neon-violet': '0 0 15px rgba(124, 58, 237, 0.4)',
        'neon-emerald': '0 0 15px rgba(16, 185, 129, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
