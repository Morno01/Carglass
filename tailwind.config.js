/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8eef5',
          100: '#c5d4e6',
          200: '#9eb8d5',
          300: '#769cc4',
          400: '#5787b8',
          500: '#3872ab',
          600: '#2d5f96',
          700: '#214980',
          800: '#1e3a5f',
          900: '#152840',
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;
