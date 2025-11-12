/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,js}"],
    theme: {
      extend: {
        keyframes: {
          fadeIn: {
            "0%": { opacity: 0, transform: "translateY(10px)" },
            "100%": { opacity: 1, transform: "translateY(0)" }
          }
        },
        animation: { fadeIn: "fadeIn 0.7s ease-out both" }
      }
    },
    plugins: []
  };