import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          dark: "#0B0E14",
          card: "#161B22",
          cardHover: "#21262D",
          border: "#30363D",
          gold: "#FFB401",
          green: "#00C076",
          red: "#F85149",
          blue: "#388BFD",
          textPrimary: "#F0F6FC",
          textSecondary: "#8B949E",
          textMuted: "#6E7681",
        },
      },
    },
  },
  plugins: [],
};
export default config;
