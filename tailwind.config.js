import colors from 'tailwindcss/colors'
import PrimeUI from 'tailwindcss-primeui';
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        ':root': {
          '--color-blue-500': colors.blue[500],
          '--color-orange-500': colors.orange[500],
          '--color-green-500': colors.green[500],
          '--color-red-500': colors.red[500],
          '--color-gray-100': colors.gray[100],
        }
      })
    },
    PrimeUI
  ]
}

