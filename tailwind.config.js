/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  safelist: [
    {
      pattern: /(bg|text|border|hover:bg|hover:text|hover:border)-(red|blue|green|yellow|orange|sky|indigo|purple|pink|lime|teal|cyan)-(100|200|300|400|500|600|700|800|900)/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}