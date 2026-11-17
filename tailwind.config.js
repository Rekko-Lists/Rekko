/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#FF9E00",
        "primary-dark": "#E89308",
        "grad-start": "#788397",
        "grad-end": "#212834",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "app-bg": "rgb(var(--app-bg) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        "border-light": "rgb(var(--border-light) / <alpha-value>)",
        "text-main": "rgb(var(--text-main) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        "status-green": "#4EBB22",
        "status-red": "#FF6464",
        "status-blue": "#2280BB",
      },
      fontFamily: {
        gabarito: ["Gabarito", "sans-serif"],
      },
      borderRadius: {
        card: "5px",
        btn: "10px",
        pill: "30px",
      },
      boxShadow: {
        card: "0 3px 7px rgba(0,0,0,0.25)",
        input: "inset 0 2px 4px rgba(0,0,0,0.25)",
        social: "0 0 2px rgba(0,0,0,0.70)",
      },
      backgroundImage: {
        "gradient-cta": "linear-gradient(180deg, #788397 0%, #212834 100%)",
        "gradient-banner": "linear-gradient(180deg, #FF7700 0%, #FF9E00 100%)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-150% 0" },
          "100%": { backgroundPosition: "150% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        rekko: {
          primary: "#FF9E00",
          secondary: "#788397",
          accent: "#E89308",
          neutral: "#212834",
          "base-100": "#F4F4F4",
          "base-200": "#FFFFFF",
          info: "#2280BB",
          success: "#4EBB22",
          warning: "#FF9E00",
          error: "#FF6464",
        },
      },
      {
        rekkoDark: {
          primary: "#FF9E00",
          secondary: "#aeb8c8",
          accent: "#E89308",
          neutral: "#212834",
          "base-100": "#181c23",
          "base-200": "#242a33",
          "base-300": "#343c48",
          "base-content": "#eceef2",
          info: "#65b6e9",
          success: "#76d952",
          warning: "#FF9E00",
          error: "#FF8080",
        },
      },
    ],
    darkTheme: false,
    logs: false,
  },
};
