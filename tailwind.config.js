/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF9E00",
        "primary-dark": "#E89308",
        "grad-start": "#788397",
        "grad-end": "#212834",
        surface: "#FFFFFF",
        "app-bg": "#F4F4F4",
        border: "#C5C5C5",
        "border-light": "#D9D9D9",
        "text-main": "#202020",
        "text-secondary": "#686868",
        "text-muted": "rgba(0,0,0,0.39)",
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
    ],
    darkTheme: false,
    logs: false,
  },
};
