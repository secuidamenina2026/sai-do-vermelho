/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        danger: '#ef4444',
        success: '#22c55e',
        warning: '#eab308',
        primary: '#3b82f6',
      },
    },
  },
  plugins: [],
}
