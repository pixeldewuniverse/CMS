/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#534AB7",
        secondary: "#0F6E56",
        accent: "#F97316",
      },
    },
  },
  plugins: [],
};
