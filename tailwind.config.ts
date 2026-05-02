import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "serif"],
      },
      colors: {
        brand: {
          orange: "#E8820C",
          blue: "#6BB5D6",
        },
      },
      keyframes: {
        paperEject: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-120%)", opacity: "0" },
        },
        paperLoad: {
          "0%": { transform: "translateY(-120%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "paper-eject": "paperEject 0.5s ease-in forwards",
        "paper-load": "paperLoad 0.5s ease-out forwards",
        "fade-out": "fadeOut 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
