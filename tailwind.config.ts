import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        "4.5": "1.125rem",
      },
      colors: {
        accent: {
          DEFAULT: "#7C5CFF",
          light: "#9E86FF",
          dark: "#5B3CF0",
          soft: "rgba(124, 92, 255, 0.12)",
        },
        ink: {
          1000: "#050507",
          950: "#08080C",
          900: "#0C0C12",
          850: "#111118",
          800: "#16161F",
          750: "#1B1B26",
          700: "#23232F",
          600: "#2E2E3C",
        },
        blurple: "#5865F2",
        success: "#3BA55D",
        danger: "#ED4245",
        warning: "#FAA81A",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(124, 92, 255, 0.55)",
        card: "0 20px 60px -25px rgba(0, 0, 0, 0.85)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        fadeUp: "fadeUp .6s cubic-bezier(.21,.6,.35,1) both",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
