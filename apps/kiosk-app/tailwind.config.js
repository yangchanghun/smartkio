/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        kakao: "#fee500",
        "kakao-brown": "#3c1e1e",
        "mission-cream": "#fffdf0",
      },
    },
  },
  plugins: [],
};
