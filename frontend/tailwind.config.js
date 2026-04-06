/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mber-red': '#B22222',
        'mber-yellow': '#FFC107',
      }
    },
  },
  plugins: [],
}