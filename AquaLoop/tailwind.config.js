/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D0D12",
        accent: "#C9A84C",
        background: "#FAF8F5",
        "text-dark": "#2A2A35",
        "text-light": "#F0EFF4",
      },
      fontFamily: {
        heading: ["Inter", "sans-serif"],
        drama: ["Playfair Display", "serif"],
        data: ["JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        tight: "-0.02em",
        tighter: "-0.04em",
      }
    },
  },
  plugins: [],
}
