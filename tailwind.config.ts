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
          dark: "#0C1411",
          card: "#121E18",
          cardHover: "#1E3026",
          border: "#2A3C31",
          gold: "#D5F478",
          green: "#6DDBA5",
          red: "#F28B82",
          blue: "#9BBCE3",
          textPrimary: "#F1F5EE",
          textSecondary: "#A4B3A7",
          textMuted: "#84988B",
        },
      },
    },
  },
  plugins: [],
};
export default config;
