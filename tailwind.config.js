export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        'velloria-black': '#1a1a1a',
        'velloria-gold': '#d4af37',
        'velloria-bg': '#fcfbf9',
      }
    },
  },
  plugins: [],
}