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
          dark: "#0B1120",
          card: "#111A2B",
          cardHover: "#1C2940",
          border: "#28354A",
          gold: "#B69249",
          green: "#6DDBA5",
          red: "#F28B82",
          blue: "#9BBCE3",
          textPrimary: "#EFF3FA",
          textSecondary: "#A4AEC1",
          textMuted: "#7F8DA4",
        },
      },
    },
  },
  plugins: [],
};
export default config;
