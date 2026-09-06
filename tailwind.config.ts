import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-museo)", "Museo Sans", "sans-serif"],
        display: ["var(--font-display)", "Montserrat", "sans-serif"],
        serif: ["var(--font-serif)", "PT Serif", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
