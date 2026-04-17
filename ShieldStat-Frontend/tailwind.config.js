export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4338CA",
        "primary-dim": "#3730a3",
        "background-light": "#f6f6f8",
        "background-dark": "#14131f",
        surface: "#f7f9fb",
        "on-surface": "#2c3437",
        "on-surface-variant": "#596064",
        outline: "#747c80",
        "surface-container-low": "#f0f4f7",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e3e9ed",
      },
      fontFamily: {
        display: ["Manrope"],
        headline: ["Manrope"],
        body: ["Inter"],
        label: ["Inter"],
      },
    },
  },
  plugins: [],
};