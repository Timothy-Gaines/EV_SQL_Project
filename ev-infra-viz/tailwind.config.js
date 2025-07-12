// Tailwind CSS configuration.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0D1117"
        },
        neonStart: "#00CFFF",
        neonEnd: "#BD00FF",
        neonA: "#00CFFF",
        neonB: "#BD00FF"
      },
      backdropBlur: {
        14: "14px"
      }
    }
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms")
  ]
}; 