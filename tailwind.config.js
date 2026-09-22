/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan the HTML pages and the shared scripts. Card markup is built inside JS
  // template literals in data.js and in the inline <script> blocks of each page,
  // so both extensions have to be scanned or those classes get purged.
  content: ['./*.html', './*.js'],
  theme: {
    extend: {
      // Carried over verbatim from the inline tailwind.config blocks that used to
      // sit in index.html and listings.html.
      colors: {
        brown: '#7A5230',
        'brown-d': '#4E3219',
        'brown-l': '#A87850',
        cream: '#EDE8E0',
        'cream-d': '#DDD5C8',
        linen: '#FAF7F3',
        ink: '#2E1F0E',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Nunito Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
